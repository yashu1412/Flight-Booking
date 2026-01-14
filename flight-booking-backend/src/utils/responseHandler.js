// utils/responseHandler.js

const responseHandler = {
  // ==========================================
  // SUCCESS RESPONSE
  // ==========================================
  success: (res, data = null, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  },

  // ==========================================
  // CREATED RESPONSE (201)
  // ==========================================
  created: (res, data = null, message = "Created successfully") => {
    return res.status(201).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  },

  // ==========================================
  // ERROR RESPONSE
  // ==========================================
  error: (res, message = "An error occurred", statusCode = 500, errors = null) => {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  },

  // ==========================================
  // BAD REQUEST (400)
  // ==========================================
  badRequest: (res, message = "Bad request", errors = null) => {
    return responseHandler.error(res, message, 400, errors);
  },

  // ==========================================
  // UNAUTHORIZED (401)
  // ==========================================
  unauthorized: (res, message = "Unauthorized access") => {
    return responseHandler.error(res, message, 401);
  },

  // ==========================================
  // FORBIDDEN (403)
  // ==========================================
  forbidden: (res, message = "Access forbidden") => {
    return responseHandler.error(res, message, 403);
  },

  // ==========================================
  // NOT FOUND (404)
  // ==========================================
  notFound: (res, message = "Resource not found") => {
    return responseHandler.error(res, message, 404);
  },

  // ==========================================
  // CONFLICT (409)
  // ==========================================
  conflict: (res, message = "Resource already exists") => {
    return responseHandler.error(res, message, 409);
  },

  // ==========================================
  // VALIDATION ERROR (422)
  // ==========================================
  validationError: (res, errors, message = "Validation failed") => {
    return res.status(422).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  },

  // ==========================================
  // TOO MANY REQUESTS (429)
  // ==========================================
  tooManyRequests: (res, message = "Too many requests") => {
    return responseHandler.error(res, message, 429);
  },

  // ==========================================
  // INTERNAL SERVER ERROR (500)
  // ==========================================
  serverError: (res, message = "Internal server error", error = null) => {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    // Include error details in development
    if (process.env.NODE_ENV === "development" && error) {
      response.error = error.message;
      response.stack = error.stack;
    }

    return res.status(500).json(response);
  },

  // ==========================================
  // PAGINATED RESPONSE
  // ==========================================
  paginated: (res, data, pagination, message = "Success") => {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPrevPage: pagination.page > 1
      },
      timestamp: new Date().toISOString()
    });
  },

  // ==========================================
  // DOWNLOAD RESPONSE (For PDF)
  // ==========================================
  download: (res, buffer, filename, contentType = "application/pdf") => {
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  }
};

module.exports = responseHandler;