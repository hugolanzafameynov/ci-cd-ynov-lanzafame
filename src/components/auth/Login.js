import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (error) {
      setError(error.error || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Connexion</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              data-testid="login-email"
              value={credentials.email}
              onChange={handleChange}
              required
              placeholder="votre@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              data-testid="login-password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Votre mot de passe"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            data-testid="login-submit-button"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Pas encore de compte ?{' '}
            <Link to="/register">S'inscrire</Link>
          </p>
        </div>

        <div className="demo-credentials">
          <h4>Compte administrateur par défaut :</h4>
          <p><strong>Username:</strong> loise.fenoll@ynov.com</p>
          <p><strong>Password:</strong> PvdrTAzTeR247sDnAZBr</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
