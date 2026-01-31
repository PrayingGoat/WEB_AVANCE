/**
 * Contrôleur d'authentification
 */

const authService = require('../services/authService');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Inscription réussie
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'inscription',
    });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Connexion réussie
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     expiresIn:
 *                       type: string
 *                       example: 24h
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Identifiants invalides
 *       403:
 *         description: Compte bloqué
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.login(email, password, ipAddress, userAgent);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: result,
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error.message.includes('bloqué')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la connexion',
    });
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion d'un utilisateur
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       401:
 *         description: Non authentifié
 */
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.substring(7);
    await authService.logout(token);

    res.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion',
    });
  }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations',
    });
  }
};

/**
 * @swagger
 * /api/auth/me:
 *   put:
 *     summary: Mettre à jour les informations de l'utilisateur connecté
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Informations mises à jour
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 */
const updateCurrentUser = async (req, res) => {
  try {
    const user = await authService.updateUser(req.user.id, req.body);

    res.json({
      success: true,
      message: 'Informations mises à jour avec succès',
      data: user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour',
    });
  }
};

/**
 * @swagger
 * /api/auth/unblock/{userId}:
 *   post:
 *     summary: Débloquer un utilisateur (Managers uniquement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à débloquer
 *     responses:
 *       200:
 *         description: Utilisateur débloqué
 *       403:
 *         description: Accès refusé (réservé aux managers)
 *       404:
 *         description: Utilisateur non trouvé
 */
const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await authService.unblockUser(userId);

    res.json({
      success: true,
      message: 'Utilisateur débloqué avec succès',
      data: user,
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors du déblocage',
    });
  }
};

/**
 * @swagger
 * /api/auth/blocked-users:
 *   get:
 *     summary: Lister tous les utilisateurs bloqués (Managers uniquement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs bloqués
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Accès refusé (réservé aux managers)
 */
const getBlockedUsers = async (req, res) => {
  try {
    const users = await authService.getBlockedUsers();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs bloqués',
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateCurrentUser,
  unblockUser,
  getBlockedUsers,
};