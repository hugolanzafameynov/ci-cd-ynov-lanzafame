import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';
import UserList from '../userlist/UserList';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    setUsers([]);
    try {
      const response = await userService.getAllUsers();
      console.log('Response getAllUsers:', response);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Erreur fetchUsers:', error);
      setError(error.error || error.message || 'Erreur lors du chargement des utilisateurs');
      setUsers([]); // S'assurer que users est un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find(u => (u._id || u.id) === userId);
    const userName = userToDelete ? `${userToDelete.name} ${userToDelete.lastName || userToDelete.last_name}` : 'cet utilisateur';
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ?`)) {
      return;
    }

    setLoading(true); // Afficher le loading pendant la suppression
    setError(''); // Effacer les erreurs précédentes

    try {
      console.log('Suppression de l\'utilisateur ID:', userId);
      await userService.deleteUser(userId);
      setUsers(users.filter(u => (u._id || u.id) !== userId));
      setError(`Utilisateur ${userName} supprimé avec succès`);
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Erreur suppression:', error);
      setError(`Impossible de supprimer ${userName}: ${error.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Tableau de bord</h1>
          <div className="user-info">
            <span className="welcome-text">
              Bienvenue, {user?.name} {user?.last_name}
              {isAdmin && <span className="admin-badge">Admin</span>}
            </span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-card">
          <h2>Informations personnelles</h2>
          <div className="user-details">
            <div className="detail-item">
              <strong>Nom:</strong> {user?.name} {user?.last_name}
            </div>
            <div className="detail-item">
              <strong>Username:</strong> {user?.username}
            </div>
            <div className="detail-item">
              <strong>Statut:</strong> {isAdmin ? 'Administrateur' : 'Utilisateur'}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Gestion des utilisateurs</h2>
              <button 
                onClick={fetchUsers} 
                className="btn btn-secondary"
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Actualiser'}
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
              <div className="loading">Chargement des utilisateurs...</div>
            ) : (
              <UserList 
                users={users} 
                onDeleteUser={handleDeleteUser}
                showActions={true}
              />
            )}
          </div>
        )}

        {!isAdmin && (
          <div className="dashboard-card">
            <h2>Accès limité</h2>
            <p>Vous n'avez pas les privilèges administrateur pour voir la liste des utilisateurs.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
