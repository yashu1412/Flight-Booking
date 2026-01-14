// routes/authRoutes.js

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const { validateRegistration, validateLogin } = require("../middleware/validator");
const { authLimiter } = require("../middleware/rateLimiter");

// ==========================================
// PUBLIC ROUTES
// ==========================================

// POST /api/auth/register - Register new user
router.post(
  "/register",
  authLimiter,
  validateRegistration,
  authController.register
);

// POST /api/auth/login - User login
router.post(
  "/login",
  authLimiter,
  validateLogin,
  authController.login
);

// ==========================================
// PROTECTED ROUTES (Require Authentication)
// ==========================================

// GET /api/auth/profile - Get current user profile
router.get(
  "/profile",
  verifyToken,
  authController.getProfile
);

// PUT /api/auth/profile - Update user profile
router.put(
  "/profile",
  verifyToken,
  authController.updateProfile
);

// PUT /api/auth/change-password - Change password
router.put(
  "/change-password",
  verifyToken,
  authController.changePassword
);

// POST /api/auth/logout - Logout user
router.post(
  "/logout",
  verifyToken,
  authController.logout
);

module.exports = router;