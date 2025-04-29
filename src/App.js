import React, {useState} from 'react';
import Form from './components/form/Form';
import UserList from './components/userlist/UserList';

const App = () => {
    const [users, setUsers] = useState(() => {
        const storedUsers = localStorage.getItem('users');
        return storedUsers ? JSON.parse(storedUsers) : [];
    });

    const addUser = (userData) => {
        setUsers((prevUsers) => {
            const updatedUsers = [...prevUsers, userData];
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            return updatedUsers;
        });
    };

    return (
        <div>
            <h1>Formulaire d'inscription</h1>
            <Form addUser={addUser}/>
            <UserList users={users}/>
        </div>
    );
};

export default App;
