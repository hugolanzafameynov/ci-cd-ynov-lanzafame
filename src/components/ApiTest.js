import React, { useState } from 'react';

const ApiTest = () => {
  const [result, setResult] = useState('');
  
  const testApi = async () => {
    try {
      setResult('Test en cours...');
      
      // Test avec fetch
      const response = await fetch('https://ci-cd-ynov-back-lanzafame.vercel.app/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: 'loise.fenoll@ynov.com',
          password: 'PvdrTAzTeR247sDnAZBr'
        })
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      setResult(JSON.stringify(data, null, 2));
      
    } catch (error) {
      console.error('Erreur test API:', error);
      setResult(`ERREUR: ${error.message}`);
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>Test API Direct</h2>
      <button onClick={testApi}>Tester API avec fetch</button>
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '10px', 
        marginTop: '10px',
        whiteSpace: 'pre-wrap'
      }}>
        {result}
      </pre>
    </div>
  );
};

export default ApiTest;
