/**
 * Contrôleur de synchronisation Firebase
 */

const firebaseSyncService = require('../services/firebaseSyncService');

/**
 * Synchronisation complète PostgreSQL -> Firestore
 * POST /api/sync
 */
const syncAll = async (req, res) => {
  try {
    console.log('Synchronisation Firebase démarrée par:', req.user.email);

    const results = await firebaseSyncService.syncAllToFirestore();

    res.json({
      success: true,
      message: 'Synchronisation terminée avec succès',
      data: results,
    });
  } catch (error) {
    console.error('Erreur synchronisation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la synchronisation',
    });
  }
};

/**
 * Synchroniser uniquement les signalements
 * POST /api/sync/signalements
 */
const syncSignalements = async (req, res) => {
  try {
    const results = await firebaseSyncService.syncSignalementsToFirestore();

    res.json({
      success: true,
      message: `${results.syncCount} signalement(s) synchronisé(s)`,
      data: results,
    });
  } catch (error) {
    console.error('Erreur sync signalements:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Synchroniser uniquement les utilisateurs
 * POST /api/sync/users
 */
const syncUsers = async (req, res) => {
  try {
    const results = await firebaseSyncService.syncUsersToFirestore();

    res.json({
      success: true,
      message: `${results.syncCount} utilisateur(s) synchronisé(s)`,
      data: results,
    });
  } catch (error) {
    console.error('Erreur sync utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Vérifier le statut de Firebase
 * GET /api/sync/status
 */
const getStatus = async (req, res) => {
  try {
    const status = await firebaseSyncService.getFirebaseStatus();

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  syncAll,
  syncSignalements,
  syncUsers,
  getStatus,
};
