function roleCheck(requiredRole) {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).send('Zugriff verweigert. Unzureichende Berechtigungen.');
    }
    next();
  };
}

module.exports = roleCheck;

