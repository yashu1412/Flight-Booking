// config/database.js

const { Pool } = require("pg");
require("dotenv").config();

const hasUrl = !!process.env.DATABASE_URL;
const isLocalUrl =
  hasUrl &&
  (process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("127.0.0.1") ||
    process.env.DATABASE_URL.includes("::1"));

const buildConfig = () => {
  if (hasUrl) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: isLocalUrl ? undefined : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000
    };
  }
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.DB_PORT || 5432);
  const database = process.env.DB_NAME || "flight_booking_db";
  const user = process.env.DB_USER || "postgres";
  const password = process.env.DB_PASSWORD || "password";
  const isLocalHost =
    host === "localhost" || host === "127.0.0.1" || host === "::1";
  return {
    host,
    port,
    database,
    user,
    password,
    ssl: isLocalHost ? undefined : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000
  };
};

const pool = new Pool(buildConfig());

// Test database connection
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL connection error:", err.message);
});

// Test connection function
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("📅 Database time:", result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
};

module.exports = pool;
module.exports.testConnection = testConnection;
