// routes/index.js

const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const flightRoutes = require("./flightRoutes");
const bookingRoutes = require("./bookingRoutes");
const walletRoutes = require("./walletRoutes");

// API Info
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Flight Booking System API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      flights: "/api/flights",
      bookings: "/api/bookings",
      wallet: "/api/wallet"
    }
  });
});

// Mount routes
router.use("/auth", authRoutes);
router.use("/flights", flightRoutes);
router.use("/bookings", bookingRoutes);
router.use("/wallet", walletRoutes);

module.exports = router;