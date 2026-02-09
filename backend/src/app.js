/**
 * Configuration de l'application Express
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// ============================================
// Middleware de sécurité
// ============================================

// Helmet pour sécuriser les headers HTTP
app.use(helmet());

// CORS - Autoriser plusieurs origines
const allowedOrigins = [
  'http://localhost:3001',  // React web app
  'http://localhost:5173',  // Ionic mobile app (dev)
  'http://localhost:8100',  // Ionic serve
  'capacitor://localhost',  // Capacitor Android/iOS
  'http://localhost',       // Generic localhost
];

const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // En dev, autoriser quand même
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// ============================================
// Middleware de parsing
// ============================================

app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true }));

// Middleware pour forcer UTF-8 dans les réponses JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// ============================================
// Logging
// ============================================

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// Documentation Swagger
// ============================================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Travaux Routiers - Documentation',
}));

// Endpoint pour récupérer le spec Swagger en JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================
// Routes
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Travaux Routiers - Service en ligne',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Travaux Routiers Antananarivo',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      docs: '/api-docs',
    },
  });
});

// Routes API
const authRoutes = require('./routes/auth.routes');
const signalementRoutes = require('./routes/signalement.routes');
const syncRoutes = require('./routes/sync.routes');

app.use('/api/auth', authRoutes);
app.use('/api/signalements', signalementRoutes);
app.use('/api/sync', syncRoutes);

// ============================================
// Gestion des erreurs 404
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.path,
    method: req.method,
  });
});

// ============================================
// Gestion globale des erreurs
// ============================================

app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Erreur de validation express-validator
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: err.errors,
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré',
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
