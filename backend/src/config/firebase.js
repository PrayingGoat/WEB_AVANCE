/**
 * Configuration Firebase Admin SDK
 */

const admin = require('firebase-admin');
require('dotenv').config();

let firebaseApp = null;
let isFirebaseEnabled = false;

/**
 * Initialise Firebase Admin SDK
 */
const initializeFirebase = () => {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL,
  } = process.env;

  // Vérifier si les credentials Firebase sont configurés
  if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
    console.warn('⚠️  Firebase credentials not configured. Firebase features disabled.');
    console.warn('   The application will use only PostgreSQL for authentication.');
    return null;
  }

  try {
    // Préparer les credentials
    const serviceAccount = {
      type: 'service_account',
      project_id: FIREBASE_PROJECT_ID,
      private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: FIREBASE_CLIENT_EMAIL,
    };

    // Initialiser Firebase Admin
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: FIREBASE_PROJECT_ID,
    });

    isFirebaseEnabled = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`   Project ID: ${FIREBASE_PROJECT_ID}`);

    return firebaseApp;
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    console.warn('   Continuing with PostgreSQL only...');
    return null;
  }
};

/**
 * Obtient l'instance Firebase Auth
 * @returns {admin.auth.Auth|null}
 */
const getAuth = () => {
  if (!isFirebaseEnabled || !firebaseApp) {
    return null;
  }
  return admin.auth();
};

/**
 * Obtient l'instance Firestore
 * @returns {admin.firestore.Firestore|null}
 */
const getFirestore = () => {
  if (!isFirebaseEnabled || !firebaseApp) {
    return null;
  }
  return admin.firestore();
};

/**
 * Vérifie si Firebase est activé et disponible
 * @returns {boolean}
 */
const isFirebaseAvailable = () => {
  return isFirebaseEnabled;
};

/**
 * Vérifie la connectivité Internet (pour basculement auto)
 * @returns {Promise<boolean>}
 */
const checkInternetConnectivity = async () => {
  if (!isFirebaseEnabled) {
    return false;
  }

  try {
    const axios = require('axios');
    // Tenter de contacter Firebase
    await axios.get('https://firebase.google.com', { timeout: 3000 });
    return true;
  } catch (error) {
    console.warn('⚠️  No internet connectivity detected. Using PostgreSQL.');
    return false;
  }
};

module.exports = {
  initializeFirebase,
  getAuth,
  getFirestore,
  isFirebaseAvailable,
  checkInternetConnectivity,
};