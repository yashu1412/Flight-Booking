// middleware/errorHandler.js

const environment = require("../config/environment");

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // PostgreSQL Errors
  if (err.code) {
    switch (err.code) {
      case "23505": // Unique violation
        statusCode = 409;
        message = "Duplicate entry. This record already exists.";
        break;
      case "23503": // Foreign key violation
        statusCode = 400;
        message = "Referenced record does not exist.";
        break;
      case "23502": // Not null violation
        statusCode = 400;
        message = "Required field is missing.";
        break;
      case "22P02": // Invalid input syntax
        statusCode = 400;
        message = "Invalid input format.";
        break;
      case "ECONNREFUSED":
        statusCode = 503;
        message = "Database connection failed.";
        break;
    }
  }

  // Validation Errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed.";
    errors = err.errors;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired.";
  }

  // Send response
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(environment.NODE_ENV === "development" && {
      stack: err.stack,
      error: err
    })
  };

  res.status(statusCode).json(response);
};

// ==========================================
// NOT FOUND HANDLER (404)
// ==========================================
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

// ==========================================
// ASYNC HANDLER WRAPPER
// (Catches errors in async functions)
// ==========================================
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ==========================================
// CUSTOM ERROR CLASS
// ==========================================
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = errorHandler;
module.exports.notFoundHandler = notFoundHandler;
module.exports.asyncHandler = asyncHandler;
module.exports.AppError = AppError;