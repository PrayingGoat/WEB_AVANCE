import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as signalementService from '../services/signalementService';
import './HomePage.css';

// Fix for default markers in React-Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

// Icônes personnalisées selon le statut
const createIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const icons = {
  NOUVEAU: createIcon('#3498db'),
  EN_COURS: createIcon('#f39c12'),
  TERMINE: createIcon('#27ae60'),
};

function HomePage() {
  const [signalements, setSignalements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSignalement, setSelectedSignalement] = useState(null);
  const [filter, setFilter] = useState('');

  // Centre sur Antananarivo
  const center = [-18.8792, 47.5079];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [signalementsData, statsData] = await Promise.all([
        signalementService.getAllSignalements(),
        signalementService.getStats()
      ]);
      setSignalements(signalementsData);
      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const filteredSignalements = filter
    ? signalements.filter(s => s.statut === filter)
    : signalements;

  const getStatusLabel = (statut) => {
    const labels = {
      NOUVEAU: 'Nouveau',
      EN_COURS: 'En cours',
      TERMINE: 'Terminé',
    };
    return labels[statut] || statut;
  };

  const getStatusClass = (statut) => {
    const classes = {
      NOUVEAU: 'status-new',
      EN_COURS: 'status-progress',
      TERMINE: 'status-done',
    };
    return classes[statut] || '';
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-title">
          <h1>Travaux Routiers Antananarivo</h1>
          <p>Suivi en temps réel des travaux de voirie</p>
        </div>
        <div className="header-actions">
          <Link to="/login" className="btn btn-primary">
            Connexion Manager
          </Link>
        </div>
      </header>

      {/* Statistiques */}
      {stats && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats.totalSignalements}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item stat-new">
            <span className="stat-value">{stats.nouveaux}</span>
            <span className="stat-label">Nouveaux</span>
          </div>
          <div className="stat-item stat-progress">
            <span className="stat-value">{stats.enCours}</span>
            <span className="stat-label">En cours</span>
          </div>
          <div className="stat-item stat-done">
            <span className="stat-value">{stats.termines}</span>
            <span className="stat-label">Terminés</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.avancement}%</span>
            <span className="stat-label">Avancement</span>
          </div>
        </div>
      )}

      <div className="content">
        {/* Carte */}
        <div className="map-container">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredSignalements.map((signalement) => (
              <Marker
                key={signalement.id}
                position={[signalement.latitude, signalement.longitude]}
                icon={icons[signalement.statut] || icons.NOUVEAU}
                eventHandlers={{
                  click: () => setSelectedSignalement(signalement),
                }}
              >
                {/* Tooltip au survol */}
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="tooltip-content">
                    <strong>{signalement.adresse || 'Adresse non spécifiée'}</strong>
                    <br />
                    <span className={`tooltip-status ${getStatusClass(signalement.statut)}`}>
                      {getStatusLabel(signalement.statut)}
                    </span>
                    {signalement.budget && (
                      <span> • {signalement.budget.toLocaleString()} Ar</span>
                    )}
                    {signalement.entreprise && (
                      <span> • {signalement.entreprise.nom}</span>
                    )}
                  </div>
                </Tooltip>
                {/* Popup au clic */}
                <Popup>
                  <div className="popup-content">
                    <h4>{signalement.adresse || 'Adresse non spécifiée'}</h4>
                    <p className="popup-description">{signalement.description || 'Pas de description'}</p>
                    <div className="popup-details">
                      <span className={`popup-status ${getStatusClass(signalement.statut)}`}>
                        {getStatusLabel(signalement.statut)}
                      </span>
                      {signalement.surfaceM2 && (
                        <span className="popup-surface">{signalement.surfaceM2} m²</span>
                      )}
                    </div>
                    {signalement.entreprise && (
                      <p className="popup-entreprise">
                        Entreprise: {signalement.entreprise.nom}
                      </p>
                    )}
                    {signalement.budget && (
                      <p className="popup-budget">
                        Budget: {signalement.budget.toLocaleString()} Ar
                      </p>
                    )}
                    <p className="popup-date">
                      Signalé le {new Date(signalement.dateSignalement).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar avec liste et tableau */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Liste des Signalements</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Tous ({signalements.length})</option>
              <option value="NOUVEAU">Nouveaux ({stats?.nouveaux || 0})</option>
              <option value="EN_COURS">En cours ({stats?.enCours || 0})</option>
              <option value="TERMINE">Terminés ({stats?.termines || 0})</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          {filteredSignalements.length === 0 ? (
            <p className="empty-state">Aucun signalement trouvé</p>
          ) : (
            <div className="signalements-list">
              {filteredSignalements.map((signalement) => (
                <div
                  key={signalement.id}
                  className={`signalement-card ${selectedSignalement?.id === signalement.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSignalement(signalement)}
                >
                  <div className="card-header">
                    <span className={`status-badge ${getStatusClass(signalement.statut)}`}>
                      {getStatusLabel(signalement.statut)}
                    </span>
                    <span className="card-date">
                      {new Date(signalement.dateSignalement).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <h4 className="card-address">{signalement.adresse || 'Adresse non spécifiée'}</h4>
                  <p className="card-description">{signalement.description || '-'}</p>
                  <div className="card-footer">
                    {signalement.surfaceM2 && (
                      <span className="card-surface">{signalement.surfaceM2} m²</span>
                    )}
                    {signalement.budget && (
                      <span className="card-budget">{signalement.budget.toLocaleString()} Ar</span>
                    )}
                    {signalement.entreprise && (
                      <span className="card-entreprise">{signalement.entreprise.nom}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tableau récapitulatif */}
          <div className="recap-section">
            <h3>Tableau récapitulatif</h3>
            <table className="recap-table">
              <thead>
                <tr>
                  <th>Adresse</th>
                  <th>Statut</th>
                  <th>Surface</th>
                  <th>Budget</th>
                </tr>
              </thead>
              <tbody>
                {filteredSignalements.slice(0, 10).map((s) => (
                  <tr key={s.id}>
                    <td>{s.adresse || '-'}</td>
                    <td>
                      <span className={`status-badge small ${getStatusClass(s.statut)}`}>
                        {getStatusLabel(s.statut)}
                      </span>
                    </td>
                    <td>{s.surfaceM2 ? `${s.surfaceM2} m²` : '-'}</td>
                    <td>{s.budget ? `${s.budget.toLocaleString()} Ar` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSignalements.length > 10 && (
              <p className="recap-more">Et {filteredSignalements.length - 10} autres signalements...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
