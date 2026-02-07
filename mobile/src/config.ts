// Configuration de l'application mobile

// URL de l'API backend
// En développement, utiliser localhost
// En production, remplacer par l'URL du serveur
export const API_URL = import.meta.env.VITE_API_URL || 'http://10.0.2.2:3000';

// Coordonnées par défaut (Antananarivo)
export const DEFAULT_COORDS = {
  lat: -18.8792,
  lng: 47.5079,
  zoom: 13
};

// Configuration des tuiles de carte
export const TILE_SERVER_URL = import.meta.env.VITE_TILE_SERVER_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Statuts des signalements
export const STATUTS = {
  NOUVEAU: { label: 'Nouveau', color: '#2196F3' },
  EN_COURS: { label: 'En cours', color: '#FF9800' },
  TERMINE: { label: 'Terminé', color: '#4CAF50' }
} as const;

export type StatutType = keyof typeof STATUTS;
