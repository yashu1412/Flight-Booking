// middleware/adminMiddleware.js

const adminMiddleware = {
  isAdmin: (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required."
        });
      }
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required."
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization failed.",
        error: error.message
      });
    }
  },
  isAdminOrOwner: (paramName = "id") => {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: "Authentication required."
          });
        }
        const resourceId = req.params[paramName];
        const isOwner = req.user.id === resourceId;
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
          return res.status(403).json({
            success: false,
            message: "Access denied. You can only access your own resources."
          });
        }
        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Authorization failed.",
          error: error.message
        });
      }
    };
  }
};

module.exports = adminMiddleware;

