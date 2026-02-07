/**
 * Contrôleur des signalements
 */

const signalementService = require('../services/signalementService');

/**
 * Récupérer les statistiques
 */
const getStats = async (req, res) => {
  try {
    const stats = await signalementService.getStats();
    const userCount = await signalementService.countUsers();

    res.json({
      success: true,
      data: {
        ...stats,
        totalUtilisateurs: userCount,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
    });
  }
};

/**
 * Récupérer tous les signalements
 */
const getAllSignalements = async (req, res) => {
  try {
    const { statut, limit, offset } = req.query;
    const filters = {
      statut,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const signalements = await signalementService.getAllSignalements(filters);

    res.json({
      success: true,
      data: signalements,
      count: signalements.length,
    });
  } catch (error) {
    console.error('Get all signalements error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des signalements',
    });
  }
};

/**
 * Récupérer un signalement par ID
 */
const getSignalementById = async (req, res) => {
  try {
    const { id } = req.params;
    const signalement = await signalementService.getSignalementById(id);

    res.json({
      success: true,
      data: signalement,
    });
  } catch (error) {
    console.error('Get signalement error:', error);

    if (error.message === 'Signalement non trouvé') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du signalement',
    });
  }
};

/**
 * Créer un nouveau signalement
 */
const createSignalement = async (req, res) => {
  try {
    const data = {
      ...req.body,
      userId: req.user?.id,
    };

    const signalement = await signalementService.createSignalement(data);

    res.status(201).json({
      success: true,
      message: 'Signalement créé avec succès',
      data: signalement,
    });
  } catch (error) {
    console.error('Create signalement error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création du signalement',
    });
  }
};

/**
 * Mettre à jour un signalement
 */
const updateSignalement = async (req, res) => {
  try {
    const { id } = req.params;
    const signalement = await signalementService.updateSignalement(id, req.body);

    res.json({
      success: true,
      message: 'Signalement mis à jour avec succès',
      data: signalement,
    });
  } catch (error) {
    console.error('Update signalement error:', error);

    if (error.message === 'Signalement non trouvé') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du signalement',
    });
  }
};

/**
 * Supprimer un signalement
 */
const deleteSignalement = async (req, res) => {
  try {
    const { id } = req.params;
    await signalementService.deleteSignalement(id);

    res.json({
      success: true,
      message: 'Signalement supprimé avec succès',
    });
  } catch (error) {
    console.error('Delete signalement error:', error);

    if (error.message === 'Signalement non trouvé') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du signalement',
    });
  }
};

/**
 * Récupérer la liste des entreprises
 */
const getEntreprises = async (req, res) => {
  try {
    const entreprises = await signalementService.getEntreprises();

    res.json({
      success: true,
      data: entreprises,
    });
  } catch (error) {
    console.error('Get entreprises error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des entreprises',
    });
  }
};

/**
 * Récupérer tous les utilisateurs
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await signalementService.getAllUsers();

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
    });
  }
};

module.exports = {
  getStats,
  getAllSignalements,
  getSignalementById,
  createSignalement,
  updateSignalement,
  deleteSignalement,
  getEntreprises,
  getAllUsers,
};
