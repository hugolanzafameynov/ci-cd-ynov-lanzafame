import React from 'react';
import './UserList.css';

const UserList = ({ users, onDeleteUser, showActions = false, isAdmin = false }) => {
    if (!users || users.length === 0) {
        return (
            <div className="user-list">
                <div className="empty-state">
                    <p>Aucun utilisateur trouvé.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-list">
            <div className="users-grid" data-testid="users-grid">
                {Array.isArray(users) && users.length > 0 ? (
                    users.map((user) => (
                    <div key={user._id || user.id} className="user-card" data-testid="user-card">
                        <div className="user-header">
                            <div className="user-info">
                                <h4>{user.name} {user.lastName}</h4>
                                <span className={`user-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                                    {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
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
                            {isAdmin && (
                                <>
                                    <div className="detail-row">
                                        <span className="label">Date de naissance:</span>
                                        <span className="value">{user.birthdate || '-'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Ville:</span>
                                        <span className="value">{user.city || '-'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Code postal:</span>
                                        <span className="value">{user.postalCode || '-'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Créé le:</span>
                                        <span className="value">{user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</span>
                                    </div>
                                </>
                            )}
                        </div>
                        {showActions && onDeleteUser && (
                            <div className="user-actions">
                                <button 
                                    onClick={() => onDeleteUser(user._id || user.id)}
                                    className="btn btn-danger btn-sm"
                                    data-testid="delete-button"
                                    disabled={user.role === 'admin'}
                                    title={(user.role === 'admin') ? "Impossible de supprimer un administrateur" : "Supprimer cet utilisateur"}
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
