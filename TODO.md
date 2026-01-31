# TODO List - Projet Cloud S5
## Suivi des Travaux Routiers Antananarivo

---

## Phase 1 : Conception et Préparation ✓

### 1.1 Organisation de l'équipe
- [x] Créer la structure de projet
- [x] Initialiser le repo Git
- [ ] Créer le repo GitHub/GitLab public
- [ ] Mettre en place l'outil de suivi des tâches
- [ ] Définir les rôles de l'équipe

### 1.2 Conception de la base de données
- [ ] Créer le MCD (Modèle Conceptuel de Données)
- [ ] Identifier les entités : Utilisateur, Signalement, Entreprise, Session
- [ ] Définir les relations et cardinalités
- [ ] Transformer en MLD puis en MPD
- [ ] Rédiger les scripts SQL pour PostgreSQL

### 1.3 Architecture technique
- [x] Choisir le framework backend (Node.js)
- [x] Choisir le framework Web (React)
- [x] Choisir le framework Mobile (Ionic Vue)
- [ ] Documenter l'architecture globale
- [ ] Définir les endpoints de l'API REST

---

## Phase 2 : Infrastructure Docker

### 2.1 Configuration Docker
- [ ] Créer le fichier `docker-compose.yml` principal
- [ ] Configurer le conteneur PostgreSQL
- [ ] Configurer le conteneur pour l'API d'authentification
- [ ] Configurer le conteneur pour le serveur de cartes offline
- [ ] Tester la communication entre conteneurs
- [ ] Documenter les commandes Docker

### 2.2 Serveur de cartes offline
- [ ] Choisir le serveur de tuiles (TileServer GL recommandé)
- [ ] Télécharger les données OSM d'Antananarivo
- [ ] Générer les tuiles pour la carte offline
- [ ] Tester l'affichage des rues d'Antananarivo
- [ ] Configurer le service dans Docker

---

## Phase 3 : Module Authentification - API REST

### 3.1 Configuration Firebase
- [ ] Créer un projet Firebase
- [ ] Activer l'authentification email/password
- [ ] Configurer Firestore pour les données
- [ ] Récupérer les clés de configuration
- [ ] Tester la connexion Firebase

### 3.2 Développement de l'API
- [ ] Créer la structure du projet Node.js
- [ ] Installer les dépendances (Express, Firebase Admin, pg, etc.)
- [ ] Configurer les variables d'environnement
- [ ] Implémenter la détection de connexion Internet
- [ ] Configurer le basculement Firebase ↔ PostgreSQL

### 3.3 Endpoints d'authentification
- [ ] `POST /api/auth/register` - Inscription
- [ ] `POST /api/auth/login` - Connexion
- [ ] `POST /api/auth/logout` - Déconnexion
- [ ] `GET /api/auth/user` - Récupérer infos utilisateur
- [ ] `PUT /api/auth/user` - Modification infos utilisateur

### 3.4 Gestion des sessions et sécurité
- [ ] Implémenter JWT pour les sessions
- [ ] Définir la durée de vie des sessions
- [ ] Implémenter le compteur de tentatives de connexion
- [ ] Rendre le nombre de tentatives paramétrable (défaut: 3)
- [ ] Implémenter le blocage de compte
- [ ] `POST /api/auth/unblock/:userId` - Débloquer un utilisateur

### 3.5 Documentation Swagger
- [ ] Installer Swagger/OpenAPI
- [ ] Documenter tous les endpoints
- [ ] Ajouter les schémas de requêtes/réponses
- [ ] Tester l'interface Swagger UI

---

## Phase 4 : Module Web - Application React

### 4.1 Setup du projet frontend
- [ ] Initialiser le projet React
- [ ] Configurer React Router
- [ ] Installer les dépendances (Leaflet, Axios, etc.)
- [ ] Créer la structure des composants
- [ ] Configurer les variables d'environnement

### 4.2 Intégration Leaflet
- [ ] Configurer Leaflet avec le serveur de cartes offline
- [ ] Centrer la carte sur Antananarivo
- [ ] Créer les différents types de marqueurs
- [ ] Implémenter le zoom et la navigation

### 4.3 Fonctionnalités Visiteurs
- [ ] Afficher la carte avec les signalements
- [ ] Implémenter le survol des marqueurs avec popup
- [ ] Afficher les infos : date, statut, surface, budget, entreprise
- [ ] Créer le tableau de récapitulation
- [ ] Styliser l'interface visiteur

### 4.4 Authentification Web
- [ ] Créer la page de connexion
- [ ] Intégrer l'API d'authentification
- [ ] Gérer le stockage du token
- [ ] Implémenter la déconnexion
- [ ] Protéger les routes Manager

### 4.5 Fonctionnalités Manager
- [ ] Dashboard Manager
- [ ] Page de création de compte utilisateur
- [ ] Bouton de synchronisation Firebase
- [ ] Page de gestion des utilisateurs bloqués
- [ ] CRUD Signalements
- [ ] Modification des statuts

---

## Phase 5 : Module Mobile - Ionic Vue

### 5.1 Setup du projet mobile
- [ ] Initialiser le projet Ionic Vue
- [ ] Configurer les plugins Capacitor
- [ ] Installer les dépendances
- [ ] Configurer les variables d'environnement

### 5.2 Authentification mobile
- [ ] Intégrer Firebase Authentication
- [ ] Créer l'écran de connexion
- [ ] Gérer la persistance de session
- [ ] Implémenter la déconnexion

### 5.3 Fonctionnalités carte mobile
- [ ] Intégrer Leaflet avec OpenStreetMap
- [ ] Implémenter la géolocalisation
- [ ] Afficher la position actuelle
- [ ] Afficher les signalements existants

### 5.4 Signalement de problèmes
- [ ] Formulaire de création de signalement
- [ ] Sélection de la position sur la carte
- [ ] Prise de photo (optionnel)
- [ ] Envoi du signalement vers Firebase

### 5.5 Vue utilisateur
- [ ] Afficher la carte avec tous les signalements
- [ ] Afficher le tableau récapitulatif
- [ ] Implémenter le filtre "Mes signalements uniquement"

### 5.6 Build APK
- [ ] Configurer les icônes et splash screen
- [ ] Build debug APK
- [ ] Tester sur appareil/émulateur
- [ ] Build release APK signé

---

## Phase 6 : Tests et Intégration

### 6.1 Tests
- [ ] Tests API authentification
- [ ] Tests des services Web
- [ ] Tests des services Mobile
- [ ] Tests d'intégration complets

---

## Phase 7 : Documentation

### 7.1 Documentation technique
- [ ] Introduction et objectifs
- [ ] Architecture globale (schéma)
- [ ] MCD avec explications
- [ ] Guide d'installation Docker
- [ ] Guide de déploiement

### 7.2 Scénarios d'utilisation
- [ ] Scénario Visiteur avec captures d'écran
- [ ] Scénario Manager avec captures d'écran
- [ ] Scénario Mobile avec captures d'écran

### 7.3 Informations équipe
- [ ] Liste des membres avec NumETU
- [ ] Répartition des tâches

---

## Phase 8 : Finalisation

### 8.1 Livrables
- [ ] Code source sur GitHub/GitLab (public)
- [ ] Documentation technique (PDF)
- [ ] APK signé pour mobile
- [ ] Fichier docker-compose fonctionnel
- [ ] Documentation Swagger exportée

### 8.2 Vérifications finales
- [ ] Tous les conteneurs Docker démarrent
- [ ] L'API Swagger est accessible
- [ ] L'application Web fonctionne
- [ ] L'APK s'installe et fonctionne
- [ ] La synchronisation Firebase fonctionne
- [ ] Le mode offline fonctionne