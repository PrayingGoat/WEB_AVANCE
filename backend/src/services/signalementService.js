/**
 * Service de gestion des signalements
 */

const { query, getClient } = require('../config/database');

/**
 * Récupérer les statistiques globales
 */
const getStats = async () => {
  const result = await query('SELECT * FROM v_stats_signalements');

  if (result.rows.length === 0) {
    return {
      totalSignalements: 0,
      nouveaux: 0,
      enCours: 0,
      termines: 0,
      surfaceTotale: 0,
      budgetTotal: 0,
      avancement: 0,
    };
  }

  const stats = result.rows[0];
  return {
    totalSignalements: parseInt(stats.total_signalements) || 0,
    nouveaux: parseInt(stats.nb_nouveaux) || 0,
    enCours: parseInt(stats.nb_en_cours) || 0,
    termines: parseInt(stats.nb_termines) || 0,
    surfaceTotale: parseFloat(stats.surface_totale_m2) || 0,
    budgetTotal: parseFloat(stats.budget_total) || 0,
    avancement: parseFloat(stats.avancement_pct) || 0,
  };
};

/**
 * Récupérer tous les signalements avec détails
 */
const getAllSignalements = async (filters = {}) => {
  let queryText = `
    SELECT * FROM v_signalements_details
    WHERE 1=1
  `;
  const values = [];
  let paramCount = 1;

  // Filtre par statut
  if (filters.statut) {
    queryText += ` AND statut = $${paramCount++}`;
    values.push(filters.statut);
  }

  // Filtre par utilisateur
  if (filters.userId) {
    queryText += ` AND id_utilisateur = $${paramCount++}`;
    values.push(filters.userId);
  }

  queryText += ' ORDER BY date_signalement DESC';

  // Pagination
  if (filters.limit) {
    queryText += ` LIMIT $${paramCount++}`;
    values.push(filters.limit);
  }

  if (filters.offset) {
    queryText += ` OFFSET $${paramCount++}`;
    values.push(filters.offset);
  }

  const result = await query(queryText, values);

  return result.rows.map(row => ({
    id: row.id_signalement,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    adresse: row.adresse,
    description: row.description,
    statut: row.statut,
    surfaceM2: row.surface_m2 ? parseFloat(row.surface_m2) : null,
    budget: row.budget ? parseFloat(row.budget) : null,
    dateSignalement: row.date_signalement,
    dateModification: row.date_modification,
    utilisateur: row.utilisateur_email ? {
      email: row.utilisateur_email,
      nom: row.utilisateur_nom,
      prenom: row.utilisateur_prenom,
    } : null,
    entreprise: row.entreprise_nom ? {
      nom: row.entreprise_nom,
      telephone: row.entreprise_telephone,
    } : null,
  }));
};

/**
 * Récupérer un signalement par ID
 */
const getSignalementById = async (id) => {
  const result = await query(
    'SELECT * FROM v_signalements_details WHERE id_signalement = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Signalement non trouvé');
  }

  const row = result.rows[0];
  return {
    id: row.id_signalement,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    adresse: row.adresse,
    description: row.description,
    statut: row.statut,
    surfaceM2: row.surface_m2 ? parseFloat(row.surface_m2) : null,
    budget: row.budget ? parseFloat(row.budget) : null,
    dateSignalement: row.date_signalement,
    dateModification: row.date_modification,
    utilisateur: row.utilisateur_email ? {
      email: row.utilisateur_email,
      nom: row.utilisateur_nom,
      prenom: row.utilisateur_prenom,
    } : null,
    entreprise: row.entreprise_nom ? {
      nom: row.entreprise_nom,
      telephone: row.entreprise_telephone,
    } : null,
  };
};

/**
 * Créer un nouveau signalement
 */
const createSignalement = async (data) => {
  const {
    latitude,
    longitude,
    adresse,
    description,
    surfaceM2,
    userId,
  } = data;

  const result = await query(
    `INSERT INTO signalement
      (latitude, longitude, adresse, description, surface_m2, id_utilisateur, statut)
     VALUES ($1, $2, $3, $4, $5, $6, 'NOUVEAU')
     RETURNING id_signalement, latitude, longitude, adresse, description, statut,
               surface_m2, date_signalement`,
    [latitude, longitude, adresse, description, surfaceM2, userId]
  );

  const row = result.rows[0];
  return {
    id: row.id_signalement,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    adresse: row.adresse,
    description: row.description,
    statut: row.statut,
    surfaceM2: row.surface_m2 ? parseFloat(row.surface_m2) : null,
    dateSignalement: row.date_signalement,
  };
};

/**
 * Mettre à jour un signalement
 */
const updateSignalement = async (id, data) => {
  const { statut, budget, surfaceM2, entrepriseId, adresse, description } = data;
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (statut !== undefined) {
    fields.push(`statut = $${paramCount++}`);
    values.push(statut);
  }

  if (budget !== undefined) {
    fields.push(`budget = $${paramCount++}`);
    values.push(budget);
  }

  if (surfaceM2 !== undefined) {
    fields.push(`surface_m2 = $${paramCount++}`);
    values.push(surfaceM2);
  }

  if (entrepriseId !== undefined) {
    fields.push(`id_entreprise = $${paramCount++}`);
    values.push(entrepriseId);
  }

  if (adresse !== undefined) {
    fields.push(`adresse = $${paramCount++}`);
    values.push(adresse);
  }

  if (description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(description);
  }

  // Gérer les dates de travaux selon le statut
  if (statut === 'EN_COURS') {
    fields.push(`date_debut_travaux = COALESCE(date_debut_travaux, NOW())`);
  } else if (statut === 'TERMINE') {
    fields.push(`date_fin_travaux = NOW()`);
  }

  if (fields.length === 0) {
    throw new Error('Aucune donnée à mettre à jour');
  }

  values.push(id);

  const result = await query(
    `UPDATE signalement
     SET ${fields.join(', ')}
     WHERE id_signalement = $${paramCount}
     RETURNING id_signalement, latitude, longitude, adresse, description,
               statut, surface_m2, budget, date_modification`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error('Signalement non trouvé');
  }

  const row = result.rows[0];
  return {
    id: row.id_signalement,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    adresse: row.adresse,
    description: row.description,
    statut: row.statut,
    surfaceM2: row.surface_m2 ? parseFloat(row.surface_m2) : null,
    budget: row.budget ? parseFloat(row.budget) : null,
    dateModification: row.date_modification,
  };
};

/**
 * Supprimer un signalement
 */
const deleteSignalement = async (id) => {
  const result = await query(
    'DELETE FROM signalement WHERE id_signalement = $1 RETURNING id_signalement',
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Signalement non trouvé');
  }

  return { id: result.rows[0].id_signalement };
};

/**
 * Récupérer la liste des entreprises
 */
const getEntreprises = async () => {
  const result = await query(
    'SELECT id_entreprise, nom, telephone, email, adresse FROM entreprise ORDER BY nom'
  );

  return result.rows.map(row => ({
    id: row.id_entreprise,
    nom: row.nom,
    telephone: row.telephone,
    email: row.email,
    adresse: row.adresse,
  }));
};

/**
 * Récupérer tous les utilisateurs
 */
const getAllUsers = async () => {
  const result = await query(
    `SELECT id_utilisateur, email, nom, prenom, role, est_bloque,
            tentatives_connexion, date_creation
     FROM utilisateur
     ORDER BY date_creation DESC`
  );

  return result.rows.map(row => ({
    id: row.id_utilisateur,
    email: row.email,
    nom: row.nom,
    prenom: row.prenom,
    role: row.role,
    estBloque: row.est_bloque,
    tentatives: row.tentatives_connexion,
    dateCreation: row.date_creation,
  }));
};

/**
 * Compter les utilisateurs
 */
const countUsers = async () => {
  const result = await query('SELECT COUNT(*) as count FROM utilisateur');
  return parseInt(result.rows[0].count);
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
  countUsers,
};
