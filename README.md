# 🚀 Application React - Gestion d'Utilisateurs

[![GitHub Pages](https://img.shields.io/badge/deployed%20on-GitHub%20Pages-blue)](https://hugolanzafame.github.io/ci-cd-ynov-lanzafame)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)

Cette application React moderne propose une interface utilisateur complète pour la gestion d'utilisateurs, avec authentification sécurisée et panneau d'administration. L'application est déployée automatiquement sur GitHub Pages et communique avec une API backend hébergée sur Vercel.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │────│    API Vercel    │────│   Aiven MySql   │
│ (GitHub Pages)  │    │   (Backend API)  │    │    (Cloud)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Stack Technique :**
- **Frontend** : React 18, React Router, Axios
- **Backend** : API REST déployée sur Vercel
- **Base de données** : MySQL Cloud (Aiven)
- **Déploiement** : GitHub Pages avec GitHub Actions
- **Authentification** : JWT tokens

## Démarrage rapide

### Prérequis
- Node.js 18+ et npm
- Compte GitHub pour le déploiement
- API backend accessible (voir repository séparé)

### Installation locale

```bash
# 1. Cloner le projet
git clone https://github.com/hugolanzafameynov/ci-cd-ynov-lanzafame.git
cd ci-cd-ynov-lanzafame

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec l'URL de votre API

# 4. Démarrer en mode développement
npm start
```

L'application sera accessible sur `http://localhost:3000`

## ⚙️ Configuration

### Variables d'environnement

```bash
# .env
REACT_APP_API_URL=https://votre-api.vercel.app
```

### Scripts disponibles

```bash
npm start             # Développement (port 3000)
npm test              # Tests avec Jest
npm run test:coverage # Tests avec couverture
npm run build         # Build de production
npm run deploy        # Déploiement GitHub Pages
npm run cypress       # Tests E2E avec Cypress
npm run jsdoc         # Génération documentation
```

## 🧪 Tests et Qualité

### Tests automatisés
- **Tests unitaires** : Jest + Testing Library
- **Tests d'intégration** : Formulaires et navigation
- **Tests E2E** : Cypress pour les parcours utilisateur
- **Couverture de code** : >90% sur les composants critiques

```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests E2E
npm run cypress
```

## 📁 Structure du projet

```
src/
├── components/              # Composants React
│   ├── auth/               # Authentification
│   │   ├── Login.js        # Formulaire de connexion
│   │   ├── Register.js     # Formulaire d'inscription
│   │   └── Auth.css        # Styles auth
│   ├── dashboard/          # Tableau de bord
│   │   ├── Dashboard.js    # Composant principal
│   │   └── Dashboard.css   # Styles dashboard
│   ├── userlist/           # Gestion utilisateurs
│   │   ├── UserList.js     # Liste des utilisateurs
│   │   └── UserList.css    # Styles liste
│   ├── form/               # Formulaires génériques
│   │   ├── Form.js         # Composant formulaire
│   │   └── Form.test.js    # Tests formulaire
│   └── common/             # Composants partagés
│       ├── ProtectedRoute.js # Routes protégées
│       └── Common.css      # Styles communs
├── contexts/               # Context API React
│   └── AuthContext.js      # Contexte authentification
├── services/               # Services externes
│   └── api.js              # Client API (Axios)
├── App.js                  # Composant racine
├── App.css                 # Styles globaux
├── index.js                # Point d'entrée
└── module.js               # Fonctions utilitaires
```

## 🔌 API Integration

### Endpoints utilisés

```javascript
// Authentification
POST /v1/login              // Connexion utilisateur
POST /v1/users              // Inscription utilisateur

// Gestion utilisateurs
GET  /v1/users              // Liste des utilisateurs (admin)
DELETE /v1/users/{id}       // Suppression utilisateur (admin)
```

### Format des données

**Inscription utilisateur :**
```json
{
  "username": "user@example.com",
  "password": "motdepasse123",
  "name": "Prénom",
  "last_name": "Nom de famille"
}
```

**Connexion :**
```json
{
  "username": "user@example.com",
  "password": "motdepasse123"
}
```

## Compte de test

Pour tester l'application, utilisez le compte administrateur :

```
Email: loise.fenoll@ynov.com
Mot de passe: PvdrTAzTeR247sDnAZBr
```

## Déploiement en production

### GitHub Pages (automatique)

Le déploiement se fait automatiquement via GitHub Actions :

1. **Push** sur la branche `main`
2. **Build** automatique de l'application
3. **Tests** de validation
4. **Déploiement** sur GitHub Pages

### Configuration manuelle

```bash
# Build de production
npm run build

# Déploiement manuel
npm run deploy
```
