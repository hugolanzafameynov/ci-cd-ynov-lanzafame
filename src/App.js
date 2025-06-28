import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import './App.css';
import './components/common/Common.css';

const App = () => {
    // Déterminer le basename en fonction de l'environnement
    // Pour GitHub Pages, nous avons besoin du basename en production
    const basename = process.env.NODE_ENV === 'production' && process.env.PUBLIC_URL
        ? process.env.PUBLIC_URL 
        : '';

    return (
        <AuthProvider>
            <Router basename={basename}>
                <div className="App">
                    <Routes>
                        {/* Route par défaut - redirection vers dashboard ou login */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        
                        {/* Routes d'authentification */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* Routes protégées */}
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                        
                        {/* Route de fallback */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
