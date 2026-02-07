const bcrypt = require('bcrypt');

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Erreur:', err);
    return;
  }
  console.log('Mot de passe:', password);
  console.log('Hash bcrypt:', hash);
  console.log('\nCommande SQL à exécuter:');
  console.log(`UPDATE utilisateur SET password_hash = '${hash}', est_bloque = false, tentatives_connexion = 0, date_blocage = NULL WHERE email = 'admin@travaux.mg';`);
});
