// models/BookingAttempt.js

const pool = require("../config/database");

// Create BookingAttempts Table if not exists
const createBookingAttemptsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS booking_attempts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
      attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);

  // Create index for surge pricing queries
  const indexQuery = `
    CREATE INDEX IF NOT EXISTS idx_attempts_surge 
    ON booking_attempts(user_id, flight_id, attempt_time);
  `;
  await pool.query(indexQuery);

  console.log("✅ BookingAttempts table created");
};

const init = async () => {
  await createBookingAttemptsTable();
};

// Surge pricing constants
const SURGE_CONFIG = {
  ATTEMPT_THRESHOLD: 3,        // 3 attempts triggers surge
  SURGE_WINDOW_MINUTES: 5,     // Within 5 minutes
  RESET_WINDOW_MINUTES: 10,    // Reset after 10 minutes
  SURGE_PERCENTAGE: 10         // 10% price increase
};

const BookingAttempt = {
  // Get surge configuration
  getSurgeConfig: () => SURGE_CONFIG,

  // Record a new booking attempt
  create: async ({ user_id, flight_id, ip_address = null }) => {
    const query = `
      INSERT INTO booking_attempts (user_id, flight_id, ip_address)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await pool.query(query, [user_id, flight_id, ip_address]);
    return result.rows[0];
  },

  // Get recent attempts within surge window (5 minutes)
  getRecentAttempts: async (user_id, flight_id) => {
    const query = `
      SELECT * FROM booking_attempts
      WHERE user_id = $1 
        AND flight_id = $2
        AND attempt_time >= NOW() - INTERVAL '${SURGE_CONFIG.SURGE_WINDOW_MINUTES} minutes'
      ORDER BY attempt_time DESC;
    `;
    const result = await pool.query(query, [user_id, flight_id]);
    return result.rows;
  },

  // Count recent attempts
  countRecentAttempts: async (user_id, flight_id) => {
    const query = `
      SELECT COUNT(*) as count FROM booking_attempts
      WHERE user_id = $1 
        AND flight_id = $2
        AND attempt_time >= NOW() - INTERVAL '${SURGE_CONFIG.SURGE_WINDOW_MINUTES} minutes';
    `;
    const result = await pool.query(query, [user_id, flight_id]);
    return parseInt(result.rows[0].count);
  },

  // Check if surge pricing should apply
  checkSurgeStatus: async (user_id, flight_id) => {
    const recentAttempts = await BookingAttempt.getRecentAttempts(user_id, flight_id);
    const attemptCount = recentAttempts.length;

    const isSurging = attemptCount >= SURGE_CONFIG.ATTEMPT_THRESHOLD;

    let resetTime = null;
    if (isSurging && recentAttempts.length > 0) {
      const firstAttempt = recentAttempts[recentAttempts.length - 1];
      resetTime = new Date(
        new Date(firstAttempt.attempt_time).getTime() + 
        SURGE_CONFIG.RESET_WINDOW_MINUTES * 60 * 1000
      );
    }

    return {
      attemptCount,
      threshold: SURGE_CONFIG.ATTEMPT_THRESHOLD,
      isSurging,
      surgePercentage: isSurging ? SURGE_CONFIG.SURGE_PERCENTAGE : 0,
      remainingAttempts: Math.max(0, SURGE_CONFIG.ATTEMPT_THRESHOLD - attemptCount),
      resetTime
    };
  },

  // Calculate current price with surge
  calculatePrice: async (user_id, flight_id, base_price) => {
    // Record this attempt
    await BookingAttempt.create({ user_id, flight_id });

    // Check surge status
    const surgeStatus = await BookingAttempt.checkSurgeStatus(user_id, flight_id);

    let currentPrice = parseFloat(base_price);
    
    if (surgeStatus.isSurging) {
      // Check if we're still within reset window
      if (surgeStatus.resetTime && new Date() < surgeStatus.resetTime) {
        currentPrice = currentPrice * (1 + SURGE_CONFIG.SURGE_PERCENTAGE / 100);
      }
    }

    return {
      basePrice: parseFloat(base_price),
      currentPrice: Math.round(currentPrice * 100) / 100,
      surgeApplied: surgeStatus.isSurging,
      surgePercentage: surgeStatus.surgePercentage,
      attemptCount: surgeStatus.attemptCount,
      resetTime: surgeStatus.resetTime
    };
  },

  // Get price without recording attempt (for display)
  getPriceInfo: async (user_id, flight_id, base_price) => {
    const surgeStatus = await BookingAttempt.checkSurgeStatus(user_id, flight_id);

    let currentPrice = parseFloat(base_price);
    
    if (surgeStatus.isSurging) {
      if (surgeStatus.resetTime && new Date() < surgeStatus.resetTime) {
        currentPrice = currentPrice * (1 + SURGE_CONFIG.SURGE_PERCENTAGE / 100);
      }
    }

    return {
      basePrice: parseFloat(base_price),
      currentPrice: Math.round(currentPrice * 100) / 100,
      surgeApplied: surgeStatus.isSurging,
      surgePercentage: surgeStatus.surgePercentage,
      attemptCount: surgeStatus.attemptCount,
      remainingAttempts: surgeStatus.remainingAttempts,
      resetTime: surgeStatus.resetTime
    };
  },

  // Clean up old attempts (run as scheduled job)
  cleanupOldAttempts: async () => {
    const query = `
      DELETE FROM booking_attempts
      WHERE attempt_time < NOW() - INTERVAL '${SURGE_CONFIG.RESET_WINDOW_MINUTES} minutes'
      RETURNING id;
    `;
    const result = await pool.query(query);
    return result.rows.length;
  },

  // Get all attempts for a user (for debugging/admin)
  findByUserId: async (user_id) => {
    const query = `
      SELECT 
        ba.*,
        f.flight_id as flight_number,
        f.airline
      FROM booking_attempts ba
      JOIN flights f ON ba.flight_id = f.id
      WHERE ba.user_id = $1
      ORDER BY ba.attempt_time DESC
      LIMIT 50;
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
  },

  // Get attempts for a flight (admin analytics)
  findByFlightId: async (flight_id) => {
    const query = `
      SELECT 
        ba.*,
        u.first_name,
        u.last_name,
        u.email
      FROM booking_attempts ba
      JOIN users u ON ba.user_id = u.id
      WHERE ba.flight_id = $1
      ORDER BY ba.attempt_time DESC
      LIMIT 100;
    `;
    const result = await pool.query(query, [flight_id]);
    return result.rows;
  }
};

module.exports = BookingAttempt;
module.exports.init = init;
