// middleware/rateLimiter.js

const rateLimit = require("express-rate-limit");

// ==========================================
// GENERAL API RATE LIMITER
// ==========================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ==========================================
// AUTH RATE LIMITER (Stricter)
// ==========================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per window
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ==========================================
// BOOKING RATE LIMITER
// ==========================================
const bookingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 booking attempts per window
  message: {
    success: false,
    message: "Too many booking attempts. Please wait a few minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ==========================================
// PDF DOWNLOAD LIMITER
// ==========================================
const downloadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 downloads per minute
  message: {
    success: false,
    message: "Too many download requests. Please wait."
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  authLimiter,
  bookingLimiter,
  downloadLimiter
};