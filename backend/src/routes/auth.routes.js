/**
 * Routes d'authentification
 */

const express = require('express');
const { body, param } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate, requireManager } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

/**
 * Validation pour l'inscription
 */
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis'),
  body('prenom')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis'),
  body('role')
    .optional()
    .isIn(['MANAGER', 'USER'])
    .withMessage('Rôle invalide (MANAGER ou USER uniquement)'),
];

/**
 * Validation pour la connexion
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
];

/**
 * Validation pour la mise à jour
 */
const updateValidation = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('nom')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Le nom ne peut pas être vide'),
  body('prenom')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Le prénom ne peut pas être vide'),
];

/**
 * Validation pour l'ID utilisateur
 */
const userIdValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('ID utilisateur invalide'),
];

// ============================================
// Routes publiques
// ============================================

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post(
  '/register',
  registerValidation,
  validate,
  authController.register
);

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post(
  '/login',
  loginValidation,
  validate,
  authController.login
);

// ============================================
// Routes protégées (authentification requise)
// ============================================

/**
 * POST /api/auth/logout
 * Déconnexion de l'utilisateur courant
 */
router.post(
  '/logout',
  authenticate,
  authController.logout
);

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

/**
 * PUT /api/auth/me
 * Mettre à jour les informations de l'utilisateur connecté
 */
router.put(
  '/me',
  authenticate,
  updateValidation,
  validate,
  authController.updateCurrentUser
);

// ============================================
// Routes réservées aux managers
// ============================================

/**
 * GET /api/auth/blocked-users
 * Lister tous les utilisateurs bloqués
 */
router.get(
  '/blocked-users',
  authenticate,
  requireManager,
  authController.getBlockedUsers
);

/**
 * POST /api/auth/unblock/:userId
 * Débloquer un utilisateur
 */
router.post(
  '/unblock/:userId',
  authenticate,
  requireManager,
  userIdValidation,
  validate,
  authController.unblockUser
);

module.exports = router;