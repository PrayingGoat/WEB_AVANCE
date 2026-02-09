/**
 * Routes de synchronisation Firebase
 */

const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const { authenticate, requireManager } = require('../middleware/auth');

/**
 * @swagger
 * /api/sync/status:
 *   get:
 *     summary: Vérifier le statut de Firebase
 *     tags: [Synchronisation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statut Firebase
 */
router.get('/status', authenticate, getManagerOrStatus);

/**
 * Middleware pour permettre à tous les utilisateurs authentifiés de voir le statut
 */
function getManagerOrStatus(req, res) {
  return syncController.getStatus(req, res);
}

/**
 * @swagger
 * /api/sync:
 *   post:
 *     summary: Synchronisation complète PostgreSQL vers Firestore
 *     tags: [Synchronisation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Synchronisation réussie
 *       403:
 *         description: Accès réservé aux managers
 */
router.post('/', authenticate, requireManager, syncController.syncAll);

/**
 * @swagger
 * /api/sync/signalements:
 *   post:
 *     summary: Synchroniser les signalements vers Firestore
 *     tags: [Synchronisation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Signalements synchronisés
 */
router.post('/signalements', authenticate, requireManager, syncController.syncSignalements);

/**
 * @swagger
 * /api/sync/users:
 *   post:
 *     summary: Synchroniser les utilisateurs vers Firestore
 *     tags: [Synchronisation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateurs synchronisés
 */
router.post('/users', authenticate, requireManager, syncController.syncUsers);

module.exports = router;
