const { USER_ROLES } = require('../../constants/roles');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {

    if (!req.user || !req.user.role) {
      return res.status(401).json({
        message: 'Not authenticated. Please login first.',
      });
    }

    //Role checking 
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role ${req.user.role} is not authorized to access this resource`,
      });
    }

    // if Authorized
    return next();
  };
};

module.exports = { authorize };
