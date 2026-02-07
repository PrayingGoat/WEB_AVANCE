// Utilitaires d'authentification

/**
 * Parse JSON de manière sécurisée
 * Retourne null si le parsing échoue
 */
export const safeJsonParse = (str) => {
  if (!str || str === 'undefined' || str === 'null' || str === '') {
    return null;
  }
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

/**
 * Récupérer l'utilisateur depuis le localStorage
 */
export const getStoredUser = () => {
  const userData = localStorage.getItem('user');
  return safeJsonParse(userData);
};

/**
 * Récupérer le token depuis le localStorage
 */
export const getStoredToken = () => {
  const token = localStorage.getItem('token');
  if (!token || token === 'undefined' || token === 'null' || token === '') {
    return null;
  }
  return token;
};

/**
 * Vérifier si l'utilisateur est authentifié
 */
export const isAuthenticated = () => {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!(token && user && user.email);
};

/**
 * Sauvegarder les données d'authentification
 */
export const saveAuth = (token, user) => {
  if (token) localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Supprimer les données d'authentification
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
