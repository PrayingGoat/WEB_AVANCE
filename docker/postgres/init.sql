-- ============================================
-- Script de création de la base de données
-- Projet: Suivi des Travaux Routiers Antananarivo
-- Encodage: UTF-8
-- ============================================

-- Forcer l'encodage UTF-8
SET client_encoding = 'UTF8';

-- Suppression des tables existantes (pour développement)
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS signalement CASCADE;
DROP TABLE IF EXISTS entreprise CASCADE;
DROP TABLE IF EXISTS utilisateur CASCADE;
DROP TABLE IF EXISTS parametre_systeme CASCADE;

-- Suppression des types ENUM existants
DROP TYPE IF EXISTS role_utilisateur CASCADE;
DROP TYPE IF EXISTS statut_signalement CASCADE;

-- ============================================
-- Création des types ENUM
-- ============================================

CREATE TYPE role_utilisateur AS ENUM ('MANAGER', 'USER');
CREATE TYPE statut_signalement AS ENUM ('NOUVEAU', 'EN_COURS', 'TERMINE');

-- ============================================
-- Table: utilisateur
-- ============================================

CREATE TABLE utilisateur (
    id_utilisateur SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    role role_utilisateur DEFAULT 'USER',
    firebase_uid VARCHAR(255) UNIQUE,
    est_bloque BOOLEAN DEFAULT FALSE,
    tentatives_connexion INTEGER DEFAULT 0,
    date_blocage TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_utilisateur_firebase_uid ON utilisateur(firebase_uid);
CREATE INDEX idx_utilisateur_role ON utilisateur(role);
CREATE INDEX idx_utilisateur_est_bloque ON utilisateur(est_bloque);

-- ============================================
-- Table: entreprise
-- ============================================

CREATE TABLE entreprise (
    id_entreprise SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(255),
    adresse VARCHAR(500),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_entreprise_nom ON entreprise(nom);

-- ============================================
-- Table: signalement
-- ============================================

CREATE TABLE signalement (
    id_signalement SERIAL PRIMARY KEY,
    id_utilisateur INTEGER REFERENCES utilisateur(id_utilisateur) ON DELETE SET NULL,
    id_entreprise INTEGER REFERENCES entreprise(id_entreprise) ON DELETE SET NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    adresse VARCHAR(255),
    description TEXT,
    statut statut_signalement DEFAULT 'NOUVEAU',
    surface_m2 DECIMAL(10, 2),
    budget DECIMAL(15, 2),
    photo_url VARCHAR(500),
    firebase_id VARCHAR(255) UNIQUE,
    date_signalement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_debut_travaux TIMESTAMP,
    date_fin_travaux TIMESTAMP,

    -- Contraintes
    CONSTRAINT check_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT check_longitude CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT check_surface CHECK (surface_m2 IS NULL OR surface_m2 > 0),
    CONSTRAINT check_budget CHECK (budget IS NULL OR budget >= 0),
    CONSTRAINT check_dates_travaux CHECK (date_debut_travaux IS NULL OR date_fin_travaux IS NULL OR date_debut_travaux <= date_fin_travaux)
);

-- Index pour améliorer les performances
CREATE INDEX idx_signalement_utilisateur ON signalement(id_utilisateur);
CREATE INDEX idx_signalement_entreprise ON signalement(id_entreprise);
CREATE INDEX idx_signalement_statut ON signalement(statut);
CREATE INDEX idx_signalement_firebase_id ON signalement(firebase_id);
CREATE INDEX idx_signalement_date ON signalement(date_signalement DESC);
CREATE INDEX idx_signalement_localisation ON signalement(latitude, longitude);

-- ============================================
-- Table: session
-- ============================================

CREATE TABLE session (
    id_session SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    est_active BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP NOT NULL,
    date_derniere_activite TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Contraintes
    CONSTRAINT check_expiration CHECK (date_expiration > date_creation)
);

-- Index
CREATE INDEX idx_session_utilisateur ON session(id_utilisateur);
CREATE INDEX idx_session_token ON session(token);
CREATE INDEX idx_session_active ON session(est_active);
CREATE INDEX idx_session_expiration ON session(date_expiration);

-- ============================================
-- Table: parametre_systeme
-- ============================================

CREATE TABLE parametre_systeme (
    id_parametre SERIAL PRIMARY KEY,
    cle VARCHAR(100) UNIQUE NOT NULL,
    valeur VARCHAR(500) NOT NULL,
    description TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE UNIQUE INDEX idx_parametre_cle ON parametre_systeme(cle);

-- ============================================
-- Insertion des paramètres par défaut
-- ============================================

INSERT INTO parametre_systeme (cle, valeur, description) VALUES
    ('max_tentatives_connexion', '3', 'Nombre maximum de tentatives de connexion avant blocage du compte'),
    ('duree_session_heures', '24', 'Durée de validité d''une session en heures'),
    ('duree_blocage_heures', '24', 'Durée de blocage d''un compte après dépassement des tentatives');

-- ============================================
-- Insertion d'un utilisateur Manager par défaut
-- ============================================

-- Mot de passe: admin123 (hashé avec bcrypt, rounds=10)
INSERT INTO utilisateur (email, password_hash, nom, prenom, role) VALUES
    ('admin@travaux-routiers.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMye7xKl0KEtJzXyQGy9JT9LVSFKFpZNXIa', 'Admin', 'Principal', 'MANAGER'),
    ('admin@travaux.mg', '$2b$10$N9qo8uLOickgx2ZMRZoMye7xKl0KEtJzXyQGy9JT9LVSFKFpZNXIa', 'Admin', 'Système', 'MANAGER');

-- ============================================
-- Insertion d'entreprises de test
-- ============================================

INSERT INTO entreprise (nom, telephone, email, adresse) VALUES
    ('BTP Construction Tana', '+261 20 22 123 45', 'contact@btp-tana.mg', 'Antananarivo, Madagascar'),
    ('Routes et Travaux SA', '+261 20 22 234 56', 'info@routes-travaux.mg', 'Antananarivo, Madagascar'),
    ('Madagascar Infrastructure', '+261 20 22 345 67', 'contact@mada-infra.mg', 'Antananarivo, Madagascar');

-- ============================================
-- Insertion de signalements de test
-- ============================================

-- Coordonnées approximatives d'Antananarivo: -18.8792, 47.5079
INSERT INTO signalement (latitude, longitude, adresse, description, statut, surface_m2, budget, id_entreprise) VALUES
    (-18.8792, 47.5079, 'Avenue de l''Indépendance', 'Nid de poule important sur la chaussée principale', 'EN_COURS', 12.5, 150000.00, 1),
    (-18.9134, 47.5363, 'Analakely', 'Fissures sur la route près du marché', 'NOUVEAU', 8.0, NULL, NULL),
    (-18.8688, 47.5208, 'Rue Ravoninahitriniarivo', 'Affaissement de la chaussée', 'TERMINE', 25.0, 500000.00, 2),
    (-18.9025, 47.5289, 'Boulevard de l''Europe', 'Plusieurs nids de poule alignés', 'NOUVEAU', 15.0, NULL, NULL),
    (-18.8850, 47.5150, 'Gare Soarano', 'Route détériorée nécessitant réfection complète', 'EN_COURS', 45.0, 850000.00, 3);

-- ============================================
-- Fonction: Mise à jour automatique de date_modification
-- ============================================

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mise à jour automatique
CREATE TRIGGER update_utilisateur_modtime
    BEFORE UPDATE ON utilisateur
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_signalement_modtime
    BEFORE UPDATE ON signalement
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_parametre_modtime
    BEFORE UPDATE ON parametre_systeme
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- ============================================
-- Fonction: Nettoyage automatique des sessions expirées
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM session
    WHERE date_expiration < CURRENT_TIMESTAMP
       OR (est_active = FALSE AND date_derniere_activite < CURRENT_TIMESTAMP - INTERVAL '7 days');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Vues utiles
-- ============================================

-- Vue: Statistiques globales des signalements
CREATE OR REPLACE VIEW v_stats_signalements AS
SELECT
    COUNT(*) as total_signalements,
    COUNT(CASE WHEN statut = 'NOUVEAU' THEN 1 END) as nb_nouveaux,
    COUNT(CASE WHEN statut = 'EN_COURS' THEN 1 END) as nb_en_cours,
    COUNT(CASE WHEN statut = 'TERMINE' THEN 1 END) as nb_termines,
    COALESCE(SUM(surface_m2), 0) as surface_totale_m2,
    COALESCE(SUM(budget), 0) as budget_total,
    ROUND(
        (COUNT(CASE WHEN statut = 'TERMINE' THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
        2
    ) as avancement_pct
FROM signalement;

-- Vue: Signalements avec détails
CREATE OR REPLACE VIEW v_signalements_details AS
SELECT
    s.id_signalement,
    s.latitude,
    s.longitude,
    s.adresse,
    s.description,
    s.statut,
    s.surface_m2,
    s.budget,
    s.date_signalement,
    s.date_modification,
    u.email as utilisateur_email,
    u.nom as utilisateur_nom,
    u.prenom as utilisateur_prenom,
    e.nom as entreprise_nom,
    e.telephone as entreprise_telephone
FROM signalement s
LEFT JOIN utilisateur u ON s.id_utilisateur = u.id_utilisateur
LEFT JOIN entreprise e ON s.id_entreprise = e.id_entreprise;

-- ============================================
-- Affichage des statistiques
-- ============================================

SELECT 'Base de données initialisée avec succès !' as message;
SELECT * FROM v_stats_signalements;
