# Projet Cloud S5 - Suivi des Travaux Routiers Antananarivo
## Promotion 17

### Description
Application de gestion et suivi des travaux routiers sur la ville d'Antananarivo.
Le système comprend :
- Une API REST d'authentification avec basculement Firebase/PostgreSQL
- Une application Web pour visiteurs et managers
- Une application mobile pour signaler les problèmes routiers
- Un serveur de cartes offline

### Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Backend API | Node.js + Express |
| Base de données locale | PostgreSQL (Docker) |
| Auth online | Firebase Authentication |
| Frontend Web | React |
| Mobile | Ionic Vue |
| Cartes Web | Leaflet + Serveur offline |
| Cartes Mobile | Leaflet + OpenStreetMap online |
| Documentation API | Swagger/OpenAPI |
| Conteneurisation | Docker + Docker Compose |

### Structure du Projet

```
.
├── backend/           # API d'authentification (Node.js + Express)
├── web/              # Application Web (React)
├── mobile/           # Application Mobile (Ionic Vue)
├── docker/           # Configurations Docker
│   ├── postgres/     # Configuration PostgreSQL
│   └── tile-server/  # Serveur de cartes offline
├── docs/             # Documentation technique
└── docker-compose.yml
```

### Prérequis

- Docker & Docker Compose
- Node.js 18+ et npm
- Git

### Installation

1. Cloner le repository
```bash
git clone https://github.com/PrayingGoat/WEB_AVANCE.git
cd WEB_AVANCE
```

2. Configuration de l'environnement
Copiez les fichiers d'exemple pour créer vos fichiers de configuration locale :
```bash
# Windows (Powershell)
copy backend\.env.example backend\.env
copy web\.env.example web\.env
copy mobile\.env.example mobile\.env

# Linux/Mac
cp backend/.env.example backend/.env
cp web/.env.example web/.env
cp mobile/.env.example mobile/.env
```

3. Base de données
Le script complet d'initialisation de la base de données se trouve dans :
`docker/postgres/init.sql`
Il est automatiquement exécuté au premier lancement du conteneur Docker.

4. Démarrer le projet (Docker)
C'est la méthode recommandée pour tout lancer (Base de données, API, Web, Carte).
```bash
docker-compose up -d --build
```

L'application sera accessible sur :
- **Web :** http://localhost:3001
- **API :** http://localhost:3000
- **Swagger (Doc API) :** http://localhost:3000/api-docs

5. Installer les dépendances backend
```bash
cd backend
npm install
npm run dev
```

6. Installer les dépendances web
```bash
cd web
npm install
npm start
```

7. Installer les dépendances mobile
```bash
cd mobile
npm install
ionic serve
```

### Fonctionnalités

#### Module Authentification (API REST)
- Authentification email/password
- Inscription
- Modification des informations utilisateur
- Gestion des sessions avec durée de vie
- Limitation des tentatives de connexion (3 par défaut)
- Déblocage d'utilisateurs via API
- Basculement automatique Firebase ↔ PostgreSQL selon connexion Internet
- Documentation Swagger

#### Module Web
**Visiteurs (sans compte)**
- Visualisation de la carte avec les signalements
- Informations détaillées au survol (date, statut, surface, budget, entreprise)
- Tableau récapitulatif (nombre de points, surface totale, avancement %, budget total)

**Managers (avec compte)**
- Création de comptes utilisateurs
- Synchronisation bidirectionnelle avec Firebase
- Déblocage des utilisateurs bloqués
- Gestion des signalements (surface, budget, entreprise, statut)
- Modification des statuts (nouveau → en cours → terminé)

#### Module Mobile
- Authentification via Firebase (inscription par Manager uniquement)
- Signalement de problèmes routiers avec géolocalisation
- Visualisation de la carte et des signalements
- Filtre "Mes signalements uniquement"
- Tableau récapitulatif

### Équipe

| Nom | Prénom | NumETU | Rôle |
|-----|--------|--------|------|
|     |        |        |      |
|     |        |        |      |
|     |        |        |      |
|     |        |        |      |

### Documentation

La documentation technique complète est disponible dans le dossier `docs/`.
La documentation API Swagger est accessible sur `http://localhost:3000/api-docs` quand le backend est lancé.

### Livrables

- Code source sur GitHub/GitLab (public)
- Documentation technique (PDF)
- APK signé pour mobile
- Docker Compose fonctionnel
- Documentation Swagger

### License

Projet académique - Promotion 17

---

**V1:** 13 janvier 2026
**V2:** 20 janvier 2026
