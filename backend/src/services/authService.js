/**
 * Service d'authentification
 * Gère la logique métier pour l'authentification avec basculement Firebase/PostgreSQL
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query, getClient } = require('../config/database');
const { getAuth, isFirebaseAvailable, checkInternetConnectivity } = require('../config/firebase');

const SALT_ROUNDS = 10;

/**
 * Récupère les paramètres système
 */
const getSystemParams = async () => {
  const result = await query(
    'SELECT cle, valeur FROM parametre_systeme WHERE cle IN ($1, $2, $3)',
    ['max_tentatives_connexion', 'duree_session_heures', 'duree_blocage_heures']
  );

  const params = {};
  result.rows.forEach(row => {
    params[row.cle] = parseInt(row.valeur);
  });

  return {
    maxLoginAttempts: params.max_tentatives_connexion || 3,
    sessionDurationHours: params.duree_session_heures || 24,
    lockTimeHours: params.duree_blocage_heures || 24,
  };
};

/**
 * Inscription d'un nouvel utilisateur
 */
const register = async (userData) => {
  const { email, password, nom, prenom, role = 'USER' } = userData;
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Vérifier si l'email existe déjà
    const existingUser = await client.query(
      'SELECT id_utilisateur FROM utilisateur WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Tenter l'inscription sur Firebase si disponible
    let firebaseUid = null;
    if (isFirebaseAvailable() && await checkInternetConnectivity()) {
      try {
        const auth = getAuth();
        const firebaseUser = await auth.createUser({
          email,
          password,
          displayName: `${prenom} ${nom}`,
        });
        firebaseUid = firebaseUser.uid;
      } catch (firebaseError) {
        console.warn('Firebase registration failed, continuing with PostgreSQL:', firebaseError.message);
      }
    }

    // Créer l'utilisateur en base PostgreSQL
    const result = await client.query(
      `INSERT INTO utilisateur (email, password_hash, nom, prenom, role, firebase_uid)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_utilisateur, email, nom, prenom, role, date_creation`,
      [email, passwordHash, nom, prenom, role, firebaseUid]
    );

    await client.query('COMMIT');

    const user = result.rows[0];
    return {
      id: user.id_utilisateur,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      dateCreation: user.date_creation,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Connexion d'un utilisateur
 */
const login = async (email, password, ipAddress, userAgent) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Récupérer l'utilisateur
    const userResult = await client.query(
      `SELECT id_utilisateur, email, password_hash, nom, prenom, role,
              est_bloque, tentatives_connexion, date_blocage
       FROM utilisateur
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const user = userResult.rows[0];
    const params = await getSystemParams();

    // Vérifier si le compte est bloqué
    if (user.est_bloque) {
      const lockTime = new Date(user.date_blocage);
      lockTime.setHours(lockTime.getHours() + params.lockTimeHours);

      if (new Date() < lockTime) {
        const hoursRemaining = Math.ceil((lockTime - new Date()) / (1000 * 60 * 60));
        throw new Error(`Compte bloqué. Réessayez dans ${hoursRemaining}h ou contactez un administrateur.`);
      } else {
        // Débloquer automatiquement après la période
        await client.query(
          `UPDATE utilisateur
           SET est_bloque = false, tentatives_connexion = 0, date_blocage = NULL
           WHERE id_utilisateur = $1`,
          [user.id_utilisateur]
        );
        user.est_bloque = false;
        user.tentatives_connexion = 0;
      }
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Incrémenter le compteur de tentatives
      const newAttempts = user.tentatives_connexion + 1;

      if (newAttempts >= params.maxLoginAttempts) {
        // Bloquer le compte
        await client.query(
          `UPDATE utilisateur
           SET est_bloque = true, tentatives_connexion = $1, date_blocage = NOW()
           WHERE id_utilisateur = $2`,
          [newAttempts, user.id_utilisateur]
        );

        await client.query('COMMIT');
        throw new Error(`Trop de tentatives échouées. Votre compte est bloqué pour ${params.lockTimeHours}h.`);
      } else {
        await client.query(
          'UPDATE utilisateur SET tentatives_connexion = $1 WHERE id_utilisateur = $2',
          [newAttempts, user.id_utilisateur]
        );

        await client.query('COMMIT');
        const attemptsLeft = params.maxLoginAttempts - newAttempts;
        throw new Error(`Email ou mot de passe incorrect. ${attemptsLeft} tentative(s) restante(s).`);
      }
    }

    // Réinitialiser le compteur de tentatives en cas de succès
    if (user.tentatives_connexion > 0) {
      await client.query(
        'UPDATE utilisateur SET tentatives_connexion = 0 WHERE id_utilisateur = $1',
        [user.id_utilisateur]
      );
    }

    // Créer le token JWT
    const tokenPayload = {
      id: user.id_utilisateur,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Calculer la date d'expiration
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + params.sessionDurationHours);

    // Créer la session en base
    await client.query(
      `INSERT INTO session (id_utilisateur, token, ip_address, user_agent, date_expiration)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id_utilisateur, token, ipAddress, userAgent, expirationDate]
    );

    await client.query('COMMIT');

    return {
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      user: {
        id: user.id_utilisateur,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Déconnexion d'un utilisateur
 */
const logout = async (token) => {
  await query(
    'UPDATE session SET est_active = false WHERE token = $1',
    [token]
  );
};

/**
 * Récupérer les informations d'un utilisateur
 */
const getUserById = async (userId) => {
  const result = await query(
    `SELECT id_utilisateur, email, nom, prenom, role, est_bloque, date_creation, date_modification
     FROM utilisateur
     WHERE id_utilisateur = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Utilisateur non trouvé');
  }

  const user = result.rows[0];
  return {
    id: user.id_utilisateur,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role,
    estBloque: user.est_bloque,
    dateCreation: user.date_creation,
    dateModification: user.date_modification,
  };
};

/**
 * Mettre à jour les informations d'un utilisateur
 */
const updateUser = async (userId, updateData) => {
  const { nom, prenom, email } = updateData;
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (nom !== undefined) {
    fields.push(`nom = $${paramCount++}`);
    values.push(nom);
  }

  if (prenom !== undefined) {
    fields.push(`prenom = $${paramCount++}`);
    values.push(prenom);
  }

  if (email !== undefined) {
    // Vérifier que l'email n'est pas déjà utilisé
    const existingUser = await query(
      'SELECT id_utilisateur FROM utilisateur WHERE email = $1 AND id_utilisateur != $2',
      [email, userId]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Cet email est déjà utilisé');
    }

    fields.push(`email = $${paramCount++}`);
    values.push(email);
  }

  if (fields.length === 0) {
    throw new Error('Aucune donnée à mettre à jour');
  }

  values.push(userId);

  const result = await query(
    `UPDATE utilisateur
     SET ${fields.join(', ')}
     WHERE id_utilisateur = $${paramCount}
     RETURNING id_utilisateur, email, nom, prenom, role, date_modification`,
    values
  );

  const user = result.rows[0];
  return {
    id: user.id_utilisateur,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role,
    dateModification: user.date_modification,
  };
};

/**
 * Débloquer un utilisateur (réservé aux managers)
 */
const unblockUser = async (userId) => {
  const result = await query(
    `UPDATE utilisateur
     SET est_bloque = false, tentatives_connexion = 0, date_blocage = NULL
     WHERE id_utilisateur = $1
     RETURNING id_utilisateur, email, nom, prenom`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Utilisateur non trouvé');
  }

  return result.rows[0];
};

/**
 * Lister tous les utilisateurs bloqués
 */
const getBlockedUsers = async () => {
  const result = await query(
    `SELECT id_utilisateur, email, nom, prenom, role, tentatives_connexion, date_blocage
     FROM utilisateur
     WHERE est_bloque = true
     ORDER BY date_blocage DESC`
  );

  return result.rows.map(user => ({
    id: user.id_utilisateur,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role,
    tentatives: user.tentatives_connexion,
    dateBlocage: user.date_blocage,
  }));
};

module.exports = {
  register,
  login,
  logout,
  getUserById,
  updateUser,
  unblockUser,
  getBlockedUsers,
  getSystemParams,
};