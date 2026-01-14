// services/authService.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const environment = require("../config/environment");

const authService = {
  // Register new user
  register: async (userData) => {
    const { first_name, last_name, email, password, phone } = userData;

    // Check existing email
    const exists = await User.emailExists(email);
    if (exists) {
      throw new Error("Email already registered");
    }

    // Create user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      phone,
      role: "customer"
    });

    // Generate token
    const token = authService.generateToken(user);

    return { user, token };
  },

  // Login user
  login: async (email, password) => {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await User.validatePassword(password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    await User.updateLastLogin(user.id);
    const token = authService.generateToken(user);

    return { user, token };
  },

  // Get profile
  getProfile: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },

  // Update profile
  updateProfile: async (userId, updateData) => {
    if (updateData.email) {
      const existing = await User.findByEmailSafe(updateData.email);
      if (existing && existing.id !== userId) {
        throw new Error("Email already in use");
      }
    }

    return await User.update(userId, updateData);
  },

  // Change password
  changePassword: async (userId, currentPassword, newPassword) => {
    const user = await User.findByIdWithPassword(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const isValid = await User.validatePassword(currentPassword, user.password);
    if (!isValid) {
      throw new Error("Current password incorrect");
    }

    await User.updatePassword(userId, newPassword);
    return { success: true };
  },

  // Generate JWT
  generateToken: (user) => {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      environment.JWT_SECRET,
      { expiresIn: environment.JWT_EXPIRES_IN }
    );
  },

  // Verify JWT
  verifyToken: (token) => {
    return jwt.verify(token, environment.JWT_SECRET);
  }
};

module.exports = authService;