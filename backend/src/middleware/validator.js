/**
 * Middleware de validation des requêtes
 */

const { validationResult } = require('express-validator');

/**
 * Vérifie les résultats de la validation et retourne les erreurs
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
};

module.exports = { validate };