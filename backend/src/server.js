/**
 * Point d'entrée de l'application
 */

require('dotenv').config();
const app = require('./app');
const { initializeFirebase } = require('./config/firebase');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Écouter sur toutes les interfaces pour Docker

// ============================================
// Initialisation
// ============================================

/**
 * Démarre le serveur
 */
const startServer = async () => {
  try {
    console.log('🚀 Démarrage de l\'API Travaux Routiers...\n');

    // Initialiser Firebase (optionnel)
    initializeFirebase();

    // Démarrer le serveur HTTP
    const server = app.listen(PORT, HOST, () => {
      console.log('\n✅ Serveur démarré avec succès !');
      console.log(`   Port: ${PORT}`);
      console.log(`   Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   URL locale: http://localhost:${PORT}`);
      console.log(`   Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`   Health check: http://localhost:${PORT}/health\n`);
    });

    // Gestion propre de l'arrêt
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} reçu. Arrêt gracieux en cours...`);

      server.close(() => {
        console.log('✅ Serveur HTTP fermé');

        // Fermer les connexions à la base de données
        const { pool } = require('./config/database');
        pool.end(() => {
          console.log('✅ Connexions PostgreSQL fermées');
          process.exit(0);
        });
      });

      // Forcer l'arrêt après 10 secondes
      setTimeout(() => {
        console.error('⚠️  Arrêt forcé après timeout');
        process.exit(1);
      }, 10000);
    };

    // Écouter les signaux d'arrêt
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Gestion des erreurs non capturées
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();