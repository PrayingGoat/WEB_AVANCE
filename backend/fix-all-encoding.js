/**
 * Script pour corriger TOUS les problèmes d'encodage dans PostgreSQL
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

async function fixAllEncoding() {
  const client = await pool.connect();

  try {
    console.log('Connexion établie. Correction des données...\n');

    // Forcer l'encodage UTF-8
    await client.query("SET client_encoding = 'UTF8'");

    // 1. Corriger les utilisateurs
    console.log('1. Correction des utilisateurs...');
    await client.query(`
      UPDATE utilisateur SET prenom = 'Système' WHERE email = 'admin@travaux.mg'
    `);
    console.log('   ✅ Utilisateur corrigé');

    // 2. Corriger les signalements
    console.log('\n2. Correction des signalements...');

    // Avenue de l'Indépendance
    await client.query(`
      UPDATE signalement
      SET adresse = 'Avenue de l''Indépendance',
          description = 'Nid de poule important sur la chaussée principale'
      WHERE id_signalement = 1
    `);
    console.log('   ✅ Signalement 1 corrigé');

    // Analakely
    await client.query(`
      UPDATE signalement
      SET adresse = 'Analakely',
          description = 'Fissures sur la route près du marché'
      WHERE id_signalement = 2
    `);
    console.log('   ✅ Signalement 2 corrigé');

    // Rue Ravoninahitriniarivo
    await client.query(`
      UPDATE signalement
      SET adresse = 'Rue Ravoninahitriniarivo',
          description = 'Affaissement de la chaussée'
      WHERE id_signalement = 3
    `);
    console.log('   ✅ Signalement 3 corrigé');

    // Boulevard de l'Europe
    await client.query(`
      UPDATE signalement
      SET adresse = 'Boulevard de l''Europe',
          description = 'Plusieurs nids de poule alignés'
      WHERE id_signalement = 4
    `);
    console.log('   ✅ Signalement 4 corrigé');

    // Gare Soarano
    await client.query(`
      UPDATE signalement
      SET adresse = 'Gare Soarano',
          description = 'Route détériorée nécessitant réfection complète'
      WHERE id_signalement = 5
    `);
    console.log('   ✅ Signalement 5 corrigé');

    // 3. Vérification
    console.log('\n3. Vérification des données...\n');

    const users = await client.query('SELECT email, prenom, nom FROM utilisateur');
    console.log('Utilisateurs:');
    users.rows.forEach(u => console.log(`   - ${u.email}: ${u.prenom} ${u.nom}`));

    const signalements = await client.query('SELECT id_signalement, adresse, description FROM signalement ORDER BY id_signalement');
    console.log('\nSignalements:');
    signalements.rows.forEach(s => console.log(`   ${s.id_signalement}. ${s.adresse}: ${s.description}`));

    console.log('\n✅ Toutes les corrections ont été appliquées!');
    console.log('   Rafraîchissez la page du navigateur pour voir les changements.');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAllEncoding();
