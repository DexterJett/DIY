const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

// Hash das Passwort vor dem Speichern
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

// Beispiel für das Hashen eines Passworts
const saltRounds = 10;
const plainPassword = 'meinPasswort';

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
  if (err) {
    console.error('Fehler beim Hashen des Passworts:', err);
  } else {
    console.log('Gehashtes Passwort:', hash);
  }
});
