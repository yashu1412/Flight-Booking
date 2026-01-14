// routes/flightRoutes.js

const express = require("express");
const router = express.Router();

const flightController = require("../controllers/flightController");
const { verifyToken, optionalAuth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const { validateFlight, validateUUID } = require("../middleware/validator");
const { generalLimiter } = require("../middleware/rateLimiter");

// ==========================================
// PUBLIC ROUTES
// ==========================================

// GET /api/flights - Get all flights (returns 10)
router.get(
  "/",
  generalLimiter,
  optionalAuth,
  flightController.getAllFlights
);

// GET /api/flights/search - Search flights with filters
router.get(
  "/search",
  generalLimiter,
  optionalAuth,
  flightController.searchFlights
);

// GET /api/flights/cities - Get list of cities (for dropdown)
router.get(
  "/cities",
  generalLimiter,
  flightController.getCities
);

// GET /api/flights/airlines - Get list of airlines (for filter)
router.get(
  "/airlines",
  generalLimiter,
  flightController.getAirlines
);

// GET /api/flights/:id - Get single flight by ID
router.get(
  "/:id",
  generalLimiter,
  validateUUID("id"),
  optionalAuth,
  flightController.getFlightById
);

// ==========================================
// PROTECTED ROUTES (Require Authentication)
// ==========================================

// GET /api/flights/:id/pricing - Get flight with dynamic pricing
// (Records booking attempt for surge pricing)
router.get(
  "/:id/pricing",
  generalLimiter,
  validateUUID("id"),
  verifyToken,
  flightController.getFlightWithPricing
);

// ==========================================
// ADMIN ROUTES
// ==========================================

// POST /api/flights - Create new flight (Admin only)
router.post(
  "/",
  verifyToken,
  isAdmin,
  validateFlight,
  flightController.createFlight
);

// PUT /api/flights/:id - Update flight (Admin only)
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  validateUUID("id"),
  flightController.updateFlight
);

// DELETE /api/flights/:id - Delete flight (Admin only)
router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  validateUUID("id"),
  flightController.deleteFlight
);

module.exports = router;