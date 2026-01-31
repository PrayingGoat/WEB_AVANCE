# Modèle Conceptuel de Données (MCD)
## Projet Suivi des Travaux Routiers - Antananarivo

---

## Entités Principales

### 1. UTILISATEUR
Représente les utilisateurs du système (Managers et Utilisateurs mobiles).

**Attributs :**
- `id_utilisateur` : INTEGER (PK, AUTO_INCREMENT)
- `email` : VARCHAR(255) UNIQUE NOT NULL
- `password_hash` : VARCHAR(255) NOT NULL (hashé avec bcrypt)
- `nom` : VARCHAR(100)
- `prenom` : VARCHAR(100)
- `role` : ENUM('MANAGER', 'USER') DEFAULT 'USER'
- `firebase_uid` : VARCHAR(255) UNIQUE (nullable, pour sync Firebase)
- `est_bloque` : BOOLEAN DEFAULT FALSE
- `tentatives_connexion` : INTEGER DEFAULT 0
- `date_blocage` : TIMESTAMP (nullable)
- `date_creation` : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `date_modification` : TIMESTAMP DEFAULT CURRENT_TIMESTAMP

**Règles :**
- Un utilisateur peut avoir le rôle MANAGER (accès Web) ou USER (accès Mobile)
- Le blocage se déclenche après X tentatives échouées (paramétrable, défaut: 3)
- Le firebase_uid est utilisé pour la synchronisation avec Firebase

---

### 2. SIGNALEMENT
Représente un problème routier signalé sur la carte.

**Attributs :**
- `id_signalement` : INTEGER (PK, AUTO_INCREMENT)
- `id_utilisateur` : INTEGER (FK → UTILISATEUR) (nullable pour signalements anonymes)
- `id_entreprise` : INTEGER (FK → ENTREPRISE) (nullable)
- `latitude` : DECIMAL(10, 8) NOT NULL
- `longitude` : DECIMAL(11, 8) NOT NULL
- `adresse` : VARCHAR(255)
- `description` : TEXT
- `statut` : ENUM('NOUVEAU', 'EN_COURS', 'TERMINE') DEFAULT 'NOUVEAU'
- `surface_m2` : DECIMAL(10, 2) (nullable)
- `budget` : DECIMAL(15, 2) (nullable)
- `photo_url` : VARCHAR(500) (nullable)
- `firebase_id` : VARCHAR(255) UNIQUE (nullable, pour sync Firebase)
- `date_signalement` : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `date_modification` : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `date_debut_travaux` : TIMESTAMP (nullable)
- `date_fin_travaux` : TIMESTAMP (nullable)

**Règles :**
- Un signalement peut être créé par un utilisateur mobile ou ajouté par le manager
- Les champs surface_m2, budget, et id_entreprise sont renseignés par le Manager
- Le statut évolue : NOUVEAU → EN_COURS → TERMINE

---

### 3. ENTREPRISE
Représente les entreprises en charge des travaux routiers.

**Attributs :**
- `id_entreprise` : INTEGER (PK, AUTO_INCREMENT)
- `nom` : VARCHAR(200) NOT NULL
- `telephone` : VARCHAR(20)
- `email` : VARCHAR(255)
- `adresse` : VARCHAR(500)
- `date_creation` : TIMESTAMP DEFAULT CURRENT_TIMESTAMP

**Règles :**
- Une entreprise peut gérer plusieurs signalements
- Les informations sont gérées par les Managers

---

### 4. SESSION
Gère les sessions utilisateurs et l'historique des connexions.

**Attributs :**
- `id_session` : INTEGER (PK, AUTO_INCREMENT)
- `id_utilisateur` : INTEGER (FK → UTILISATEUR)
- `token` : VARCHAR(500) UNIQUE NOT NULL (JWT token)
- `ip_address` : VARCHAR(45)
- `user_agent` : VARCHAR(500)
- `est_active` : BOOLEAN DEFAULT TRUE
- `date_creation` : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `date_expiration` : TIMESTAMP NOT NULL
- `date_derniere_activite` : TIMESTAMP DEFAULT CURRENT_TIMESTAMP

**Règles :**
- Une session a une durée de vie définie (ex: 24h, 7 jours)
- Les sessions expirées sont automatiquement invalidées
- Un utilisateur peut avoir plusieurs sessions actives (multi-device)

---

### 5. PARAMETRE_SYSTEME (Optionnel mais recommandé)
Stocke les paramètres configurables du système.

**Attributs :**
- `id_parametre` : INTEGER (PK, AUTO_INCREMENT)
- `cle` : VARCHAR(100) UNIQUE NOT NULL
- `valeur` : VARCHAR(500) NOT NULL
- `description` : TEXT
- `date_modification` : TIMESTAMP DEFAULT CURRENT_TIMESTAMP

**Exemples de paramètres :**
- `max_tentatives_connexion` : 3
- `duree_session_heures` : 24
- `duree_blocage_heures` : 24

---

## Relations

### 1. UTILISATEUR ─── SIGNALEMENT
- **Type :** 1,N (Un utilisateur peut créer plusieurs signalements)
- **Cardinalité :** (0,N) côté SIGNALEMENT, (1,1) côté UTILISATEUR
- **Clé étrangère :** `id_utilisateur` dans SIGNALEMENT

### 2. ENTREPRISE ─── SIGNALEMENT
- **Type :** 1,N (Une entreprise peut gérer plusieurs signalements)
- **Cardinalité :** (0,N) côté SIGNALEMENT, (0,1) côté ENTREPRISE
- **Clé étrangère :** `id_entreprise` dans SIGNALEMENT

### 3. UTILISATEUR ─── SESSION
- **Type :** 1,N (Un utilisateur peut avoir plusieurs sessions)
- **Cardinalité :** (1,N) côté SESSION, (1,1) côté UTILISATEUR
- **Clé étrangère :** `id_utilisateur` dans SESSION

---

## Contraintes et Règles Métier

1. **Unicité de l'email** : Un email ne peut être utilisé qu'une seule fois
2. **Blocage utilisateur** : Après X tentatives de connexion échouées, le compte est bloqué
3. **Déblocage** : Seul un Manager (via API) peut débloquer un compte
4. **Gestion des statuts** : Les statuts des signalements suivent un ordre logique
5. **Synchronisation Firebase** : Les champs `firebase_uid` et `firebase_id` permettent la sync online/offline
6. **Sessions** : Les sessions expirées sont automatiquement invalides
7. **Géolocalisation** : latitude et longitude sont obligatoires pour un signalement

---

## Schéma MCD (notation textuelle)

```
UTILISATEUR (id_utilisateur, email, password_hash, nom, prenom, role, firebase_uid,
             est_bloque, tentatives_connexion, date_blocage, date_creation, date_modification)

SIGNALEMENT (id_signalement, #id_utilisateur, #id_entreprise, latitude, longitude,
             adresse, description, statut, surface_m2, budget, photo_url, firebase_id,
             date_signalement, date_modification, date_debut_travaux, date_fin_travaux)

ENTREPRISE (id_entreprise, nom, telephone, email, adresse, date_creation)

SESSION (id_session, #id_utilisateur, token, ip_address, user_agent, est_active,
         date_creation, date_expiration, date_derniere_activite)

PARAMETRE_SYSTEME (id_parametre, cle, valeur, description, date_modification)
```

**Relations :**
- UTILISATEUR (1,N) ──── (0,N) SIGNALEMENT
- ENTREPRISE (0,1) ──── (0,N) SIGNALEMENT
- UTILISATEUR (1,1) ──── (1,N) SESSION

---

## Prochaines étapes

1. Transformer le MCD en MLD (Modèle Logique de Données)
2. Créer les scripts SQL de création des tables
3. Ajouter les index pour optimiser les performances
4. Créer les scripts de migration
5. Générer des données de test