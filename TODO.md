# TODO List - Projet Cloud S5
## Suivi des Travaux Routiers Antananarivo

---

## Phase 1 : Conception et Préparation ✅

### 1.1 Organisation de l'équipe
- [x] Créer la structure de projet
- [x] Initialiser le repo Git
- [ ] Créer le repo GitHub/GitLab public
- [ ] Définir les rôles de l'équipe

### 1.2 Conception de la base de données
- [x] Créer le MCD (Modèle Conceptuel de Données)
- [x] Identifier les entités : Utilisateur, Signalement, Entreprise, Session
- [x] Définir les relations et cardinalités
- [x] Transformer en MLD puis en MPD
- [x] Rédiger les scripts SQL pour PostgreSQL

### 1.3 Architecture technique
- [x] Choisir le framework backend (Node.js)
- [x] Choisir le framework Web (React)
- [x] Choisir le framework Mobile (Ionic Vue)
- [ ] Documenter l'architecture globale
- [x] Définir les endpoints de l'API REST

---

## Phase 2 : Infrastructure Docker ✅

### 2.1 Configuration Docker
- [x] Créer le fichier `docker-compose.yml` principal
- [x] Configurer le conteneur PostgreSQL
- [x] Configurer le conteneur pour l'API d'authentification
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

## Phase 3 : Module Authentification - API REST ✅

### 3.1 Configuration Firebase
- [ ] Créer un projet Firebase
- [ ] Activer l'authentification email/password
- [ ] Configurer Firestore pour les données
- [ ] Récupérer les clés de configuration
- [ ] Tester la connexion Firebase

### 3.2 Développement de l'API
- [x] Créer la structure du projet Node.js
- [x] Installer les dépendances (Express, Firebase Admin, pg, etc.)
- [x] Configurer les variables d'environnement
- [ ] Implémenter la détection de connexion Internet
- [ ] Configurer le basculement Firebase ↔ PostgreSQL

### 3.3 Endpoints d'authentification
- [x] `POST /api/auth/register` - Inscription
- [x] `POST /api/auth/login` - Connexion
- [x] `POST /api/auth/logout` - Déconnexion
- [x] `GET /api/auth/me` - Récupérer infos utilisateur
- [x] `PUT /api/auth/me` - Modification infos utilisateur

### 3.4 Gestion des sessions et sécurité
- [x] Implémenter JWT pour les sessions
- [x] Définir la durée de vie des sessions
- [x] Implémenter le compteur de tentatives de connexion
- [x] Rendre le nombre de tentatives paramétrable (défaut: 3)
- [x] Implémenter le blocage de compte
- [x] `POST /api/auth/unblock/:userId` - Débloquer un utilisateur

### 3.5 Documentation Swagger
- [x] Installer Swagger/OpenAPI
- [x] Documenter tous les endpoints
- [x] Ajouter les schémas de requêtes/réponses
- [x] Tester l'interface Swagger UI

---

## Phase 4 : Module Web - Application React ✅

### 4.1 Setup du projet frontend
- [x] Initialiser le projet React
- [x] Configurer React Router
- [x] Installer les dépendances (Leaflet, Axios, etc.)
- [x] Créer la structure des composants
- [x] Configurer les variables d'environnement

### 4.2 Intégration Leaflet
- [x] Configurer Leaflet avec OpenStreetMap
- [x] Centrer la carte sur Antananarivo
- [x] Créer les différents types de marqueurs (par statut)
- [x] Implémenter le zoom et la navigation

### 4.3 Fonctionnalités Visiteurs (Visualisation Interactive)
- [x] Afficher la carte avec les signalements
- [x] Implémenter le survol des marqueurs avec popup
- [x] Afficher les infos : date, statut, surface, budget, entreprise
- [x] Créer le tableau de récapitulation
- [x] Styliser l'interface visiteur
- [x] **Tooltips (infobulles)** : Affichage au survol avec statut, budget, entreprise

### 4.4 Authentification Web
- [x] Créer la page de connexion
- [x] Intégrer l'API d'authentification
- [x] Gérer le stockage du token
- [x] Implémenter la déconnexion
- [x] Protéger les routes Manager

### 4.5 Fonctionnalités Manager
- [x] Dashboard Manager avec statistiques
- [x] Page de création de compte utilisateur
- [x] Bouton de synchronisation Firebase (placeholder)
- [x] Page de gestion des utilisateurs bloqués
- [x] CRUD Signalements
- [x] Modification des statuts

---

## Phase 5 : Module Mobile - Ionic Vue ✅

### 5.1 Setup du projet mobile
- [x] Initialiser le projet Ionic Vue
- [x] Configurer les plugins Capacitor
- [x] Installer les dépendances
- [x] Configurer les variables d'environnement

### 5.2 Authentification mobile
- [x] Créer l'écran de connexion
- [x] Gérer la persistance de session (Capacitor Preferences)
- [x] Implémenter la déconnexion
- [ ] Intégrer Firebase Authentication (optionnel)

### 5.3 Fonctionnalités carte mobile
- [x] Intégrer Leaflet avec OpenStreetMap
- [x] Implémenter la géolocalisation
- [x] Afficher la position actuelle
- [x] Afficher les signalements existants

### 5.4 Signalement Géolocalisé de Problèmes
- [x] Formulaire de création de signalement
- [x] Sélection de la position sur la carte (marqueur déplaçable)
- [x] **Géolocalisation automatique** : Bouton "Utiliser ma position"
- [x] Clic sur la carte pour sélectionner la position
- [ ] Prise de photo (optionnel)
- [x] Envoi du signalement vers l'API

### 5.5 Vue utilisateur
- [x] Afficher la carte avec tous les signalements
- [x] Afficher le tableau récapitulatif (liste)
- [x] Implémenter le filtre "Mes signalements uniquement"

### 5.6 Build APK
- [x] Initialiser le projet Android avec Capacitor
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
