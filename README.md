# Projet Cloud S5 - Suivi des Travaux Routiers Antananarivo

Application web et mobile pour suivre les travaux routiers a Antananarivo.
Les citoyens signalent les problemes sur une carte, les managers gerent l'avancement des travaux.

## Ce que fait l'application

- **Visiteurs** : voient la carte avec tous les signalements et leur statut
- **Utilisateurs mobiles** : signalent les problemes routiers depuis leur telephone avec geolocalisation
- **Managers** : gerent les signalements, changent les statuts, attribuent les entreprises et budgets

## Technologies utilisees

| Composant | Technologie |
|-----------|-------------|
| Backend API | Node.js + Express |
| Base de donnees | PostgreSQL |
| Auth cloud | Firebase Authentication |
| Sync donnees | Firebase Firestore |
| Frontend Web | React + Leaflet |
| Mobile | Ionic Vue + Capacitor |
| Documentation API | Swagger |
| Conteneurisation | Docker Compose |

## Structure du projet

```
├── backend/          # API REST (auth, signalements, sync Firebase)
├── web/              # Application Web React (visiteurs + managers)
├── mobile/           # Application Mobile Ionic Vue
├── docker/           # Config Docker (PostgreSQL, tiles)
└── docker-compose.yml
```

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/PrayingGoat/WEB_AVANCE.git
cd WEB_AVANCE
```

### 2. Configurer l'environnement

```bash
copy backend\.env.example backend\.env
```

Remplir les variables Firebase dans `backend/.env` si besoin (optionnel, l'app marche sans).

### 3. Lancer avec Docker

```bash
docker-compose up -d --build
```

### 4. Ou lancer manuellement

```bash
# Backend
cd backend && npm install && npm run dev

# Web
cd web && npm install && npm start

# Mobile
cd mobile && npm install && ionic serve
```

### Acces

| Service | URL |
|---------|-----|
| Application Web | http://localhost:3001 |
| API Backend | http://localhost:3000 |
| Documentation Swagger | http://localhost:3000/api-docs |

### Compte manager par defaut

- Email : `admin@travaux-routiers.mg`
- Mot de passe : `admin123`

## Fonctionnalites

### API REST

- Inscription et connexion avec JWT
- Limitation des tentatives de connexion (3 max, puis blocage)
- Deblocage des comptes par le manager
- CRUD complet des signalements
- Statistiques (total, en cours, termines, avancement %)
- Synchronisation Firebase (auth + Firestore)
- Documentation Swagger complete

### Application Web

- Carte interactive centree sur Antananarivo avec marqueurs colores par statut
- Infobulles au survol (statut, budget, entreprise)
- Popup au clic avec details complets
- Tableau recapitulatif des signalements
- Filtrage par statut
- Dashboard manager avec statistiques
- Gestion des signalements (modifier statut, budget, entreprise)
- Gestion des utilisateurs (creer, bloquer, debloquer)
- Page de synchronisation Firebase

### Application Mobile

- Connexion utilisateur ou mode visiteur
- Carte avec geolocalisation
- Creation de signalement avec position sur la carte
- Liste des signalements avec filtre "mes signalements"
- Interface Ionic avec navigation par onglets

### Firebase

- Firebase Authentication pour la sync des comptes utilisateurs
- Firestore pour la sync des signalements (necessite plan Blaze)
- Basculement automatique PostgreSQL si Firebase indisponible
- Bouton de synchronisation manuelle dans le dashboard manager
