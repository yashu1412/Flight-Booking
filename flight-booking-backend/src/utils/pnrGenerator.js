// utils/pnrGenerator.js

const crypto = require("crypto");

const pnrGenerator = {
  // ==========================================
  // GENERATE 6-CHARACTER ALPHANUMERIC PNR
  // ==========================================
  generate: (length = 6) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pnr = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      pnr += chars[randomIndex];
    }

    return pnr;
  },

  // ==========================================
  // GENERATE PNR WITH PREFIX (e.g., "FB" for Flight Booking)
  // ==========================================
  generateWithPrefix: (prefix = "FB", length = 4) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let suffix = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      suffix += chars[randomIndex];
    }

    return `${prefix}${suffix}`;
  },

  // ==========================================
  // GENERATE UNIQUE PNR (With database check callback)
  // ==========================================
  generateUnique: async (checkExistsCallback, maxAttempts = 10) => {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const pnr = pnrGenerator.generate();

      // Check if PNR exists using callback
      const exists = await checkExistsCallback(pnr);

      if (!exists) {
        return pnr;
      }

      attempts++;
    }

    throw new Error("Failed to generate unique PNR after maximum attempts");
  },

  // ==========================================
  // VALIDATE PNR FORMAT
  // ==========================================
  validate: (pnr) => {
    if (!pnr || typeof pnr !== "string") {
      return false;
    }

    // PNR should be 6 alphanumeric characters
    const pnrRegex = /^[A-Z0-9]{6}$/;
    return pnrRegex.test(pnr.toUpperCase());
  },

  // ==========================================
  // FORMAT PNR (Uppercase)
  // ==========================================
  format: (pnr) => {
    if (!pnr) return null;
    return pnr.toUpperCase().trim();
  },

  // ==========================================
  // GENERATE BOOKING REFERENCE NUMBER
  // ==========================================
  generateBookingRef: () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomInt(1000, 9999);
    return `BK${timestamp}${random}`;
  },

  // ==========================================
  // GENERATE TRANSACTION ID
  // ==========================================
  generateTransactionId: () => {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `TXN${timestamp}${random}`;
  }
};

module.exports = pnrGenerator;