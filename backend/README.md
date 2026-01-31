# API d'Authentification - Travaux Routiers Antananarivo

API REST pour l'authentification et la gestion des utilisateurs avec basculement automatique Firebase/PostgreSQL.

## Fonctionnalités

- ✅ Authentification email/password avec JWT
- ✅ Inscription et gestion des utilisateurs
- ✅ Basculement automatique Firebase ↔ PostgreSQL (online/offline)
- ✅ Limitation des tentatives de connexion
- ✅ Blocage automatique après X tentatives
- ✅ API de déblocage pour les managers
- ✅ Documentation Swagger interactive
- ✅ Gestion des sessions avec durée de vie configurable

## Prérequis

- Node.js 18+
- PostgreSQL (via Docker ou local)
- (Optionnel) Compte Firebase pour le mode online

## Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration

Copier le fichier d'environnement exemple :

```bash
cp .env.example .env
```

Modifier les variables dans `.env` selon vos besoins :

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=travaux_routiers
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Security
MAX_LOGIN_ATTEMPTS=3
LOCK_TIME_HOURS=24

# Firebase (optionnel)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

### 3. Démarrage

#### Mode développement (avec hot-reload)

```bash
npm run dev
```

#### Mode production

```bash
npm start
```

## Utilisation avec Docker

```bash
# Depuis la racine du projet
docker-compose up backend
```

L'API sera accessible sur http://localhost:3000

## Documentation API

### Swagger UI

Accédez à la documentation interactive sur :

```
http://localhost:3000/api-docs
```

### Endpoints principaux

#### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription | ❌ |
| POST | `/api/auth/login` | Connexion | ❌ |
| POST | `/api/auth/logout` | Déconnexion | ✅ |
| GET | `/api/auth/me` | Infos utilisateur | ✅ |
| PUT | `/api/auth/me` | Modifier infos | ✅ |

#### Gestion des utilisateurs (Managers)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/auth/blocked-users` | Liste bloqués | ✅ Manager |
| POST | `/api/auth/unblock/:userId` | Débloquer | ✅ Manager |

## Exemples d'utilisation

### Inscription

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "nom": "Doe",
    "prenom": "John"
  }'
```

### Connexion

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@travaux-routiers.mg",
    "password": "admin123"
  }'
```

Réponse :

```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h",
    "user": {
      "id": 1,
      "email": "admin@travaux-routiers.mg",
      "nom": "Admin",
      "prenom": "Principal",
      "role": "MANAGER"
    }
  }
}
```

### Récupérer les infos utilisateur

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Débloquer un utilisateur (Manager uniquement)

```bash
curl -X POST http://localhost:3000/api/auth/unblock/2 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Sécurité

### Gestion des tentatives de connexion

- Par défaut : 3 tentatives maximum
- Après dépassement : compte bloqué pour 24h
- Déblocage automatique après la période OU déblocage manuel par un Manager

### JWT

- Tokens signés avec HS256
- Durée de vie configurable (24h par défaut)
- Stockés en base de données pour validation côté serveur

### Mots de passe

- Hashés avec bcrypt (10 rounds)
- Jamais stockés en clair
- Validation de longueur minimale (6 caractères)

## Basculement Firebase/PostgreSQL

L'API détecte automatiquement la disponibilité d'Internet :

### Mode Online (Firebase)
- Utilise Firebase Authentication
- Synchronisation avec Firestore
- Idéal pour mobile en ligne

### Mode Offline (PostgreSQL)
- Bascule automatiquement sur PostgreSQL local
- Aucune interruption de service
- Parfait pour environnement sans Internet

## Structure du projet

```
backend/
├── src/
│   ├── config/          # Configuration (DB, Firebase, Swagger)
│   ├── controllers/     # Contrôleurs
│   ├── middleware/      # Middleware (auth, validation)
│   ├── routes/          # Routes Express
│   ├── services/        # Logique métier
│   ├── app.js           # Configuration Express
│   └── server.js        # Point d'entrée
├── Dockerfile
├── package.json
└── README.md
```

## Tests

```bash
npm test
```

## Compte par défaut

Pour tester l'API, un compte Manager est créé automatiquement :

- **Email** : admin@travaux-routiers.mg
- **Mot de passe** : admin123
- **Rôle** : MANAGER

⚠️ **Important** : Changez ce mot de passe en production !

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NODE_ENV` | Environnement | `development` |
| `PORT` | Port du serveur | `3000` |
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nom de la base | `travaux_routiers` |
| `DB_USER` | Utilisateur DB | `postgres` |
| `DB_PASSWORD` | Mot de passe DB | `postgres` |
| `JWT_SECRET` | Secret JWT | *(requis)* |
| `JWT_EXPIRES_IN` | Durée token | `24h` |
| `MAX_LOGIN_ATTEMPTS` | Tentatives max | `3` |
| `LOCK_TIME_HOURS` | Durée blocage | `24` |
| `CORS_ORIGIN` | Origine CORS | `*` |

## Dépannage

### La base de données ne se connecte pas

1. Vérifier que PostgreSQL est démarré
2. Vérifier les credentials dans `.env`
3. Vérifier les logs : `docker-compose logs postgres`

### Firebase ne fonctionne pas

C'est normal si les credentials ne sont pas configurés. L'API basculera automatiquement sur PostgreSQL.

Pour activer Firebase :
1. Créer un projet sur https://console.firebase.google.com
2. Activer Authentication (Email/Password)
3. Récupérer les credentials du Service Account
4. Les ajouter dans `.env`

### Token invalide/expiré

Les tokens JWT expirent après 24h par défaut. Reconnectez-vous pour obtenir un nouveau token.

## Support

Pour toute question ou problème, ouvrir une issue sur le repository GitHub.

## License

ISC - Projet académique Promotion 17