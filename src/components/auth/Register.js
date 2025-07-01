import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { isAdult, isValidFrenchPostalCode, isValidEmail, isValidName, isValidPassword, isNotEmpty } from './module';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    birthdate: '',
    city: '',
    postal_code: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation des champs obligatoires
    if (!isNotEmpty(formData.first_name)) {
      setError('Le prénom est requis');
      setLoading(false);
      return;
    }
    if (!isValidName(formData.first_name)) {
      setError('Le prénom est invalide');
      setLoading(false);
      return;
    }
    if (!isNotEmpty(formData.last_name)) {
      setError('Le nom est requis');
      setLoading(false);
      return;
    }
    if (!isValidName(formData.last_name)) {
      setError('Le nom est invalide');
      setLoading(false);
      return;
    }
    if (!isNotEmpty(formData.city)) {
      setError('La ville est requise');
      setLoading(false);
      return;
    }
    if (!isNotEmpty(formData.birthdate)) {
      setError('La date de naissance est requise');
      setLoading(false);
      return;
    }
    if (!isNotEmpty(formData.postal_code)) {
      setError('Le code postal est requis');
      setLoading(false);
      return;
    }
    if (!isNotEmpty(formData.email)) {
      setError('L\'email est requis');
      setLoading(false);
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError('L\'email est invalide');
      setLoading(false);
      return;
    }
    if (!isNotEmpty(formData.password)) {
      setError('Le mot de passe est requis');
      setLoading(false);
      return;
    }
    if (!isValidPassword(formData.password)) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    // Validation des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    // Validation âge minimum 18 ans
    if (!isAdult(formData.birthdate)) {
      setError('Vous devez avoir au moins 18 ans pour vous inscrire');
      setLoading(false);
      return;
    }

    // Validation code postal français (5 chiffres)
    if (!isValidFrenchPostalCode(formData.postal_code)) {
      setError('Le code postal doit être composé de 5 chiffres');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      const apiData = {
        username: userData.email,
        password: userData.password,
        name: userData.first_name,
        last_name: userData.last_name,
        birthdate: userData.birthdate,
        city: userData.city,
        postal_code: userData.postal_code
      };
      await register(apiData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-message">
            <h2>Inscription réussie !</h2>
            <p>Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Inscription</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">Prénom</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                data-testid="register-first-name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="Votre prénom"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Nom</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                data-testid="register-last-name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birthdate">Date de naissance</label>
              <input
                type="date"
                id="birthdate"
                name="birthdate"
                data-testid="register-birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">Ville</label>
              <input
                type="text"
                id="city"
                name="city"
                data-testid="register-city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Votre ville"
              />
            </div>

            <div className="form-group">
              <label htmlFor="postal_code">Code postal</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                data-testid="register-postal-code"
                value={formData.postal_code}
                onChange={handleChange}
                required
                placeholder="Code postal"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              data-testid="register-email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="votre@email.com"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                data-testid="register-password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Minimum 6 caractères"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                data-testid="register-confirm-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirmez votre mot de passe"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            data-testid="register-submit-button"
            disabled={loading}
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Déjà un compte ?{' '}
            <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
