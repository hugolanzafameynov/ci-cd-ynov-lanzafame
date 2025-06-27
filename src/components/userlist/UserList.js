import React from 'react';
import './UserList.css';

const UserList = ({ users, onDeleteUser, showActions = false }) => {
    if (!users || users.length === 0) {
        return (
            <div className="user-list">
                <div className="empty-state">
                    <p>Aucun utilisateur trouvé.</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Non spécifié';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Date invalide';
        }
    };

    return (
        <div className="user-list">
            <div className="users-grid">
                {Array.isArray(users) && users.length > 0 ? (
                    users.map((user) => (
                    <div key={user._id || user.id} className="user-card">
                        <div className="user-header">
                            <div className="user-info">
                                <h4>{user.name} {user.lastName || user.last_name}</h4>
                                <span className={`user-badge ${user.role === 'admin' || user.is_admin ? 'admin' : 'user'}`}>
                                    {user.role === 'admin' || user.is_admin ? 'Admin' : 'Utilisateur'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="user-details">
                            <div className="detail-row">
                                <span className="label">Username:</span>
                                <span className="value">{user.username}</span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="label">ID:</span>
                                <span className="value">#{user._id || user.id}</span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="label">Statut:</span>
                                <span className="value">{user.role === 'admin' || user.is_admin ? 'Administrateur' : 'Utilisateur'}</span>
                            </div>
                        </div>

                        {showActions && onDeleteUser && (
                            <div className="user-actions">
                                <button 
                                    onClick={() => onDeleteUser(user._id || user.id)}
                                    className="btn btn-danger btn-sm"
                                    disabled={user.role === 'admin' || user.is_admin}
                                    title={(user.role === 'admin' || user.is_admin) ? "Impossible de supprimer un administrateur" : "Supprimer cet utilisateur"}
                                >
                                    Supprimer
                                </button>
                            </div>
                        )}
                    </div>
                ))
                ) : (
                    <div className="no-users">
                        <p>Aucun utilisateur trouvé ou erreur de chargement.</p>
                        <p>Données reçues: {JSON.stringify(users)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;
