import React, { useState } from 'react';

const DeleteTest = () => {
  const [result, setResult] = useState('');
  const [userId, setUserId] = useState('3'); // ID d'un utilisateur test
  
  const testDelete = async (endpoint) => {
    try {
      setResult(`Test de suppression sur ${endpoint}...`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setResult('❌ Pas de token trouvé. Connectez-vous d\'abord.');
        return;
      }
      
      const response = await fetch(`https://ci-cd-ynov-back-lanzafame.vercel.app${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      
      const data = await response.text();
      setResult(`✅ Succès ${response.status}: ${data}`);
      
    } catch (error) {
      console.error('Erreur test suppression:', error);
      setResult(`❌ ERREUR: ${error.message}`);
    }
  };
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Test Suppression API</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <label>ID utilisateur à tester: </label>
        <input 
          type="number" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)}
          style={{ marginLeft: '10px', width: '60px' }}
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => testDelete(`/v1/users/${userId}`)} style={{ margin: '5px' }}>
          Tester DELETE /v1/users/{userId}
        </button>
        
        <button onClick={() => testDelete(`/v1/user/${userId}`)} style={{ margin: '5px' }}>
          Tester DELETE /v1/user/{userId}
        </button>
        
        <button onClick={() => testDelete(`/api/users/${userId}`)} style={{ margin: '5px' }}>
          Tester DELETE /api/users/{userId}
        </button>
        
        <button onClick={() => testDelete(`/users/${userId}`)} style={{ margin: '5px' }}>
          Tester DELETE /users/{userId}
        </button>
      </div>
      
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '10px',
        whiteSpace: 'pre-wrap',
        fontSize: '12px'
      }}>
        {result}
      </pre>
    </div>
  );
};

export default DeleteTest;
