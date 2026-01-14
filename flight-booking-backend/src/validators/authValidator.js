// validators/authValidator.js

const constants = require("../utils/constants");
const helpers = require("../utils/helpers");

const authValidator = {
  // ==========================================
  // VALIDATE REGISTRATION INPUT
  // ==========================================
  validateRegistration: (req, res, next) => {
    const { first_name, last_name, email, password, phone } = req.body;
    const errors = {};

    // First name validation
    if (!first_name || first_name.trim().length === 0) {
      errors.first_name = "First name is required";
    } else if (first_name.trim().length < 2) {
      errors.first_name = "First name must be at least 2 characters";
    } else if (first_name.trim().length > 50) {
      errors.first_name = "First name cannot exceed 50 characters";
    }

    // Last name validation
    if (!last_name || last_name.trim().length === 0) {
      errors.last_name = "Last name is required";
    } else if (last_name.trim().length < 2) {
      errors.last_name = "Last name must be at least 2 characters";
    } else if (last_name.trim().length > 50) {
      errors.last_name = "Last name cannot exceed 50 characters";
    }

    // Email validation
    if (!email || email.trim().length === 0) {
      errors.email = "Email is required";
    } else if (!helpers.isValidEmail(email)) {
      errors.email = "Invalid email format";
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (password.length > 100) {
      errors.password = "Password cannot exceed 100 characters";
    }

    // Phone validation (optional)
    if (phone && !constants.REGEX.PHONE.test(phone)) {
      errors.phone = "Invalid phone number. Must be 10 digits";
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
    req.body.first_name = helpers.sanitizeString(first_name);
    req.body.last_name = helpers.sanitizeString(last_name);
    req.body.email = email.toLowerCase().trim();

    next();
  },

  // ==========================================
  // VALIDATE LOGIN INPUT
  // ==========================================
  validateLogin: (req, res, next) => {
    const { email, password } = req.body;
    const errors = {};

    // Email validation
    if (!email || email.trim().length === 0) {
      errors.email = "Email is required";
    } else if (!helpers.isValidEmail(email)) {
      errors.email = "Invalid email format";
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    }

    // Return errors if any
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: constants.ERRORS.VALIDATION_FAILED,
        errors
      });
    }

    // Sanitize email
    req.body.email = email.toLowerCase().trim();

    next();
  },

  // ==========================================
  // VALIDATE PASSWORD CHANGE INPUT
  // ==========================================
  validatePasswordChange: (req, res, next) => {
    const { current_password, new_password, confirm_password } = req.body;
    const errors = {};

    // Current password
    if (!current_password) {
      errors.current_password = "Current password is required";
    }

    // New password
    if (!new_password) {
      errors.new_password = "New password is required";
    } else if (new_password.length < 6) {
      errors.new_password = "New password must be at least 6 characters";
    } else if (new_password === current_password) {
      errors.new_password = "New password must be different from current password";
    }

    // Confirm password (optional check)
    if (confirm_password && confirm_password !== new_password) {
      errors.confirm_password = "Passwords do not match";
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
  // VALIDATE PROFILE UPDATE INPUT
  // ==========================================
  validateProfileUpdate: (req, res, next) => {
    const { first_name, last_name, email, phone } = req.body;
    const errors = {};

    // At least one field should be provided
    if (!first_name && !last_name && !email && !phone) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required for update"
      });
    }

    // First name validation (if provided)
    if (first_name !== undefined) {
      if (first_name.trim().length < 2) {
        errors.first_name = "First name must be at least 2 characters";
      } else if (first_name.trim().length > 50) {
        errors.first_name = "First name cannot exceed 50 characters";
      }
    }

    // Last name validation (if provided)
    if (last_name !== undefined) {
      if (last_name.trim().length < 2) {
        errors.last_name = "Last name must be at least 2 characters";
      } else if (last_name.trim().length > 50) {
        errors.last_name = "Last name cannot exceed 50 characters";
      }
    }

    // Email validation (if provided)
    if (email !== undefined && !helpers.isValidEmail(email)) {
      errors.email = "Invalid email format";
    }

    // Phone validation (if provided)
    if (phone !== undefined && phone !== "" && !constants.REGEX.PHONE.test(phone)) {
      errors.phone = "Invalid phone number. Must be 10 digits";
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
    if (first_name) req.body.first_name = helpers.sanitizeString(first_name);
    if (last_name) req.body.last_name = helpers.sanitizeString(last_name);
    if (email) req.body.email = email.toLowerCase().trim();

    next();
  }
};

module.exports = authValidator;