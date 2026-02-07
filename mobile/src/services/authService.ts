import api from './api';
import { Preferences } from '@capacitor/preferences';

export interface User {
  id_utilisateur: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: User;
}

class AuthService {
  // Connexion
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email,
      password
    });

    if (response.data.success && response.data.data) {
      // Sauvegarder le token et les infos utilisateur
      await Preferences.set({
        key: 'token',
        value: response.data.data.token
      });
      await Preferences.set({
        key: 'user',
        value: JSON.stringify(response.data.data.user)
      });
    }

    return response.data;
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      await Preferences.remove({ key: 'token' });
      await Preferences.remove({ key: 'user' });
    }
  }

  // Récupérer l'utilisateur connecté
  async getCurrentUser(): Promise<User | null> {
    const { value: userJson } = await Preferences.get({ key: 'user' });
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  }

  // Vérifier si l'utilisateur est connecté
  async isAuthenticated(): Promise<boolean> {
    const { value: token } = await Preferences.get({ key: 'token' });
    return !!token;
  }

  // Récupérer les infos utilisateur depuis le serveur
  async fetchUserInfo(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/api/auth/me');
    return response.data;
  }
}

export default new AuthService();
