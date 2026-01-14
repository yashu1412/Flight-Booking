// validators/flightValidator.js

const constants = require("../utils/constants");
const helpers = require("../utils/helpers");

const flightValidator = {
  // ==========================================
  // VALIDATE FLIGHT SEARCH QUERY
  // ==========================================
  validateSearch: (req, res, next) => {
    const {
      departure_city,
      arrival_city,
      min_price,
      max_price,
      airline,
      sort_by,
      sort_order,
      limit
    } = req.query;

    const errors = {};

    // Price validations
    if (min_price !== undefined) {
      const minP = parseFloat(min_price);
      if (isNaN(minP) || minP < 0) {
        errors.min_price = "Minimum price must be a positive number";
      }
    }

    if (max_price !== undefined) {
      const maxP = parseFloat(max_price);
      if (isNaN(maxP) || maxP < 0) {
        errors.max_price = "Maximum price must be a positive number";
      }
    }

    if (min_price && max_price) {
      if (parseFloat(min_price) > parseFloat(max_price)) {
        errors.price_range = "Minimum price cannot be greater than maximum price";
      }
    }

    // Same city validation
    if (departure_city && arrival_city) {
      if (departure_city.toLowerCase().trim() === arrival_city.toLowerCase().trim()) {
        errors.cities = "Departure and arrival cities cannot be the same";
      }
    }

    // Sort by validation
    if (sort_by !== undefined) {
      const allowedSortFields = ["base_price", "departure_time", "airline", "created_at"];
      if (!allowedSortFields.includes(sort_by)) {
        errors.sort_by = `Sort by must be one of: ${allowedSortFields.join(", ")}`;
      }
    }

    // Sort order validation
    if (sort_order !== undefined) {
      if (!["ASC", "DESC", "asc", "desc"].includes(sort_order)) {
        errors.sort_order = "Sort order must be ASC or DESC";
      }
    }

    // Limit validation
    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > constants.PAGINATION.MAX_LIMIT) {
        errors.limit = `Limit must be between 1 and ${constants.PAGINATION.MAX_LIMIT}`;
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

    // Sanitize inputs
    if (departure_city) req.query.departure_city = helpers.sanitizeString(departure_city);
    if (arrival_city) req.query.arrival_city = helpers.sanitizeString(arrival_city);
    if (airline) req.query.airline = helpers.sanitizeString(airline);
    if (sort_order) req.query.sort_order = sort_order.toUpperCase();

    next();
  },

  // ==========================================
  // VALIDATE UUID PARAMETER
  // ==========================================
  validateUUID: (paramName = "id") => {
    return (req, res, next) => {
      const uuid = req.params[paramName];

      if (!uuid) {
        return res.status(400).json({
          success: false,
          message: `${paramName} is required`
        });
      }

      if (!helpers.isValidUUID(uuid)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${paramName} format`
        });
      }

      next();
    };
  },

  // ==========================================
  // VALIDATE CREATE FLIGHT (Admin)
  // ==========================================
  validateCreate: (req, res, next) => {
    const {
      flight_id,
      airline,
      departure_city,
      arrival_city,
      base_price,
      departure_time,
      arrival_time,
      available_seats
    } = req.body;

    const errors = {};

    // Flight ID validation
    if (!flight_id || flight_id.trim().length === 0) {
      errors.flight_id = "Flight ID is required";
    } else if (flight_id.trim().length > 20) {
      errors.flight_id = "Flight ID cannot exceed 20 characters";
    }

    // Airline validation
    if (!airline || airline.trim().length === 0) {
      errors.airline = "Airline is required";
    } else if (airline.trim().length > 100) {
      errors.airline = "Airline name cannot exceed 100 characters";
    }

    // Departure city validation
    if (!departure_city || departure_city.trim().length === 0) {
      errors.departure_city = "Departure city is required";
    }

    // Arrival city validation
    if (!arrival_city || arrival_city.trim().length === 0) {
      errors.arrival_city = "Arrival city is required";
    }

    // Same city check
    if (departure_city && arrival_city) {
      if (departure_city.toLowerCase().trim() === arrival_city.toLowerCase().trim()) {
        errors.arrival_city = "Departure and arrival cities cannot be the same";
      }
    }

    // Base price validation
    if (base_price === undefined || base_price === null) {
      errors.base_price = "Base price is required";
    } else {
      const price = parseFloat(base_price);
      if (isNaN(price)) {
        errors.base_price = "Base price must be a valid number";
      } else if (price < constants.FLIGHT_PRICE.MIN_PRICE || price > constants.FLIGHT_PRICE.MAX_PRICE) {
        errors.base_price = `Base price must be between ₹${constants.FLIGHT_PRICE.MIN_PRICE} and ₹${constants.FLIGHT_PRICE.MAX_PRICE}`;
      }
    }

    // Departure time validation
    if (!departure_time) {
      errors.departure_time = "Departure time is required";
    } else if (!constants.REGEX.TIME.test(departure_time)) {
      errors.departure_time = "Invalid departure time format. Use HH:MM or HH:MM:SS";
    }

    // Arrival time validation
    if (!arrival_time) {
      errors.arrival_time = "Arrival time is required";
    } else if (!constants.REGEX.TIME.test(arrival_time)) {
      errors.arrival_time = "Invalid arrival time format. Use HH:MM or HH:MM:SS";
    }

    // Available seats validation (optional)
    if (available_seats !== undefined) {
      const seats = parseInt(available_seats);
      if (isNaN(seats) || seats < 0) {
        errors.available_seats = "Available seats must be a non-negative number";
      } else if (seats > 500) {
        errors.available_seats = "Available seats cannot exceed 500";
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

    // Sanitize inputs
    req.body.flight_id = flight_id.toUpperCase().trim();
    req.body.airline = helpers.capitalizeWords(helpers.sanitizeString(airline));
    req.body.departure_city = helpers.capitalizeWords(helpers.sanitizeString(departure_city));
    req.body.arrival_city = helpers.capitalizeWords(helpers.sanitizeString(arrival_city));
    req.body.base_price = parseFloat(base_price);

    next();
  },

  // ==========================================
  // VALIDATE UPDATE FLIGHT (Admin)
  // ==========================================
  validateUpdate: (req, res, next) => {
    const {
      airline,
      departure_city,
      arrival_city,
      base_price,
      departure_time,
      arrival_time,
      available_seats,
      status
    } = req.body;

    const errors = {};

    // Check if at least one field is provided
    const hasField = airline || departure_city || arrival_city || 
                     base_price !== undefined || departure_time || 
                     arrival_time || available_seats !== undefined || status;

    if (!hasField) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required for update"
      });
    }

    // Airline validation (if provided)
    if (airline !== undefined) {
      if (airline.trim().length === 0) {
        errors.airline = "Airline cannot be empty";
      } else if (airline.trim().length > 100) {
        errors.airline = "Airline name cannot exceed 100 characters";
      }
    }

    // Departure city validation (if provided)
    if (departure_city !== undefined && departure_city.trim().length === 0) {
      errors.departure_city = "Departure city cannot be empty";
    }

    // Arrival city validation (if provided)
    if (arrival_city !== undefined && arrival_city.trim().length === 0) {
      errors.arrival_city = "Arrival city cannot be empty";
    }

    // Same city check (if both provided)
    if (departure_city && arrival_city) {
      if (departure_city.toLowerCase().trim() === arrival_city.toLowerCase().trim()) {
        errors.arrival_city = "Departure and arrival cities cannot be the same";
      }
    }

    // Base price validation (if provided)
    if (base_price !== undefined) {
      const price = parseFloat(base_price);
      if (isNaN(price)) {
        errors.base_price = "Base price must be a valid number";
      } else if (price < constants.FLIGHT_PRICE.MIN_PRICE || price > constants.FLIGHT_PRICE.MAX_PRICE) {
        errors.base_price = `Base price must be between ₹${constants.FLIGHT_PRICE.MIN_PRICE} and ₹${constants.FLIGHT_PRICE.MAX_PRICE}`;
      }
    }

    // Departure time validation (if provided)
    if (departure_time !== undefined && !constants.REGEX.TIME.test(departure_time)) {
      errors.departure_time = "Invalid departure time format";
    }

    // Arrival time validation (if provided)
    if (arrival_time !== undefined && !constants.REGEX.TIME.test(arrival_time)) {
      errors.arrival_time = "Invalid arrival time format";
    }

    // Available seats validation (if provided)
    if (available_seats !== undefined) {
      const seats = parseInt(available_seats);
      if (isNaN(seats) || seats < 0) {
        errors.available_seats = "Available seats must be a non-negative number";
      } else if (seats > 500) {
        errors.available_seats = "Available seats cannot exceed 500";
      }
    }

    // Status validation (if provided)
    if (status !== undefined) {
      const validStatuses = Object.values(constants.FLIGHT_STATUS);
      if (!validStatuses.includes(status.toLowerCase())) {
        errors.status = `Status must be one of: ${validStatuses.join(", ")}`;
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

    // Sanitize inputs
    if (airline) req.body.airline = helpers.capitalizeWords(helpers.sanitizeString(airline));
    if (departure_city) req.body.departure_city = helpers.capitalizeWords(helpers.sanitizeString(departure_city));
    if (arrival_city) req.body.arrival_city = helpers.capitalizeWords(helpers.sanitizeString(arrival_city));
    if (base_price !== undefined) req.body.base_price = parseFloat(base_price);
    if (status) req.body.status = status.toLowerCase();

    next();
  }
};

module.exports = flightValidator;