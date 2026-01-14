// routes/bookingRoutes.js

const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const { validateBooking, validatePNR } = require("../middleware/validator");
const { bookingLimiter, downloadLimiter } = require("../middleware/rateLimiter");

// ==========================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ==========================================

// POST /api/bookings/initiate - Initiate booking (check price & wallet)
router.post(
  "/initiate",
  verifyToken,
  bookingLimiter,
  bookingController.initiateBooking
);

// POST /api/bookings/confirm - Confirm booking (deduct wallet & create)
router.post(
  "/confirm",
  verifyToken,
  bookingLimiter,
  validateBooking,
  bookingController.confirmBooking
);

// GET /api/bookings/history - Get user's booking history
router.get(
  "/history",
  verifyToken,
  bookingController.getBookingHistory
);

// GET /api/bookings/:pnr - Get single booking by PNR
router.get(
  "/:pnr",
  verifyToken,
  validatePNR,
  bookingController.getBookingByPNR
);

// GET /api/bookings/:pnr/ticket - Download ticket PDF
router.get(
  "/:pnr/ticket",
  verifyToken,
  downloadLimiter,
  validatePNR,
  bookingController.downloadTicket
);

// PUT /api/bookings/:pnr/cancel - Cancel booking
router.put(
  "/:pnr/cancel",
  verifyToken,
  validatePNR,
  bookingController.cancelBooking
);

// ==========================================
// ADMIN ROUTES
// ==========================================

// GET /api/bookings/admin/all - Get all bookings (Admin only)
router.get(
  "/admin/all",
  verifyToken,
  isAdmin,
  bookingController.getAllBookings
);

// GET /api/bookings/admin/stats - Get booking statistics (Admin only)
router.get(
  "/admin/stats",
  verifyToken,
  isAdmin,
  bookingController.getBookingStats
);

module.exports = router;