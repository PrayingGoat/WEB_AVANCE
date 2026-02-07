/**
 * Configuration de la connexion PostgreSQL
 */

const { Pool } = require('pg');
require('dotenv').config();

// Configuration du pool de connexions PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'travaux_routiers',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Nombre maximum de clients dans le pool
  idleTimeoutMillis: 30000, // Temps d'inactivité avant fermeture
  connectionTimeoutMillis: 2000, // Timeout de connexion
  // Encodage UTF-8 pour les caractères spéciaux (é, è, à, etc.)
  client_encoding: 'UTF8',
});

// Gestion des erreurs du pool
pool.on('error', (err) => {
  console.error('Erreur inattendue sur le client PostgreSQL:', err);
  process.exit(-1);
});

// Test de connexion au démarrage
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erreur de connexion à PostgreSQL:', err.message);
  } else {
    console.log('✅ Connexion à PostgreSQL établie avec succès');
    console.log(`   Base de données: ${process.env.DB_NAME}`);
    console.log(`   Hôte: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  }
});

/**
 * Exécute une requête avec gestion d'erreur
 * @param {string} text - Requête SQL
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise} Résultat de la requête
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log('Query executed:', { text, duration, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Obtient un client du pool pour les transactions
 * @returns {Promise} Client PostgreSQL
 */
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // Wrapper pour ajouter le logging
  client.query = async (...args) => {
    const start = Date.now();
    try {
      const res = await query(...args);
      const duration = Date.now() - start;

      if (process.env.NODE_ENV === 'development') {
        console.log('Transaction query:', { duration, rows: res.rowCount });
      }

      return res;
    } catch (error) {
      console.error('Transaction query error:', error);
      throw error;
    }
  };

  // Wrapper pour release
  client.release = () => {
    client.query = query;
    client.release = release;
    return release();
  };

  return client;
};

module.exports = {
  pool,
  query,
  getClient,
};