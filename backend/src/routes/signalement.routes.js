/**
 * Routes des signalements
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const signalementController = require('../controllers/signalementController');
const { authenticate, requireManager, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

/**
 * Validation pour la création de signalement
 */
const createValidation = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude invalide'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude invalide'),
  body('adresse')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Adresse trop longue'),
  body('description')
    .optional()
    .trim(),
  body('surfaceM2')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Surface invalide'),
];

/**
 * Validation pour la mise à jour de signalement
 */
const updateValidation = [
  body('statut')
    .optional()
    .isIn(['NOUVEAU', 'EN_COURS', 'TERMINE'])
    .withMessage('Statut invalide'),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget invalide'),
  body('surfaceM2')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Surface invalide'),
  body('entrepriseId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID entreprise invalide'),
  body('adresse')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Adresse trop longue'),
  body('description')
    .optional()
    .trim(),
];

/**
 * Validation pour l'ID de signalement
 */
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de signalement invalide'),
];

// ============================================
// Routes publiques
// ============================================

/**
 * GET /api/signalements
 * Récupérer tous les signalements (public)
 */
router.get(
  '/',
  signalementController.getAllSignalements
);

/**
 * GET /api/signalements/stats
 * Récupérer les statistiques (public)
 */
router.get(
  '/stats',
  signalementController.getStats
);

/**
 * GET /api/signalements/entreprises
 * Récupérer la liste des entreprises (public)
 */
router.get(
  '/entreprises',
  signalementController.getEntreprises
);

/**
 * GET /api/signalements/:id
 * Récupérer un signalement par ID (public)
 */
router.get(
  '/:id',
  idValidation,
  validate,
  signalementController.getSignalementById
);

// ============================================
// Routes protégées (authentification requise)
// ============================================

/**
 * POST /api/signalements
 * Créer un nouveau signalement (authentifié)
 */
router.post(
  '/',
  optionalAuth,
  createValidation,
  validate,
  signalementController.createSignalement
);

// ============================================
// Routes réservées aux managers
// ============================================

/**
 * PUT /api/signalements/:id
 * Mettre à jour un signalement (managers uniquement)
 */
router.put(
  '/:id',
  authenticate,
  requireManager,
  idValidation,
  updateValidation,
  validate,
  signalementController.updateSignalement
);

/**
 * DELETE /api/signalements/:id
 * Supprimer un signalement (managers uniquement)
 */
router.delete(
  '/:id',
  authenticate,
  requireManager,
  idValidation,
  validate,
  signalementController.deleteSignalement
);

/**
 * GET /api/signalements/admin/users
 * Récupérer tous les utilisateurs (managers uniquement)
 */
router.get(
  '/admin/users',
  authenticate,
  requireManager,
  signalementController.getAllUsers
);

module.exports = router;
