import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { saveAuth } from '../utils/auth';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', formData);

      // Le backend renvoie: { success, message, data: { token, user } }
      if (response.data && response.data.success && response.data.data) {
        const { token, user } = response.data.data;

        if (token && user) {
          // Stocker le token et les données utilisateur de manière sécurisée
          saveAuth(token, user);

          // Rediriger vers le dashboard
          navigate('/manager');
        } else {
          setError('Réponse du serveur invalide');
        }
      } else {
        setError(response.data?.message || 'Réponse du serveur invalide');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(
        err.response?.data?.message ||
        'Erreur de connexion. Vérifiez vos identifiants.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>Connexion Manager</h1>
          <p className="subtitle">Travaux Routiers Antananarivo</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="manager@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="login-footer">
            <a href="/">Retour à l'accueil</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
