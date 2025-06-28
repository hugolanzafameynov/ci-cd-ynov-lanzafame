# Application React - Gestion d'Utilisateurs

[![GitHub Pages](https://img.shields.io/badge/deployed%20on-GitHub%20Pages-blue)](https://loiseFN.github.io/ci-cd-ynov-lanzafame)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://docker.com/)

Cette application React moderne propose une interface utilisateur complète pour la gestion d'utilisateurs, avec authentification sécurisée et panneau d'administration. L'application est déployée automatiquement sur GitHub Pages et communique avec une API backend FastAPI.

## Architecture

### Environnement de développement local (Docker)
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │────│   FastAPI API    │────│   MySQL DB      │────│    Adminer      │
│ (localhost:3000)│    │ (localhost:8000) │    │ (localhost:3306)│    │ (localhost:8080)│
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
```

### Environnement de production
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │────│    API Vercel    │────│   Aiven MySQL   │
│ (GitHub Pages)  │    │   (Backend API)  │    │    (Cloud)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Stack Technique :**
- **Frontend** : React 18, React Router, Axios
- **Backend Local** : FastAPI + SQLAlchemy (Docker)
- **Backend Production** : API REST déployée sur Vercel
- **Base de données** : MySQL (Docker local / Aiven Cloud en prod)
- **Déploiement** : GitHub Pages avec GitHub Actions
- **Authentification** : JWT tokens
- **Outils** : Docker Compose, Adminer (interface DB)

## Démarrage rapide

### Prérequis
- Node.js 18+ et npm
- Docker et Docker Compose (pour le développement local)
- Compte GitHub pour le déploiement

### Option 1 : Développement avec Docker (Recommandé)

```bash
# 1. Cloner le projet
git clone https://github.com/hugolanzafameynov/ci-cd-ynov-lanzafame.git
cd ci-cd-ynov-lanzafame

# 2. Configurer l'environnement local
cp .env.example .env
cp backend/.env.example backend/.env
# Éditer les fichiers .env selon vos besoins

# 3. Démarrer tous les services avec Docker
docker-compose up -d
```

**Services disponibles :**
- Frontend React : http://localhost:3000
- API Backend : http://localhost:8000
- Base de données MySQL : localhost:3306
- Adminer (Interface DB) : http://localhost:8080

### Option 2 : Développement frontend uniquement

```bash
# 1. Cloner le projet
git clone https://github.com/hugolanzafameynov/ci-cd-ynov-lanzafame.git
cd ci-cd-ynov-lanzafame

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec l'URL de l'API de production

# 4. Démarrer en mode développement
npm start
```

L'application sera accessible sur `http://localhost:3000`

## Développement local

### Workflow de développement recommandé

1. **Démarrer l'environnement Docker :**
   ```bash
   docker-compose up -d
   ```

2. **Vérifier que tous les services sont en cours d'exécution :**
   ```bash
   docker-compose ps
   ```

3. **Initialiser la base de données (première fois uniquement) :**
   ```bash
   docker-compose exec backend python init_admin.py
   ```

4. **Accéder aux services :**
   - Frontend : http://localhost:3000
   - API : http://localhost:8000/docs (documentation Swagger)
   - Adminer : http://localhost:8080 (user: `user`, password: `password`, server: `db`)

### Debugging et logs

```bash
# Voir les logs en temps réel
docker-compose logs -f backend
docker-compose logs -f frontend

# Accéder au conteneur backend
docker-compose exec backend bash

# Redémarrer un service spécifique
docker-compose restart backend
```

### Gestion de la base de données

**Via Adminer (Interface web) :**
- URL : http://localhost:8080
- Serveur : `db`
- Utilisateur : `user`
- Mot de passe : `password`
- Base de données : `myapp`

**Via ligne de commande :**
```bash
# Se connecter à MySQL
docker-compose exec db mysql -u user -p myapp

# Sauvegarder la base
docker-compose exec db mysqldump -u user -p myapp > backup.sql

# Restaurer la base
docker-compose exec -i db mysql -u user -p myapp < backup.sql
```

## Configuration

### Variables d'environnement

**Frontend (.env) :**
```bash
# URL de l'API backend
REACT_APP_API_URL=http://localhost:8000  # Local Docker
# REACT_APP_API_URL=https://ci-cd-ynov-back-lanzafame.vercel.app  # Production
```

**Backend (backend/.env) :**
```bash
# Base de données
DATABASE_URL=mysql://user:password@db:3306/myapp

# JWT
SECRET_KEY=your-secret-key-here

# Admin par défaut
ADMIN_EMAIL=loise.fenoll@ynov.com
ADMIN_PASSWORD=PvdrTAzTeR247sDnAZBr

# Configuration
ENVIRONMENT=development
```

### Docker Compose

Le projet utilise Docker Compose pour orchestrer les services en local :

```yaml
services:
  db:          # MySQL 8.0
  adminer:     # Interface web pour MySQL
  backend:     # API FastAPI
  frontend:    # Application React (dev)
```

### Scripts disponibles

```bash
# Frontend
npm start             # Développement (port 3000)
npm test              # Tests avec Jest
npm run test:coverage # Tests avec couverture
npm run build         # Build de production
npm run cypress       # Tests E2E avec Cypress
npm run jsdoc         # Génération documentation

# Docker
docker-compose up -d           # Démarrer tous les services
docker-compose down            # Arrêter tous les services
docker-compose logs backend    # Voir les logs du backend
docker-compose exec backend python init_admin.py  # Initialiser admin
```

## 🧪 Tests et Qualité

[![codecov](https://codecov.io/gh/hugolanzafameynov/ci-cd-ynov-lanzafame/branch/master/graph/badge.svg)](https://codecov.io/gh/hugolanzafameynov/ci-cd-ynov-lanzafame)

### Suite de tests complète
- **Tests unitaires** : Jest + React Testing Library
- **Tests d'intégration** : Flux complets de l'application
- **Tests E2E** : Cypress pour les parcours utilisateur
- **Couverture de code** : >80% avec intégration CodeCov

### Commandes de test

```bash
# Tests unitaires et d'intégration
npm test                    # Lancer tous les tests
npm run test:coverage       # Tests avec couverture
npm run test:watch          # Mode watch (développement)
npm run test:all            # Suite complète + rapports

# Tests E2E
npm run cypress             # Interface graphique Cypress
npm run cypress:run         # Tests E2E en ligne de commande
```

### Métriques de couverture

| Métrique | Seuil | Status |
|----------|-------|--------|
| **Lines** | 80% | ![Coverage](https://img.shields.io/badge/coverage-80%25-green) |
| **Functions** | 70% | ![Coverage](https://img.shields.io/badge/coverage-70%25-green) |
| **Branches** | 70% | ![Coverage](https://img.shields.io/badge/coverage-70%25-green) |
| **Statements** | 80% | ![Coverage](https://img.shields.io/badge/coverage-80%25-green) |

## Structure du projet

```
ci-cd-ynov-lanzafame/
├── .github/workflows/          # CI/CD GitHub Actions
│   └── deploy-frontend-pages.yml  # Workflow déploiement
├── backend/                    # API FastAPI (développement local)
│   ├── src/
│   │   ├── controllers/        # Contrôleurs API
│   │   ├── middleware/         # Middlewares (auth, etc.)
│   │   ├── models/             # Modèles SQLAlchemy
│   │   └── database.py         # Configuration base de données
│   ├── Dockerfile              # Image Docker backend
│   ├── requirements.txt        # Dépendances Python
│   ├── server.py               # Point d'entrée FastAPI
│   └── init_admin.py           # Script d'initialisation admin
├── src/                        # Application React
│   ├── __tests__/              # Utilitaires de test
│   │   └── test-utils.js       # Helpers pour tests (renderWithProviders, mocks)
│   ├── components/             # Composants React
│   │   ├── auth/               # Authentification
│   │   │   ├── Login.js        # Formulaire de connexion
│   │   │   ├── Register.js     # Formulaire d'inscription
│   │   │   ├── Auth.css        # Styles auth
│   │   │   └── __tests__/      # Tests composants auth
│   │   │       ├── Login.test.js    # Tests formulaire connexion
│   │   │       └── Register.test.js # Tests formulaire inscription
│   │   ├── dashboard/          # Tableau de bord
│   │   │   ├── Dashboard.js    # Composant principal
│   │   │   ├── Dashboard.css   # Styles dashboard
│   │   │   └── __tests__/
│   │   │       └── Dashboard.test.js # Tests tableau de bord
│   │   ├── userlist/           # Gestion utilisateurs
│   │   │   ├── UserList.js     # Liste des utilisateurs
│   │   │   ├── UserList.css    # Styles liste
│   │   │   └── UserList.test.js # Tests liste utilisateurs
│   │   └── common/             # Composants partagés
│   │       ├── ProtectedRoute.js   # Routes protégées
│   │       ├── ColdStartLoader.js  # Loader pour API froide
│   │       ├── Common.css          # Styles communs
│   │       └── __tests__/
│   │           └── ColdStartLoader.test.js # Tests loader
│   ├── contexts/               # Context API React
│   │   ├── AuthContext.js      # Contexte authentification
│   │   └── __tests__/
│   │       └── AuthContext.test.js # Tests contexte auth
│   ├── hooks/                  # Hooks React personnalisés
│   │   ├── useColdStartApi.js  # Hook pour gestion cold start
│   │   └── __tests__/
│   │       └── useColdStartApi.test.js # Tests hook cold start
│   ├── services/               # Services externes
│   │   ├── api.js              # Client API (Axios)
│   │   └── __tests__/
│   │       └── api.test.js     # Tests service API
│   ├── App.js                  # Composant racine
│   ├── App.css                 # Styles globaux
│   ├── index.js                # Point d'entrée
│   ├── setupTests.js           # Configuration Jest
│   └── module.js               # Fonctions utilitaires
├── public/                     # Assets statiques
│   ├── index.html              # Template HTML + SPA routing
│   └── 404.html                # Page 404 pour GitHub Pages
├── cypress/                    # Tests E2E
│   ├── e2e/
│   │   └── spec.cy.js          # Tests end-to-end
│   └── support/                # Configuration Cypress
├── coverage/                   # Rapports de couverture (généré)
├── docs/                       # Documentation générée
├── .codecov.yml               # Configuration CodeCov
├── jest.config.json           # Configuration Jest
├── docker-compose.yml         # Orchestration Docker
├── init-db.sql                # Script d'initialisation MySQL
├── Dockerfile                 # Image Docker frontend (prod)
└── package.json               # Configuration npm + scripts tests
```

## API Integration

### Endpoints utilisés

```javascript
// Authentification
POST /v1/login              // Connexion utilisateur
POST /v1/users              // Inscription utilisateur

// Gestion utilisateurs (admin uniquement)
GET  /v1/users              // Liste des utilisateurs
DELETE /v1/users/{id}       // Suppression utilisateur
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

### Gestion du Cold Start

L'application inclut une gestion intelligente du "cold start" des APIs hébergées (Vercel, etc.) :

```javascript
// Hook personnalisé pour gérer les délais de démarrage
const { executeWithColdStart, isColdStartLoading } = useColdStartApi();

// Utilisation
const result = await executeWithColdStart(
  () => api.login(credentials),
  'Réveil du serveur en cours...'
);
```

## 👤 Compte de test

Pour tester l'application, utilisez le compte administrateur :

```
Email: loise.fenoll@ynov.com
Mot de passe: PvdrTAzTeR247sDnAZBr
```

## 🚀 Déploiement en production

### GitHub Pages (automatique)

Le déploiement se fait automatiquement via GitHub Actions :

1. **Push** sur la branche `master`
2. **Build** automatique de l'application React
3. **Déploiement** sur GitHub Pages

**Déclencheurs du workflow :**
- Modifications dans `src/`, `public/`, `package.json`
- Modifications des workflows GitHub Actions

**Variables d'environnement configurables via GitHub Secrets :**
- `REACT_APP_API_URL` : URL de l'API backend
- `SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` : Configuration admin

### Configuration manuelle du déploiement

1. **Configurer les GitHub Secrets :**
   ```
   REACT_APP_API_URL=https://ci-cd-ynov-back-lanzafame.vercel.app
   ```

2. **Activer GitHub Pages :**
   - Aller dans Settings > Pages
   - Source : GitHub Actions

3. **Build et déploiement manuel :**
   ```bash
   npm run build
   # Les fichiers sont dans le dossier build/
   ```

## Documentation

- **API Backend** : [Swagger UI](http://localhost:8000/docs) (en local)
- **JSDoc Frontend** : Généré via `npm run jsdoc`
