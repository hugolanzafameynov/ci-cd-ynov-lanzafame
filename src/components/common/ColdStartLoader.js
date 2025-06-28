import './Common.css';

const ColdStartLoader = ({ message = "Chargement..." }) => {
  return (
    <div className="cold-start-loader" data-testid="cold-start-loader">
      <div className="cold-start-spinner" data-testid="cold-start-spinner"></div>
      
      <p className="cold-start-message" data-testid="cold-start-message">
        {message}
      </p>
    </div>
  );
};

export default ColdStartLoader;
