function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have access to this resource.' });
    }
    next();
  };
}

module.exports = { authorizeRole };
