import api from './api';
import { StatutType } from '../config';

export interface Signalement {
  id_signalement: number;
  latitude: number;
  longitude: number;
  adresse: string;
  description: string;
  statut: StatutType;
  date_signalement: string;
  date_debut_travaux: string | null;
  date_fin_travaux: string | null;
  surface_estimee: number | null;
  budget_estime: number | null;
  id_utilisateur: number;
  id_entreprise: number | null;
  nom_entreprise?: string;
  nom_utilisateur?: string;
  prenom_utilisateur?: string;
}

export interface SignalementInput {
  latitude: number;
  longitude: number;
  adresse: string;
  description: string;
  statut?: StatutType;
  surface_estimee?: number;
  budget_estime?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Stats {
  total: number;
  nouveau: number;
  en_cours: number;
  termine: number;
}

// Interface pour la réponse du backend
interface BackendStats {
  totalSignalements: number;
  nouveaux: number;
  enCours: number;
  termines: number;
}

// Interface pour le signalement du backend
interface BackendSignalement {
  id: number;
  latitude: number;
  longitude: number;
  adresse: string;
  description: string;
  statut: StatutType;
  dateSignalement: string;
  dateModification?: string;
  surfaceM2: number | null;
  budget: number | null;
  utilisateur?: {
    email: string;
    nom: string;
    prenom: string;
  };
  entreprise?: {
    nom: string;
    telephone: string;
  };
}

class SignalementService {
  // Transformer un signalement backend vers le format attendu
  private transformSignalement(s: BackendSignalement): Signalement {
    return {
      id_signalement: s.id,
      latitude: s.latitude,
      longitude: s.longitude,
      adresse: s.adresse,
      description: s.description,
      statut: s.statut,
      date_signalement: s.dateSignalement,
      date_debut_travaux: null,
      date_fin_travaux: null,
      surface_estimee: s.surfaceM2,
      budget_estime: s.budget,
      id_utilisateur: 0,
      id_entreprise: null,
      nom_entreprise: s.entreprise?.nom,
      nom_utilisateur: s.utilisateur?.nom,
      prenom_utilisateur: s.utilisateur?.prenom
    };
  }

  // Récupérer tous les signalements
  async getAllSignalements(): Promise<Signalement[]> {
    const response = await api.get<ApiResponse<BackendSignalement[]>>('/api/signalements');
    return response.data.data.map(s => this.transformSignalement(s));
  }

  // Récupérer un signalement par ID
  async getSignalementById(id: number): Promise<Signalement> {
    const response = await api.get<ApiResponse<BackendSignalement>>(`/api/signalements/${id}`);
    return this.transformSignalement(response.data.data);
  }

  // Créer un nouveau signalement
  async createSignalement(signalement: SignalementInput): Promise<Signalement> {
    // Transformer vers le format attendu par le backend
    const backendData = {
      latitude: signalement.latitude,
      longitude: signalement.longitude,
      adresse: signalement.adresse,
      description: signalement.description,
      surfaceM2: signalement.surface_estimee
    };
    const response = await api.post<ApiResponse<BackendSignalement>>('/api/signalements', backendData);
    return this.transformSignalement(response.data.data);
  }

  // Récupérer les statistiques
  async getStats(): Promise<Stats> {
    const response = await api.get<ApiResponse<BackendStats>>('/api/signalements/stats');
    const data = response.data.data;
    // Transformer les noms de champs du backend vers le format attendu
    return {
      total: data.totalSignalements || 0,
      nouveau: data.nouveaux || 0,
      en_cours: data.enCours || 0,
      termine: data.termines || 0
    };
  }

  // Récupérer les signalements de l'utilisateur connecté
  async getMySignalements(): Promise<Signalement[]> {
    const allSignalements = await this.getAllSignalements();
    // Le filtrage par utilisateur sera fait côté serveur si nécessaire
    return allSignalements;
  }
}

export default new SignalementService();
