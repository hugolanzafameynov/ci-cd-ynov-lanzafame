import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';
import { postService } from '../../services/postApi';
import UserList from '../userlist/UserList';
import './Dashboard.css';

const Dashboard = () => {
  const { logout, isAdmin } = useAuth();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [postForm, setPostForm] = useState({
    title: '',
    content: ''
  });
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchUsers();
    // eslint-disable-next-line
  }, [isAdmin]);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      setUser(response);
    } catch (error) {
      setError(error.error || error.message || 'Erreur lors du chargement du profil');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    setUsers([]);
    try {
      let response;
      if (isAdmin) {
        response = await userService.getAllUsersSensitive();
      } else {
        response = await userService.getAllUsers();
      }
      setUsers(response.users || []);
    } catch (error) {
      setError(error.error || error.message || 'Erreur lors du chargement des utilisateurs');
      setUsers([]);
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
    setLoading(true);
    setError('');
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter(u => (u._id || u.id) !== userId));
      setError(`Utilisateur ${userName} supprimé avec succès`);
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      setError(`Impossible de supprimer ${userName}: ${error.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handlePostInputChange = (e) => {
    const { name, value } = e.target;
    setPostForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.title.trim() || !postForm.content.trim()) {
      setPostError('Veuillez remplir tous les champs');
      return;
    }

    setPostLoading(true);
    setPostError('');
    setPostSuccess('');

    try {
      await postService.createPost({
        title: postForm.title.trim(),
        content: postForm.content.trim()
      });
      setPostSuccess('Post créé avec succès !');
      setPostForm({ title: '', content: '' });
      setTimeout(() => setPostSuccess(''), 3000);
    } catch (error) {
      setPostError(error.message || 'Erreur lors de la création du post');
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Tableau de bord</h1>
          <div className="user-info">
            <span className="welcome-text">
              Bienvenue, {user?.name} {user?.lastName}
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
              <strong>Nom:</strong> {user?.name} {user?.lastName}
            </div>
            <div className="detail-item">
              <strong>Username:</strong> {user?.username}
            </div>
            <div className="detail-item">
              <strong>Statut:</strong> {isAdmin ? 'Administrateur' : 'Utilisateur'}
            </div>
            <div className="detail-item">
              <strong>Date de naissance:</strong> {user?.birthdate || '-'}
            </div>
            <div className="detail-item">
              <strong>Ville:</strong> {user?.city || '-'}
            </div>
            <div className="detail-item">
              <strong>Code postal:</strong> {user?.postalCode || '-'}
            </div>
            <div className="detail-item">
              <strong>Créé le:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Créer un nouveau post</h2>
          <form onSubmit={handleCreatePost} className="post-form">
            <div className="form-group">
              <label htmlFor="title">Titre du post</label>
              <input
                type="text"
                id="title"
                name="title"
                value={postForm.title}
                onChange={handlePostInputChange}
                placeholder="Entrez le titre du post"
                disabled={postLoading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="content">Contenu</label>
              <textarea
                id="content"
                name="content"
                value={postForm.content}
                onChange={handlePostInputChange}
                placeholder="Entrez le contenu du post"
                rows="4"
                disabled={postLoading}
                required
              />
            </div>
            {postError && <div className="error-message">{postError}</div>}
            {postSuccess && <div className="success-message">{postSuccess}</div>}
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={postLoading}
            >
              {postLoading ? 'Création...' : 'Créer le post'}
            </button>
          </form>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>Liste des utilisateurs</h2>
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
              onDeleteUser={isAdmin ? handleDeleteUser : undefined}
              showActions={isAdmin}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
