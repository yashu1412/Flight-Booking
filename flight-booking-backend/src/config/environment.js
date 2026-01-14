// config/environment.js

require("dotenv").config();

const environment = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || "flight_booking_db",
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "password",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-jwt-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Frontend URL (for CORS)
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  // Wallet
  DEFAULT_WALLET_BALANCE: parseFloat(process.env.DEFAULT_WALLET_BALANCE) || 50000,

  // Surge Pricing
  SURGE_ATTEMPT_THRESHOLD: parseInt(process.env.SURGE_ATTEMPT_THRESHOLD) || 3,
  SURGE_WINDOW_MINUTES: parseInt(process.env.SURGE_WINDOW_MINUTES) || 5,
  SURGE_RESET_MINUTES: parseInt(process.env.SURGE_RESET_MINUTES) || 10,
  SURGE_PERCENTAGE: parseFloat(process.env.SURGE_PERCENTAGE) || 10,

  // Flight Price Range
  MIN_FLIGHT_PRICE: parseFloat(process.env.MIN_FLIGHT_PRICE) || 2000,
  MAX_FLIGHT_PRICE: parseFloat(process.env.MAX_FLIGHT_PRICE) || 3000,
};

// Validate required environment variables
const validateEnv = () => {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(", ")}`);
    console.warn("Using default values for development");
  }

  return missing.length === 0;
};

module.exports = environment;
module.exports.validateEnv = validateEnv;
