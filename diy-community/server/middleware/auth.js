const jwt = require('jsonwebtoken');
const secretKey = 'deinGeheimesSchlüsselwort';

function authMiddleware(req, res, next) {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).send('Zugriff verweigert. Kein Token bereitgestellt.');
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send('Ungültiges Token.');
  }
}

module.exports = authMiddleware;
