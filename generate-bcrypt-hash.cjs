const bcrypt = require('bcrypt');

const password = 'admin123';
const saltRounds = 12;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Erreur lors du hash :', err);
    process.exit(1);
  }
  console.log('Hash bcrypt pour "admin123" :');
  console.log(hash);
}); 