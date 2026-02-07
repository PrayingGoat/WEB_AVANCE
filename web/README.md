# Application Web - Travaux Routiers Antananarivo

Application React pour la visualisation et la gestion des travaux routiers à Antananarivo.

## Fonctionnalités

### Mode Visiteur
- Visualisation de la carte d'Antananarivo avec les signalements
- Consultation des informations sur les travaux en cours
- Liste récapitulative des signalements

### Mode Manager
- Authentification sécurisée
- Dashboard de gestion
- CRUD des signalements
- Gestion des utilisateurs
- Synchronisation Firebase

## Technologies

- React 18
- React Router v6
- Leaflet (cartes interactives)
- Axios (requêtes HTTP)
- Firebase (optionnel, pour mode online)

## Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm start

# Build pour production
npm build
```

## Configuration

Créez un fichier `.env` à la racine avec :

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_TILE_SERVER_URL=http://localhost:8080
```

## Docker

```bash
# Build l'image
docker build -f Dockerfile.dev -t travaux-web .

# Ou utiliser docker-compose
docker-compose up web
```

## Structure du projet

```
web/
├── public/           # Fichiers statiques
├── src/
│   ├── components/   # Composants réutilisables
│   ├── pages/        # Pages de l'application
│   ├── services/     # Services (API, Auth, etc.)
│   ├── App.js        # Composant principal
│   └── index.js      # Point d'entrée
└── package.json
```

## Développement

L'application fonctionne sur le port 3000 (ou 3001 dans Docker).

- Page d'accueil (visiteur) : http://localhost:3000
- Connexion manager : http://localhost:3000/login
- Dashboard manager : http://localhost:3000/manager
