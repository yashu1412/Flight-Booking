// utils/constants.js

const constants = {
  // ==========================================
  // USER ROLES
  // ==========================================
  ROLES: {
    ADMIN: "admin",
    CUSTOMER: "customer"
  },

  // ==========================================
  // BOOKING STATUS
  // ==========================================
  BOOKING_STATUS: {
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED",
    PENDING: "PENDING"
  },

  // ==========================================
  // FLIGHT STATUS
  // ==========================================
  FLIGHT_STATUS: {
    ACTIVE: "active",
    INACTIVE: "inactive",
    CANCELLED: "cancelled"
  },

  // ==========================================
  // WALLET CONFIGURATION
  // ==========================================
  WALLET: {
    DEFAULT_BALANCE: 50000,
    MIN_BALANCE: 0,
    CURRENCY: "INR",
    CURRENCY_SYMBOL: "₹"
  },

  // ==========================================
  // FLIGHT PRICE CONFIGURATION
  // ==========================================
  FLIGHT_PRICE: {
    MIN_PRICE: 2000,
    MAX_PRICE: 3000
  },

  // ==========================================
  // SURGE PRICING CONFIGURATION
  // ==========================================
  SURGE_PRICING: {
    ATTEMPT_THRESHOLD: 3,        // 3 attempts trigger surge
    SURGE_WINDOW_MINUTES: 5,     // Within 5 minutes
    RESET_WINDOW_MINUTES: 10,    // Reset after 10 minutes
    SURGE_PERCENTAGE: 10         // 10% increase
  },

  // ==========================================
  // PAGINATION DEFAULTS
  // ==========================================
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // ==========================================
  // TRANSACTION TYPES
  // ==========================================
  TRANSACTION_TYPES: {
    DEBIT: "DEBIT",
    CREDIT: "CREDIT"
  },

  // ==========================================
  // PNR CONFIGURATION
  // ==========================================
  PNR: {
    LENGTH: 6,
    CHARACTERS: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  },

  // ==========================================
  // JWT CONFIGURATION
  // ==========================================
  JWT: {
    DEFAULT_EXPIRES_IN: "7d",
    REFRESH_EXPIRES_IN: "30d"
  },

  // ==========================================
  // AIRLINES LIST
  // ==========================================
  AIRLINES: [
    "Air India",
    "IndiGo",
    "SpiceJet",
    "Vistara",
    "GoAir",
    "AirAsia India"
  ],

  // ==========================================
  // CITIES LIST
  // ==========================================
  CITIES: [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Goa",
    "Kochi"
  ],

  // ==========================================
  // ERROR MESSAGES
  // ==========================================
  ERRORS: {
    // Auth errors
    INVALID_CREDENTIALS: "Invalid email or password",
    EMAIL_EXISTS: "Email already registered",
    USER_NOT_FOUND: "User not found",
    UNAUTHORIZED: "Unauthorized access",
    TOKEN_EXPIRED: "Token expired. Please login again",
    TOKEN_INVALID: "Invalid token",

    // Flight errors
    FLIGHT_NOT_FOUND: "Flight not found",
    NO_SEATS_AVAILABLE: "No seats available on this flight",
    INVALID_PRICE_RANGE: "Price must be between ₹2000 and ₹3000",
    FLIGHT_ID_EXISTS: "Flight ID already exists",

    // Booking errors
    BOOKING_NOT_FOUND: "Booking not found",
    BOOKING_ALREADY_CANCELLED: "Booking is already cancelled",
    INSUFFICIENT_BALANCE: "Insufficient wallet balance",

    // General errors
    VALIDATION_FAILED: "Validation failed",
    INTERNAL_ERROR: "Internal server error",
    NOT_FOUND: "Resource not found"
  },

  // ==========================================
  // SUCCESS MESSAGES
  // ==========================================
  SUCCESS: {
    REGISTER: "Registration successful",
    LOGIN: "Login successful",
    LOGOUT: "Logout successful",
    PROFILE_UPDATED: "Profile updated successfully",
    PASSWORD_CHANGED: "Password changed successfully",
    BOOKING_CONFIRMED: "Booking confirmed successfully",
    BOOKING_CANCELLED: "Booking cancelled successfully",
    WALLET_RESET: "Wallet reset to default balance"
  },

  // ==========================================
  // REGEX PATTERNS
  // ==========================================
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PNR: /^[A-Z0-9]{6}$/i,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    PHONE: /^[0-9]{10}$/,
    TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
  }
};

// Freeze to prevent modifications
Object.freeze(constants);
Object.freeze(constants.ROLES);
Object.freeze(constants.BOOKING_STATUS);
Object.freeze(constants.FLIGHT_STATUS);
Object.freeze(constants.WALLET);
Object.freeze(constants.FLIGHT_PRICE);
Object.freeze(constants.SURGE_PRICING);
Object.freeze(constants.PAGINATION);
Object.freeze(constants.ERRORS);
Object.freeze(constants.SUCCESS);
Object.freeze(constants.REGEX);

module.exports = constants;