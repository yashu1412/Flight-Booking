// validators/bookingValidator.js

const constants = require("../utils/constants");
const helpers = require("../utils/helpers");

const bookingValidator = {
  // ==========================================
  // VALIDATE BOOKING INITIATION
  // ==========================================
  validateInitiate: (req, res, next) => {
    const { flight_id } = req.body;
    const errors = {};

    // Flight ID validation
    if (!flight_id) {
      errors.flight_id = "Flight ID is required";
    } else if (!helpers.isValidUUID(flight_id)) {
      errors.flight_id = "Invalid flight ID format";
    }

    // Return errors if any
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: constants.ERRORS.VALIDATION_FAILED,
        errors
      });
    }

    next();
  },

  // ==========================================
  // VALIDATE BOOKING CONFIRMATION
  // ==========================================
  validateConfirm: (req, res, next) => {
    const { flight_id, passenger_name, passenger_email, passenger_phone } = req.body;
    const errors = {};

    // Flight ID validation
    if (!flight_id) {
      errors.flight_id = "Flight ID is required";
    } else if (!helpers.isValidUUID(flight_id)) {
      errors.flight_id = "Invalid flight ID format";
    }

    // Passenger name validation
    if (!passenger_name || passenger_name.trim().length === 0) {
      errors.passenger_name = "Passenger name is required";
    } else if (passenger_name.trim().length < 2) {
      errors.passenger_name = "Passenger name must be at least 2 characters";
    } else if (passenger_name.trim().length > 100) {
      errors.passenger_name = "Passenger name cannot exceed 100 characters";
    }

    // Passenger email validation (optional)
    if (passenger_email && !helpers.isValidEmail(passenger_email)) {
      errors.passenger_email = "Invalid email format";
    }

    // Passenger phone validation (optional)
    if (passenger_phone && !constants.REGEX.PHONE.test(passenger_phone)) {
      errors.passenger_phone = "Invalid phone number. Must be 10 digits";
    }

    // Return errors if any
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: constants.ERRORS.VALIDATION_FAILED,
        errors
      });
    }

    // Sanitize inputs
    req.body.passenger_name = helpers.capitalizeWords(helpers.sanitizeString(passenger_name));
    if (passenger_email) {
      req.body.passenger_email = passenger_email.toLowerCase().trim();
    }

    next();
  },

  // ==========================================
  // VALIDATE PNR PARAMETER
  // ==========================================
  validatePNR: (req, res, next) => {
    const { pnr } = req.params;

    if (!pnr) {
      return res.status(400).json({
        success: false,
        message: "PNR is required"
      });
    }

    if (!helpers.isValidPNR(pnr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PNR format. Must be 6 alphanumeric characters"
      });
    }

    // Convert to uppercase
    req.params.pnr = pnr.toUpperCase();

    next();
  },

  // ==========================================
  // VALIDATE BOOKING HISTORY QUERY
  // ==========================================
  validateHistoryQuery: (req, res, next) => {
    const { page, limit, status } = req.query;
    const errors = {};

    // Page validation
    if (page !== undefined) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        errors.page = "Page must be a positive number";
      }
    }

    // Limit validation
    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > constants.PAGINATION.MAX_LIMIT) {
        errors.limit = `Limit must be between 1 and ${constants.PAGINATION.MAX_LIMIT}`;
      }
    }

    // Status validation
    if (status !== undefined) {
      const validStatuses = Object.values(constants.BOOKING_STATUS);
      if (!validStatuses.includes(status.toUpperCase())) {
        errors.status = `Invalid status. Must be one of: ${validStatuses.join(", ")}`;
      }
    }

    // Return errors if any
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: constants.ERRORS.VALIDATION_FAILED,
        errors
      });
    }

    next();
  }
};

module.exports = bookingValidator;