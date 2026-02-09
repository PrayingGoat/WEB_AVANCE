/**
 * Service de synchronisation Firebase/Firestore
 * Gère la synchronisation bidirectionnelle entre PostgreSQL et Firestore
 */

const { getFirestore, isFirebaseAvailable, checkInternetConnectivity } = require('../config/firebase');
const { query } = require('../config/database');

/**
 * Synchroniser tous les signalements PostgreSQL vers Firestore
 */
const syncSignalementsToFirestore = async () => {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase n\'est pas configuré. Veuillez renseigner les credentials Firebase dans le fichier .env');
  }

  const isOnline = await checkInternetConnectivity();
  if (!isOnline) {
    throw new Error('Pas de connexion Internet. Impossible de synchroniser avec Firebase.');
  }

  const db = getFirestore();
  const batch = db.batch();

  // Récupérer tous les signalements depuis PostgreSQL
  const result = await query(`
    SELECT s.*,
           u.email as utilisateur_email, u.nom as utilisateur_nom, u.prenom as utilisateur_prenom,
           e.nom as entreprise_nom, e.telephone as entreprise_telephone
    FROM signalement s
    LEFT JOIN utilisateur u ON s.id_utilisateur = u.id_utilisateur
    LEFT JOIN entreprise e ON s.id_entreprise = e.id_entreprise
    ORDER BY s.date_signalement DESC
  `);

  let syncCount = 0;

  for (const row of result.rows) {
    const docId = row.firebase_id || `signalement_${row.id_signalement}`;
    const docRef = db.collection('signalements').doc(docId);

    const firestoreData = {
      id_signalement: row.id_signalement,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      adresse: row.adresse || '',
      description: row.description || '',
      statut: row.statut,
      surface_m2: row.surface_m2 ? parseFloat(row.surface_m2) : null,
      budget: row.budget ? parseFloat(row.budget) : null,
      date_signalement: row.date_signalement ? row.date_signalement.toISOString() : null,
      date_modification: row.date_modification ? row.date_modification.toISOString() : null,
      date_debut_travaux: row.date_debut_travaux ? row.date_debut_travaux.toISOString() : null,
      date_fin_travaux: row.date_fin_travaux ? row.date_fin_travaux.toISOString() : null,
      utilisateur: row.utilisateur_email ? {
        email: row.utilisateur_email,
        nom: row.utilisateur_nom,
        prenom: row.utilisateur_prenom,
      } : null,
      entreprise: row.entreprise_nom ? {
        nom: row.entreprise_nom,
        telephone: row.entreprise_telephone,
      } : null,
      synced_at: new Date().toISOString(),
    };

    batch.set(docRef, firestoreData, { merge: true });
    syncCount++;

    // Mettre à jour le firebase_id dans PostgreSQL si nécessaire
    if (!row.firebase_id) {
      await query(
        'UPDATE signalement SET firebase_id = $1 WHERE id_signalement = $2',
        [docId, row.id_signalement]
      );
    }
  }

  // Exécuter le batch
  if (syncCount > 0) {
    await batch.commit();
  }

  return { syncCount };
};

/**
 * Synchroniser tous les utilisateurs PostgreSQL vers Firestore
 */
const syncUsersToFirestore = async () => {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase n\'est pas configuré');
  }

  const isOnline = await checkInternetConnectivity();
  if (!isOnline) {
    throw new Error('Pas de connexion Internet');
  }

  const db = getFirestore();
  const batch = db.batch();

  const result = await query(`
    SELECT id_utilisateur, email, nom, prenom, role, firebase_uid,
           est_bloque, date_creation
    FROM utilisateur
    ORDER BY date_creation DESC
  `);

  let syncCount = 0;

  for (const row of result.rows) {
    const docId = row.firebase_uid || `user_${row.id_utilisateur}`;
    const docRef = db.collection('utilisateurs').doc(docId);

    const firestoreData = {
      id_utilisateur: row.id_utilisateur,
      email: row.email,
      nom: row.nom,
      prenom: row.prenom,
      role: row.role,
      est_bloque: row.est_bloque,
      date_creation: row.date_creation ? row.date_creation.toISOString() : null,
      synced_at: new Date().toISOString(),
    };

    batch.set(docRef, firestoreData, { merge: true });
    syncCount++;
  }

  if (syncCount > 0) {
    await batch.commit();
  }

  return { syncCount };
};

/**
 * Synchroniser les statistiques vers Firestore
 */
const syncStatsToFirestore = async () => {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase n\'est pas configuré');
  }

  const db = getFirestore();

  const result = await query('SELECT * FROM v_stats_signalements');
  const stats = result.rows[0];

  const statsData = {
    total_signalements: parseInt(stats.total_signalements) || 0,
    nb_nouveaux: parseInt(stats.nb_nouveaux) || 0,
    nb_en_cours: parseInt(stats.nb_en_cours) || 0,
    nb_termines: parseInt(stats.nb_termines) || 0,
    surface_totale_m2: parseFloat(stats.surface_totale_m2) || 0,
    budget_total: parseFloat(stats.budget_total) || 0,
    avancement_pct: parseFloat(stats.avancement_pct) || 0,
    synced_at: new Date().toISOString(),
  };

  await db.collection('stats').doc('global').set(statsData, { merge: true });

  return statsData;
};

/**
 * Synchronisation complète PostgreSQL -> Firestore
 */
const syncAllToFirestore = async () => {
  const results = {
    signalements: { syncCount: 0 },
    utilisateurs: { syncCount: 0 },
    stats: null,
    timestamp: new Date().toISOString(),
  };

  // Sync signalements
  results.signalements = await syncSignalementsToFirestore();

  // Sync utilisateurs
  results.utilisateurs = await syncUsersToFirestore();

  // Sync stats
  results.stats = await syncStatsToFirestore();

  return results;
};

/**
 * Écrire un signalement individuel vers Firestore (appelé lors du CRUD)
 */
const syncSingleSignalement = async (signalementData) => {
  if (!isFirebaseAvailable()) return null;

  try {
    const isOnline = await checkInternetConnectivity();
    if (!isOnline) return null;

    const db = getFirestore();
    const docId = signalementData.firebaseId || `signalement_${signalementData.id}`;
    const docRef = db.collection('signalements').doc(docId);

    await docRef.set({
      id_signalement: signalementData.id,
      latitude: signalementData.latitude,
      longitude: signalementData.longitude,
      adresse: signalementData.adresse || '',
      description: signalementData.description || '',
      statut: signalementData.statut,
      surface_m2: signalementData.surfaceM2 || null,
      budget: signalementData.budget || null,
      date_signalement: signalementData.dateSignalement || new Date().toISOString(),
      synced_at: new Date().toISOString(),
    }, { merge: true });

    return docId;
  } catch (error) {
    console.warn('Erreur sync Firestore (signalement):', error.message);
    return null;
  }
};

/**
 * Supprimer un signalement de Firestore
 */
const deleteSingleSignalement = async (signalementId, firebaseId) => {
  if (!isFirebaseAvailable()) return;

  try {
    const isOnline = await checkInternetConnectivity();
    if (!isOnline) return;

    const db = getFirestore();
    const docId = firebaseId || `signalement_${signalementId}`;
    await db.collection('signalements').doc(docId).delete();
  } catch (error) {
    console.warn('Erreur suppression Firestore:', error.message);
  }
};

/**
 * Vérifier le statut Firebase
 */
const getFirebaseStatus = async () => {
  const available = isFirebaseAvailable();
  let online = false;

  if (available) {
    online = await checkInternetConnectivity();
  }

  return {
    configured: available,
    online,
    message: !available
      ? 'Firebase non configuré (credentials manquants dans .env)'
      : online
        ? 'Firebase connecté et opérationnel'
        : 'Firebase configuré mais pas de connexion Internet',
  };
};

module.exports = {
  syncSignalementsToFirestore,
  syncUsersToFirestore,
  syncStatsToFirestore,
  syncAllToFirestore,
  syncSingleSignalement,
  deleteSingleSignalement,
  getFirebaseStatus,
};
