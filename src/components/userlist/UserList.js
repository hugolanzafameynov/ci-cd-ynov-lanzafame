import React from 'react';

const UserList = ({users}) => {
    return (
        <div>
            <h3>Liste des inscrits</h3>
            {users.length === 0 ? (
                <p>Aucun utilisateur inscrit.</p>
            ) : (
                <ul>
                    {users.map((user, index) => (
                        <li key={index}>
                            {user.name} {user.surname} - {user.email}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UserList;
