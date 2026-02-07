import api from './api';

/**
 * Récupérer les statistiques du dashboard
 */
export const getStats = async () => {
  const response = await api.get('/api/signalements/stats');
  return response.data.data;
};

/**
 * Récupérer tous les signalements
 */
export const getAllSignalements = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.statut) params.append('statut', filters.statut);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);

  const response = await api.get(`/api/signalements?${params.toString()}`);
  return response.data.data;
};

/**
 * Récupérer un signalement par ID
 */
export const getSignalementById = async (id) => {
  const response = await api.get(`/api/signalements/${id}`);
  return response.data.data;
};

/**
 * Créer un nouveau signalement
 */
export const createSignalement = async (data) => {
  const response = await api.post('/api/signalements', data);
  return response.data.data;
};

/**
 * Mettre à jour un signalement
 */
export const updateSignalement = async (id, data) => {
  const response = await api.put(`/api/signalements/${id}`, data);
  return response.data.data;
};

/**
 * Supprimer un signalement
 */
export const deleteSignalement = async (id) => {
  const response = await api.delete(`/api/signalements/${id}`);
  return response.data;
};

/**
 * Récupérer la liste des entreprises
 */
export const getEntreprises = async () => {
  const response = await api.get('/api/signalements/entreprises');
  return response.data.data;
};

/**
 * Récupérer tous les utilisateurs (admin)
 */
export const getAllUsers = async () => {
  const response = await api.get('/api/signalements/admin/users');
  return response.data.data;
};

/**
 * Récupérer les utilisateurs bloqués
 */
export const getBlockedUsers = async () => {
  const response = await api.get('/api/auth/blocked-users');
  return response.data.data;
};

/**
 * Débloquer un utilisateur
 */
export const unblockUser = async (userId) => {
  const response = await api.post(`/api/auth/unblock/${userId}`);
  return response.data;
};

/**
 * Créer un nouvel utilisateur
 */
export const createUser = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data.data;
};
