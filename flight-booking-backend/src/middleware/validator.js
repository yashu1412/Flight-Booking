// middleware/validator.js

const validator = {
  // ==========================================
  // VALIDATE REGISTRATION INPUT
  // ==========================================
  validateRegistration: (req, res, next) => {
    const { first_name, last_name, email, password } = req.body;
    const errors = {};

    // First name
    if (!first_name || first_name.trim().length === 0) {
      errors.first_name = "First name is required";
    } else if (first_name.trim().length < 2) {
      errors.first_name = "First name must be at least 2 characters";
    }

    // Last name
    if (!last_name || last_name.trim().length === 0) {
      errors.last_name = "Last name is required";
    } else if (last_name.trim().length < 2) {
      errors.last_name = "Last name must be at least 2 characters";
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim().length === 0) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Invalid email format";
    }

    // Password
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    next();
  },

  // ==========================================
  // VALIDATE LOGIN INPUT
  // ==========================================
  validateLogin: (req, res, next) => {
    const { email, password } = req.body;
    const errors = {};

    if (!email || email.trim().length === 0) {
      errors.email = "Email is required";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    next();
  },

  // ==========================================
  // VALIDATE BOOKING INPUT
  // ==========================================
  validateBooking: (req, res, next) => {
    const { flight_id, passenger_name } = req.body;
    const errors = {};

    if (!flight_id) {
      errors.flight_id = "Flight ID is required";
    }

    if (!passenger_name || passenger_name.trim().length === 0) {
      errors.passenger_name = "Passenger name is required";
    } else if (passenger_name.trim().length < 2) {
      errors.passenger_name = "Passenger name must be at least 2 characters";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    next();
  },

  // ==========================================
  // VALIDATE FLIGHT INPUT (Admin)
  // ==========================================
  validateFlight: (req, res, next) => {
    const {
      flight_id,
      airline,
      departure_city,
      arrival_city,
      base_price,
      departure_time,
      arrival_time
    } = req.body;
    const errors = {};

    if (!flight_id || flight_id.trim().length === 0) {
      errors.flight_id = "Flight ID is required";
    }

    if (!airline || airline.trim().length === 0) {
      errors.airline = "Airline is required";
    }

    if (!departure_city || departure_city.trim().length === 0) {
      errors.departure_city = "Departure city is required";
    }

    if (!arrival_city || arrival_city.trim().length === 0) {
      errors.arrival_city = "Arrival city is required";
    }

    if (departure_city && arrival_city && 
        departure_city.toLowerCase() === arrival_city.toLowerCase()) {
      errors.arrival_city = "Arrival city must be different from departure city";
    }

    if (!base_price) {
      errors.base_price = "Base price is required";
    } else if (base_price < 2000 || base_price > 3000) {
      errors.base_price = "Base price must be between ₹2000 and ₹3000";
    }

    if (!departure_time) {
      errors.departure_time = "Departure time is required";
    }

    if (!arrival_time) {
      errors.arrival_time = "Arrival time is required";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    next();
  },

  // ==========================================
  // VALIDATE UUID PARAMETER
  // ==========================================
  validateUUID: (paramName = "id") => {
    return (req, res, next) => {
      const uuid = req.params[paramName];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!uuid || !uuidRegex.test(uuid)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${paramName} format`
        });
      }

      next();
    };
  },

  // ==========================================
  // VALIDATE PNR PARAMETER
  // ==========================================
  validatePNR: (req, res, next) => {
    const { pnr } = req.params;
    const pnrRegex = /^[A-Z0-9]{6}$/i;

    if (!pnr || !pnrRegex.test(pnr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PNR format. Must be 6 alphanumeric characters."
      });
    }

    next();
  }
};

module.exports = validator;