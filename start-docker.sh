#!/bin/bash

# Script de démarrage de l'environnement Docker
echo "🚀 Démarrage de l'environnement Docker..."

# Vérifier si Docker et Docker Compose sont installés
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Arrêter les conteneurs existants s'ils sont en cours d'exécution
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

# Construire et démarrer tous les services
echo "🔨 Construction et démarrage des services..."
docker-compose up --build -d

# Attendre que les services soient prêts
echo "⏳ Attente que les services soient prêts..."
sleep 10

# Afficher le statut des services
echo "📊 Statut des services:"
docker-compose ps

echo ""
echo "✅ Environnement Docker démarré avec succès!"
echo ""
echo "🌐 Services disponibles:"
echo "   - Frontend React: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - Adminer (MySQL): http://localhost:8080"
echo ""
echo "🔑 Connexion Adminer:"
echo "   - Serveur: mysql"
echo "   - Utilisateur: root"
echo "   - Mot de passe: rootpassword"
echo "   - Base de données: userdb"
echo ""
echo "👤 Compte admin par défaut:"
echo "   - Email: loise.fenoll@ynov.com"
echo "   - Mot de passe: PvdrTAzTeR247sDnAZBr"
echo ""
echo "📋 Commandes utiles:"
echo "   - Voir les logs: docker-compose logs -f"
echo "   - Arrêter: docker-compose down"
echo "   - Redémarrer: docker-compose restart"
