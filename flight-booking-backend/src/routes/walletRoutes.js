// routes/walletRoutes.js

const express = require("express");
const router = express.Router();

const walletController = require("../controllers/walletController");
const { verifyToken } = require("../middleware/authMiddleware");
const { generalLimiter } = require("../middleware/rateLimiter");

// ==========================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ==========================================

// GET /api/wallet/balance - Get current wallet balance
router.get(
  "/balance",
  verifyToken,
  generalLimiter,
  walletController.getBalance
);

// POST /api/wallet/check - Check if balance is sufficient
router.post(
  "/check",
  verifyToken,
  generalLimiter,
  walletController.checkBalance
);

// POST /api/wallet/reset - Reset wallet to default ₹50,000 (for testing)
router.post(
  "/reset",
  verifyToken,
  generalLimiter,
  walletController.resetWallet
);

module.exports = router;