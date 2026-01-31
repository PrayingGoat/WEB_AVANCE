/**
 * Middleware d'authentification JWT
 */

const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * Vérifie le token JWT et authentifie l'utilisateur
 */
const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
      });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier que la session existe et est active
    const sessionResult = await query(
      `SELECT s.*, u.email, u.nom, u.prenom, u.role, u.est_bloque
       FROM session s
       JOIN utilisateur u ON s.id_utilisateur = u.id_utilisateur
       WHERE s.token = $1
         AND s.est_active = true
         AND s.date_expiration > NOW()`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Session invalide ou expirée',
      });
    }

    const session = sessionResult.rows[0];

    // Vérifier que l'utilisateur n'est pas bloqué
    if (session.est_bloque) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte est bloqué. Contactez un administrateur.',
      });
    }

    // Mettre à jour la dernière activité
    await query(
      'UPDATE session SET date_derniere_activite = NOW() WHERE id_session = $1',
      [session.id_session]
    );

    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      id: session.id_utilisateur,
      email: session.email,
      nom: session.nom,
      prenom: session.prenom,
      role: session.role,
      sessionId: session.id_session,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification',
    });
  }
};

/**
 * Vérifie que l'utilisateur a le rôle MANAGER
 */
const requireManager = (req, res, next) => {
  if (req.user.role !== 'MANAGER') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux managers',
    });
  }
  next();
};

/**
 * Middleware optionnel : authentifie si un token est présent
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Pas de token, continuer sans authentification
    req.user = null;
    return next();
  }

  // Token présent, tenter l'authentification
  await authenticate(req, res, next);
};

module.exports = {
  authenticate,
  requireManager,
  optionalAuth,
};