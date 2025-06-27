import React from 'react';
import './Common.css';

const ColdStartLoader = ({ message = "Chargement..." }) => {
  return (
    <div className="cold-start-loader">
      <div className="cold-start-spinner"></div>
      
      <p className="cold-start-message">
        {message}
      </p>
      
      <p className="cold-start-subtitle">
        🔄 Première requête (démarrage serveur)
      </p>
    </div>
  );
};

export default ColdStartLoader;
