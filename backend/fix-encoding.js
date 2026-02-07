/**
 * Script pour corriger l'encodage des données dans PostgreSQL
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'travaux_routiers',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  client_encoding: 'UTF8',
});

async function fixEncoding() {
  const client = await pool.connect();

  try {
    console.log('Connexion à PostgreSQL établie...');

    // Forcer l'encodage UTF-8
    await client.query("SET client_encoding = 'UTF8'");

    // Corriger le prénom de l'utilisateur admin@travaux.mg
    await client.query(`
      UPDATE utilisateur
      SET prenom = 'Système'
      WHERE email = 'admin@travaux.mg'
    `);
    console.log('✅ Utilisateur admin@travaux.mg corrigé');

    // Vérifier les données
    const result = await client.query('SELECT id_utilisateur, email, nom, prenom FROM utilisateur');
    console.log('\nUtilisateurs dans la base:');
    console.table(result.rows);

    // Vérifier l'encodage de la base
    const encoding = await client.query('SHOW server_encoding');
    console.log('\nEncodage serveur:', encoding.rows[0].server_encoding);

    const clientEncoding = await client.query('SHOW client_encoding');
    console.log('Encodage client:', clientEncoding.rows[0].client_encoding);

  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    client.release();
    await pool.end();
    console.log('\nConnexion fermée.');
  }
}

fixEncoding();
