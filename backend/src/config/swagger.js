/**
 * Configuration Swagger pour la documentation de l'API
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Travaux Routiers Antananarivo',
      version: '1.0.0',
      description: `
API d'authentification et de gestion pour le projet de suivi des travaux routiers à Antananarivo.

## Fonctionnalités

- **Authentification** : Email/Password avec JWT
- **Gestion des sessions** : Durée de vie configurable
- **Sécurité** : Limitation des tentatives de connexion, blocage automatique
- **Basculement intelligent** : Firebase (online) ↔ PostgreSQL (offline)
- **Gestion des utilisateurs** : CRUD complet avec rôles

## Modes de fonctionnement

### Mode Online (Firebase)
Lorsqu'une connexion Internet est détectée, l'API utilise Firebase Authentication pour la gestion des utilisateurs.

### Mode Offline (PostgreSQL)
Sans connexion Internet, l'API bascule automatiquement sur PostgreSQL en local.

## Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- JWT pour l'authentification des sessions
- Limitation des tentatives de connexion (3 par défaut)
- Blocage automatique après dépassement
- API de déblocage réservée aux managers

## Compte par défaut

- **Email**: admin@travaux-routiers.mg
- **Mot de passe**: admin123
- **Rôle**: MANAGER
      `,
      contact: {
        name: 'Promotion 17',
        email: 'admin@travaux-routiers.mg',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'API de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez votre token JWT obtenu après connexion',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Message d\'erreur',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id_utilisateur: {
              type: 'integer',
              example: 1,
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            nom: {
              type: 'string',
              example: 'Doe',
            },
            prenom: {
              type: 'string',
              example: 'John',
            },
            role: {
              type: 'string',
              enum: ['MANAGER', 'USER'],
              example: 'USER',
            },
            est_bloque: {
              type: 'boolean',
              example: false,
            },
            date_creation: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@travaux-routiers.mg',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'admin123',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'nom', 'prenom'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'newuser@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'password123',
            },
            nom: {
              type: 'string',
              example: 'Doe',
            },
            prenom: {
              type: 'string',
              example: 'Jane',
            },
            role: {
              type: 'string',
              enum: ['MANAGER', 'USER'],
              default: 'USER',
              example: 'USER',
            },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            nom: {
              type: 'string',
              example: 'Smith',
            },
            prenom: {
              type: 'string',
              example: 'John',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'newemail@example.com',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints d\'authentification',
      },
      {
        name: 'Users',
        description: 'Gestion des utilisateurs',
      },
      {
        name: 'Health',
        description: 'Vérification de l\'état du service',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;