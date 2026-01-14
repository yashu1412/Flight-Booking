// utils/helpers.js

const constants = require("./constants");

const helpers = {
  // ==========================================
  // FORMAT CURRENCY (INR)
  // ==========================================
  formatCurrency: (amount, showSymbol = true) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return showSymbol ? "₹0" : "0";

    const formatted = num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return showSymbol ? `₹${formatted}` : formatted;
  },

  // ==========================================
  // FORMAT DATE
  // ==========================================
  formatDate: (date, format = "full") => {
    const d = new Date(date);

    if (isNaN(d.getTime())) return null;

    const options = {
      full: { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" },
      date: { day: "2-digit", month: "short", year: "numeric" },
      time: { hour: "2-digit", minute: "2-digit" },
      iso: null
    };

    if (format === "iso") {
      return d.toISOString();
    }

    return d.toLocaleString("en-IN", options[format] || options.full);
  },

  // ==========================================
  // FORMAT TIME (HH:MM)
  // ==========================================
  formatTime: (time) => {
    if (!time) return "--:--";

    // If it's a date object
    if (time instanceof Date) {
      return time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    }

    // If it's a time string (HH:MM:SS)
    const parts = time.toString().split(":");
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }

    return time;
  },

  // ==========================================
  // CALCULATE SURGE PRICE
  // ==========================================
  calculateSurgePrice: (basePrice, surgePercentage = constants.SURGE_PRICING.SURGE_PERCENTAGE) => {
    const base = parseFloat(basePrice);
    const surge = base * (surgePercentage / 100);
    return Math.round((base + surge) * 100) / 100;
  },

  // ==========================================
  // VALIDATE EMAIL FORMAT
  // ==========================================
  isValidEmail: (email) => {
    return constants.REGEX.EMAIL.test(email);
  },

  // ==========================================
  // VALIDATE UUID FORMAT
  // ==========================================
  isValidUUID: (uuid) => {
    return constants.REGEX.UUID.test(uuid);
  },

  // ==========================================
  // VALIDATE PNR FORMAT
  // ==========================================
  isValidPNR: (pnr) => {
    return constants.REGEX.PNR.test(pnr);
  },

  // ==========================================
  // SANITIZE STRING (Remove extra spaces, trim)
  // ==========================================
  sanitizeString: (str) => {
    if (!str || typeof str !== "string") return "";
    return str.trim().replace(/\s+/g, " ");
  },

  // ==========================================
  // CAPITALIZE FIRST LETTER
  // ==========================================
  capitalize: (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // ==========================================
  // CAPITALIZE EACH WORD
  // ==========================================
  capitalizeWords: (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => helpers.capitalize(word))
      .join(" ");
  },

  // ==========================================
  // GENERATE RANDOM NUMBER IN RANGE
  // ==========================================
  randomInRange: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // ==========================================
  // GENERATE RANDOM PRICE (₹2000-₹3000)
  // ==========================================
  generateRandomPrice: () => {
    return helpers.randomInRange(
      constants.FLIGHT_PRICE.MIN_PRICE,
      constants.FLIGHT_PRICE.MAX_PRICE
    );
  },

  // ==========================================
  // GENERATE RANDOM TIME (HH:MM)
  // ==========================================
  generateRandomTime: () => {
    const hours = helpers.randomInRange(0, 23).toString().padStart(2, "0");
    const minutes = ["00", "15", "30", "45"][helpers.randomInRange(0, 3)];
    return `${hours}:${minutes}:00`;
  },

  // ==========================================
  // PARSE PAGINATION PARAMS
  // ==========================================
  parsePagination: (query) => {
    let page = parseInt(query.page) || constants.PAGINATION.DEFAULT_PAGE;
    let limit = parseInt(query.limit) || constants.PAGINATION.DEFAULT_LIMIT;

    // Enforce limits
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), constants.PAGINATION.MAX_LIMIT);

    const offset = (page - 1) * limit;

    return { page, limit, offset };
  },

  // ==========================================
  // BUILD PAGINATION RESPONSE
  // ==========================================
  buildPaginationResponse: (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  },

  // ==========================================
  // CALCULATE TIME DIFFERENCE IN MINUTES
  // ==========================================
  timeDifferenceInMinutes: (startTime, endTime) => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.abs(end - start) / (1000 * 60);
  },

  // ==========================================
  // CHECK IF TIME IS WITHIN WINDOW
  // ==========================================
  isWithinTimeWindow: (timestamp, windowMinutes) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    return now - time <= windowMinutes * 60 * 1000;
  },

  // ==========================================
  // MASK EMAIL (jo***@example.com)
  // ==========================================
  maskEmail: (email) => {
    if (!email) return "";
    const [local, domain] = email.split("@");
    const maskedLocal = local.slice(0, 2) + "***";
    return `${maskedLocal}@${domain}`;
  },

  // ==========================================
  // GENERATE FLIGHT ROUTE STRING
  // ==========================================
  generateRouteString: (departure, arrival) => {
    return `${departure} → ${arrival}`;
  },

  // ==========================================
  // PICK RANDOM FROM ARRAY
  // ==========================================
  pickRandom: (array) => {
    return array[Math.floor(Math.random() * array.length)];
  },

  // ==========================================
  // SLEEP/DELAY (For testing)
  // ==========================================
  sleep: (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  // ==========================================
  // DEEP CLONE OBJECT
  // ==========================================
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },

  // ==========================================
  // OMIT KEYS FROM OBJECT
  // ==========================================
  omit: (obj, keys) => {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
  },

  // ==========================================
  // PICK KEYS FROM OBJECT
  // ==========================================
  pick: (obj, keys) => {
    const result = {};
    keys.forEach((key) => {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
    });
    return result;
  }
};

module.exports = helpers;