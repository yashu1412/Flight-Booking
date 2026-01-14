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
const { generalLimiter } = require("./middleware/rateLimiter");

// Initialize Express app
const app = express();

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
app.use(helmet());

// ==========================================
// CORS CONFIGURATION
// ==========================================
const allowedOrigins = new Set([
  environment.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "https://flight-booking-5naa.vercel.app/"
].filter(Boolean));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

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

// Rate limiting applied at route level

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
    documentation: "/api",
    endpoints: {
      auth: "/api/auth",
      flights: "/api/flights",
      bookings: "/api/bookings",
      wallet: "/api/wallet"
    },
    features: [
      "User Authentication (JWT)",
      "Flight Search & Filtering",
      "Dynamic Surge Pricing",
      "Wallet System (₹50,000 default)",
      "Booking with PNR Generation",
      "PDF Ticket Download",
      "Booking History"
    ]
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
║   Environment: ${environment.NODE_ENV.padEnd(39)}║
║                                                            ║
║   Endpoints:                                               ║
║   • Health:    GET  /health                                ║
║   • Auth:      POST /api/auth/register                     ║
║   •            POST /api/auth/login                        ║
║   • Flights:   GET  /api/flights                           ║
║   •            GET  /api/flights/search                    ║
║   • Bookings:  POST /api/bookings/confirm                  ║
║   •            GET  /api/bookings/history                  ║
║   • Wallet:    GET  /api/wallet/balance                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
    if (!dbConnected) {
      console.warn("⚠️ Server started without DB connection. /health/db will return 503.");
    }
  });
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  pool.end(() => {
    console.log("Database pool closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT received. Shutting down gracefully...");
  pool.end(() => {
    console.log("Database pool closed.");
    process.exit(0);
  });
});

// Start the server
startServer();

module.exports = app;
