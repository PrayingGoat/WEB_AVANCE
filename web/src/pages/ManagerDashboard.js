import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, getStoredToken, clearAuth } from '../utils/auth';
import * as signalementService from '../services/signalementService';
import './ManagerDashboard.css';

function ManagerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    const userData = getStoredUser();

    if (!token || !userData || !userData.email) {
      clearAuth();
      navigate('/login', { replace: true });
      return;
    }

    setUser(userData);
    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="manager-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>Manager Dashboard</h2>
        </div>
        <div className="nav-user">
          <span>{user.nom} {user.prenom} ({user.email})</span>
          <button onClick={handleLogout} className="btn btn-danger">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <ul className="nav-menu">
            <li>
              <Link to="/manager" className={`nav-link ${location.pathname === '/manager' ? 'active' : ''}`}>
                Tableau de bord
              </Link>
            </li>
            <li>
              <Link to="/manager/signalements" className={`nav-link ${location.pathname === '/manager/signalements' ? 'active' : ''}`}>
                Signalements
              </Link>
            </li>
            <li>
              <Link to="/manager/users" className={`nav-link ${location.pathname === '/manager/users' ? 'active' : ''}`}>
                Utilisateurs
              </Link>
            </li>
            <li>
              <Link to="/manager/sync" className={`nav-link ${location.pathname === '/manager/sync' ? 'active' : ''}`}>
                Synchronisation
              </Link>
            </li>
          </ul>
        </aside>

        <main className="dashboard-content">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/signalements" element={<SignalementsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/sync" element={<SyncPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ============================================
// Composant: Dashboard Home avec statistiques
// ============================================
function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await signalementService.getStats();
        setStats(data);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <h1>Tableau de bord</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Signalements</h3>
          <p className="stat-number">{stats?.totalSignalements || 0}</p>
        </div>
        <div className="stat-card stat-new">
          <h3>Nouveaux</h3>
          <p className="stat-number">{stats?.nouveaux || 0}</p>
        </div>
        <div className="stat-card stat-progress">
          <h3>En cours</h3>
          <p className="stat-number">{stats?.enCours || 0}</p>
        </div>
        <div className="stat-card stat-done">
          <h3>Terminés</h3>
          <p className="stat-number">{stats?.termines || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Utilisateurs</h3>
          <p className="stat-number">{stats?.totalUtilisateurs || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Avancement</h3>
          <p className="stat-number">{stats?.avancement || 0}%</p>
        </div>
        <div className="stat-card wide">
          <h3>Surface totale</h3>
          <p className="stat-number">{stats?.surfaceTotale?.toFixed(2) || 0} m²</p>
        </div>
        <div className="stat-card wide">
          <h3>Budget total</h3>
          <p className="stat-number">{(stats?.budgetTotal || 0).toLocaleString()} Ar</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Composant: Page de gestion des signalements
// ============================================
function SignalementsPage() {
  const [signalements, setSignalements] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filter, setFilter] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [signalementsData, entreprisesData] = await Promise.all([
        signalementService.getAllSignalements(filter ? { statut: filter } : {}),
        signalementService.getEntreprises()
      ]);
      setSignalements(signalementsData);
      setEntreprises(entreprisesData);
    } catch (err) {
      setError('Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (signalement) => {
    setEditingId(signalement.id);
    setEditForm({
      statut: signalement.statut,
      budget: signalement.budget || '',
      entrepriseId: signalement.entreprise?.id || '',
      surfaceM2: signalement.surfaceM2 || '',
    });
  };

  const handleSave = async (id) => {
    try {
      await signalementService.updateSignalement(id, editForm);
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert('Erreur lors de la mise à jour');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce signalement ?')) {
      try {
        await signalementService.deleteSignalement(id);
        fetchData();
      } catch (err) {
        alert('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const getStatusBadge = (statut) => {
    const classes = {
      'NOUVEAU': 'badge badge-new',
      'EN_COURS': 'badge badge-progress',
      'TERMINE': 'badge badge-done',
    };
    return <span className={classes[statut] || 'badge'}>{statut}</span>;
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Gestion des Signalements</h1>
        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="NOUVEAU">Nouveaux</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINE">Terminés</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Adresse</th>
              <th>Description</th>
              <th>Statut</th>
              <th>Surface (m²)</th>
              <th>Budget (Ar)</th>
              <th>Entreprise</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {signalements.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.adresse || '-'}</td>
                <td className="description-cell">{s.description || '-'}</td>
                <td>
                  {editingId === s.id ? (
                    <select
                      value={editForm.statut}
                      onChange={(e) => setEditForm({ ...editForm, statut: e.target.value })}
                    >
                      <option value="NOUVEAU">NOUVEAU</option>
                      <option value="EN_COURS">EN_COURS</option>
                      <option value="TERMINE">TERMINE</option>
                    </select>
                  ) : (
                    getStatusBadge(s.statut)
                  )}
                </td>
                <td>
                  {editingId === s.id ? (
                    <input
                      type="number"
                      value={editForm.surfaceM2}
                      onChange={(e) => setEditForm({ ...editForm, surfaceM2: e.target.value })}
                      style={{ width: '80px' }}
                    />
                  ) : (
                    s.surfaceM2 || '-'
                  )}
                </td>
                <td>
                  {editingId === s.id ? (
                    <input
                      type="number"
                      value={editForm.budget}
                      onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                      style={{ width: '100px' }}
                    />
                  ) : (
                    s.budget ? s.budget.toLocaleString() : '-'
                  )}
                </td>
                <td>
                  {editingId === s.id ? (
                    <select
                      value={editForm.entrepriseId}
                      onChange={(e) => setEditForm({ ...editForm, entrepriseId: e.target.value })}
                    >
                      <option value="">-- Aucune --</option>
                      {entreprises.map((ent) => (
                        <option key={ent.id} value={ent.id}>{ent.nom}</option>
                      ))}
                    </select>
                  ) : (
                    s.entreprise?.nom || '-'
                  )}
                </td>
                <td>{new Date(s.dateSignalement).toLocaleDateString('fr-FR')}</td>
                <td className="actions-cell">
                  {editingId === s.id ? (
                    <>
                      <button className="btn btn-sm btn-success" onClick={() => handleSave(s.id)}>
                        Sauver
                      </button>
                      <button className="btn btn-sm" onClick={() => setEditingId(null)}>
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-sm btn-primary" onClick={() => handleEdit(s)}>
                        Modifier
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>
                        Suppr.
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {signalements.length === 0 && (
          <p className="no-data">Aucun signalement trouvé.</p>
        )}
      </div>
    </div>
  );
}

// ============================================
// Composant: Page de gestion des utilisateurs
// ============================================
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    role: 'USER',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, blockedData] = await Promise.all([
        signalementService.getAllUsers(),
        signalementService.getBlockedUsers()
      ]);
      setUsers(usersData);
      setBlockedUsers(blockedData);
    } catch (err) {
      setError('Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUnblock = async (userId) => {
    try {
      await signalementService.unblockUser(userId);
      fetchData();
    } catch (err) {
      alert('Erreur lors du déblocage');
      console.error(err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await signalementService.createUser(newUser);
      setShowCreateForm(false);
      setNewUser({ email: '', password: '', nom: '', prenom: '', role: 'USER' });
      fetchData();
      alert('Utilisateur créé avec succès');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Gestion des Utilisateurs</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Annuler' : '+ Nouvel utilisateur'}
        </button>
      </div>

      {showCreateForm && (
        <div className="form-card">
          <h3>Créer un utilisateur</h3>
          <form onSubmit={handleCreateUser}>
            <div className="form-row">
              <div className="form-group">
                <label>Prénom</label>
                <input
                  type="text"
                  value={newUser.prenom}
                  onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  value={newUser.nom}
                  onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="USER">Utilisateur</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-success">Créer</button>
          </form>
        </div>
      )}

      {blockedUsers.length > 0 && (
        <div className="blocked-section">
          <h2>Utilisateurs bloqués ({blockedUsers.length})</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nom</th>
                  <th>Tentatives</th>
                  <th>Date de blocage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blockedUsers.map((u) => (
                  <tr key={u.id} className="blocked-row">
                    <td>{u.email}</td>
                    <td>{u.prenom} {u.nom}</td>
                    <td>{u.tentatives}</td>
                    <td>{new Date(u.dateBlocage).toLocaleString('fr-FR')}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleUnblock(u.id)}
                      >
                        Débloquer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2>Tous les utilisateurs ({users.length})</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Date création</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={u.estBloque ? 'blocked-row' : ''}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.prenom} {u.nom}</td>
                <td>
                  <span className={`badge ${u.role === 'MANAGER' ? 'badge-manager' : 'badge-user'}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  {u.estBloque ? (
                    <span className="badge badge-blocked">Bloqué</span>
                  ) : (
                    <span className="badge badge-active">Actif</span>
                  )}
                </td>
                <td>{new Date(u.dateCreation).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// Composant: Page de synchronisation Firebase
// ============================================
function SyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setSyncing(true);
    setMessage('');

    // Simuler la synchronisation (à implémenter avec Firebase)
    setTimeout(() => {
      setLastSync(new Date());
      setMessage('Synchronisation terminée avec succès');
      setSyncing(false);
    }, 2000);
  };

  return (
    <div>
      <h1>Synchronisation Firebase</h1>

      <div className="sync-card">
        <p>
          Cette fonctionnalité permet de synchroniser les données locales (PostgreSQL)
          avec Firebase pour assurer la cohérence des données entre les modes online et offline.
        </p>

        <div className="sync-status">
          {lastSync && (
            <p>
              <strong>Dernière synchronisation :</strong>{' '}
              {lastSync.toLocaleString('fr-FR')}
            </p>
          )}
        </div>

        {message && (
          <div className={`sync-message ${message.includes('succès') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button
          className="btn btn-primary btn-lg"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? 'Synchronisation en cours...' : 'Synchroniser maintenant'}
        </button>
      </div>
    </div>
  );
}

export default ManagerDashboard;
