// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const environment = require("../config/environment");

const authMiddleware = {
  // ==========================================
  // VERIFY JWT TOKEN (Required Authentication)
  // ==========================================
  verifyToken: async (req, res, next) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided."
        });
      }

      // Check Bearer format
      if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Invalid token format. Use Bearer token."
        });
      }

      // Extract token
      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access denied. Token missing."
        });
      }

      // Verify token
      const decoded = jwt.verify(token, environment.JWT_SECRET);

      // Check if user still exists
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists."
        });
      }

      // Attach user to request object
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      };

      next();

    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token."
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please login again."
        });
      }

      console.error("Auth Middleware Error:", error);
      return res.status(500).json({
        success: false,
        message: "Authentication failed.",
        error: error.message
      });
    }
  },

  // ==========================================
  // OPTIONAL TOKEN VERIFICATION
  // (Attaches user if token exists, continues otherwise)
  // ==========================================
  optionalAuth: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        req.user = null;
        return next();
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        req.user = null;
        return next();
      }

      const decoded = jwt.verify(token, environment.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name
        };
      } else {
        req.user = null;
      }

      next();

    } catch (error) {
      // Token invalid but continue without user
      req.user = null;
      next();
    }
  },

  // ==========================================
  // GENERATE JWT TOKEN
  // ==========================================
  generateToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      environment.JWT_SECRET,
      { expiresIn: environment.JWT_EXPIRES_IN }
    );
  },

  // ==========================================
  // DECODE TOKEN (Without verification)
  // ==========================================
  decodeToken: (token) => {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
};

module.exports = authMiddleware;