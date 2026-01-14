// services/pricingService.js

const BookingAttempt = require("../models/BookingAttempt");
const environment = require("../config/environment");

// Surge pricing configuration
const SURGE_CONFIG = {
  ATTEMPT_THRESHOLD: environment.SURGE_ATTEMPT_THRESHOLD || 3,
  SURGE_WINDOW_MINUTES: environment.SURGE_WINDOW_MINUTES || 5,
  RESET_WINDOW_MINUTES: environment.SURGE_RESET_MINUTES || 10,
  SURGE_PERCENTAGE: environment.SURGE_PERCENTAGE || 10
};

const pricingService = {
  // Get surge configuration
  getConfig: () => SURGE_CONFIG,

  // Record booking attempt
  recordAttempt: async (userId, flightId, ipAddress = null) => {
    return await BookingAttempt.create({
      user_id: userId,
      flight_id: flightId,
      ip_address: ipAddress
    });
  },

  // Get recent attempts within surge window
  getRecentAttempts: async (userId, flightId) => {
    return await BookingAttempt.getRecentAttempts(userId, flightId);
  },

  // Count recent attempts
  countRecentAttempts: async (userId, flightId) => {
    return await BookingAttempt.countRecentAttempts(userId, flightId);
  },

  // Check surge status (without recording attempt)
  checkSurgeStatus: async (userId, flightId) => {
    const attempts = await BookingAttempt.getRecentAttempts(userId, flightId);
    const attemptCount = attempts.length;
    const isSurging = attemptCount >= SURGE_CONFIG.ATTEMPT_THRESHOLD;

    let resetTime = null;
    if (isSurging && attempts.length > 0) {
      const firstAttempt = attempts[attempts.length - 1];
      resetTime = new Date(
        new Date(firstAttempt.attempt_time).getTime() +
        SURGE_CONFIG.RESET_WINDOW_MINUTES * 60 * 1000
      );

      // Check if reset time has passed
      if (new Date() > resetTime) {
        return {
          attemptCount: 0,
          threshold: SURGE_CONFIG.ATTEMPT_THRESHOLD,
          isSurging: false,
          surgePercentage: 0,
          remainingAttempts: SURGE_CONFIG.ATTEMPT_THRESHOLD,
          resetTime: null
        };
      }
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

  // Calculate current price (RECORDS ATTEMPT)
  calculatePrice: async (userId, flightId, basePrice) => {
    // Record this attempt
    await pricingService.recordAttempt(userId, flightId);

    // Check surge status
    const surgeStatus = await pricingService.checkSurgeStatus(userId, flightId);

    let currentPrice = parseFloat(basePrice);

    if (surgeStatus.isSurging) {
      // Check if still within reset window
      if (surgeStatus.resetTime && new Date() < surgeStatus.resetTime) {
        currentPrice = currentPrice * (1 + SURGE_CONFIG.SURGE_PERCENTAGE / 100);
      }
    }

    return {
      basePrice: parseFloat(basePrice),
      currentPrice: Math.round(currentPrice * 100) / 100,
      surgeApplied: surgeStatus.isSurging,
      surgePercentage: surgeStatus.surgePercentage,
      attemptCount: surgeStatus.attemptCount,
      remainingAttempts: surgeStatus.remainingAttempts,
      resetTime: surgeStatus.resetTime
    };
  },

  // Get price info (WITHOUT recording attempt - for display)
  getPriceInfo: async (userId, flightId, basePrice) => {
    const surgeStatus = await pricingService.checkSurgeStatus(userId, flightId);

    let currentPrice = parseFloat(basePrice);

    if (surgeStatus.isSurging) {
      if (surgeStatus.resetTime && new Date() < surgeStatus.resetTime) {
        currentPrice = currentPrice * (1 + SURGE_CONFIG.SURGE_PERCENTAGE / 100);
      }
    }

    return {
      basePrice: parseFloat(basePrice),
      currentPrice: Math.round(currentPrice * 100) / 100,
      surgeApplied: surgeStatus.isSurging,
      surgePercentage: surgeStatus.surgePercentage,
      attemptCount: surgeStatus.attemptCount,
      remainingAttempts: surgeStatus.remainingAttempts,
      resetTime: surgeStatus.resetTime
    };
  },

  // Clean up old attempts (for scheduled job)
  cleanupOldAttempts: async () => {
    return await BookingAttempt.cleanupOldAttempts();
  },

  // Get surge summary for flight (admin)
  getSurgeSummary: async (flightId) => {
    const attempts = await BookingAttempt.findByFlightId(flightId);
    return {
      totalAttempts: attempts.length,
      recentAttempts: attempts.slice(0, 10),
      surgeConfig: SURGE_CONFIG
    };
  }
};

module.exports = pricingService;