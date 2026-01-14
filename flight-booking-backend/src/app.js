// app.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Import configurations
const environment = require("./config/environment");
const pool = require("./config/database");

// Import routes
const routes = require("./routes");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const { notFoundHandler } = require("./middleware/errorHandler");

// Initialize Express app
const app = express();

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
app.use(helmet());

// ==========================================
// CORS CONFIGURATION (ALLOW ALL ORIGINS)
// ==========================================
app.use(cors({
  origin: true,            // ✅ allow all origins
  credentials: true,       // ✅ allow cookies/auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400            // cache preflight for 24h
}));

// Handle preflight requests
app.options("*", cors());

// ==========================================
// BODY PARSING MIDDLEWARE
// ==========================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ==========================================
// LOGGING MIDDLEWARE
// ==========================================
if (environment.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ==========================================
// HEALTH CHECK ENDPOINT
// ==========================================
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: environment.NODE_ENV
  });
});

// ==========================================
// DATABASE HEALTH CHECK
// ==========================================
app.get("/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      success: true,
      message: "Database connected",
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});

// ==========================================
// API INFO ENDPOINT
// ==========================================
app.get("/", (req, res) => {
  res.status(200).json({
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

// ==========================================
// API ROUTES
// ==========================================
app.use("/api", routes);

// ==========================================
// 404 NOT FOUND HANDLER
// ==========================================
app.use(notFoundHandler);

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================
const PORT = environment.PORT || 5000;

const startServer = async () => {
  let dbConnected = false;

  try {
    const dbTest = await pool.query("SELECT NOW()");
    dbConnected = true;
    console.log("✅ Database connected:", dbTest.rows[0].now);
  } catch (error) {
    console.warn("⚠️ Database not connected at startup:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 FLIGHT BOOKING SYSTEM API                            ║
║                                                            ║
║   Server running on: http://localhost:${PORT}               ║
║   Environment: ${environment.NODE_ENV}                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);

    if (!dbConnected) {
      console.warn("⚠️ Server started without DB connection.");
    }
  });
};

// ==========================================
// PROCESS ERROR HANDLING
// ==========================================
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down...");
  pool.end(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT received. Shutting down...");
  pool.end(() => process.exit(0));
});

// Start server
startServer();

module.exports = app;
