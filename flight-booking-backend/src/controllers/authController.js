// controllers/authController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const authController = {
  // ==========================================
  // REGISTER NEW USER
  // POST /api/auth/register
  // ==========================================
  register: async (req, res) => {
    try {
      const { first_name, last_name, email, password, phone } = req.body;

      // Validation
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
          errors: {
            first_name: !first_name ? "First name is required" : null,
            last_name: !last_name ? "Last name is required" : null,
            email: !email ? "Email is required" : null,
            password: !password ? "Password is required" : null
          }
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format"
        });
      }

      // Password strength validation
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters"
        });
      }

      // Check if email already exists
      const existingUser = await User.emailExists(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered"
        });
      }

      // Create user
      const newUser = await User.create({
        first_name,
        last_name,
        email,
        password,
        phone,
        role: "customer"
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          user: {
            id: newUser.id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            phone: newUser.phone,
            wallet_balance: newUser.wallet_balance,
            role: newUser.role
          },
          token
        }
      });

    } catch (error) {
      console.error("Register Error:", error);
      return res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message
      });
    }
  },

  // ==========================================
  // LOGIN USER
  // POST /api/auth/login
  // ==========================================
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required"
        });
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      // Validate password
      const isValidPassword = await User.validatePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            wallet_balance: user.wallet_balance,
            role: user.role
          },
          token
        }
      });

    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message
      });
    }
  },

  // ==========================================
  // GET CURRENT USER PROFILE
  // GET /api/auth/profile
  // ==========================================
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            wallet_balance: user.wallet_balance,
            role: user.role,
            is_verified: user.is_verified,
            last_login: user.last_login,
            created_at: user.created_at
          }
        }
      });

    } catch (error) {
      console.error("Get Profile Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
        error: error.message
      });
    }
  },

  // ==========================================
  // UPDATE USER PROFILE
  // PUT /api/auth/profile
  // ==========================================
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { first_name, last_name, email, phone } = req.body;

      // Check if email is being changed and if it's already taken
      if (email) {
        const existingUser = await User.findByEmailSafe(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({
            success: false,
            message: "Email already in use by another account"
          });
        }
      }

      const updatedUser = await User.update(userId, {
        first_name,
        last_name,
        email,
        phone
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: { user: updatedUser }
      });

    } catch (error) {
      console.error("Update Profile Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message
      });
    }
  },

  // ==========================================
  // CHANGE PASSWORD
  // PUT /api/auth/change-password
  // ==========================================
  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { current_password, new_password } = req.body;

      // Validation
      if (!current_password || !new_password) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required"
        });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters"
        });
      }

      // Get user with password
      const user = await User.findByIdWithPassword(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Validate current password
      const isValidPassword = await User.validatePassword(current_password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      // Update password
      await User.updatePassword(userId, new_password);

      return res.status(200).json({
        success: true,
        message: "Password changed successfully"
      });

    } catch (error) {
      console.error("Change Password Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to change password",
        error: error.message
      });
    }
  },

  // ==========================================
  // LOGOUT (Optional - for token blacklisting)
  // POST /api/auth/logout
  // ==========================================
  logout: async (req, res) => {
    try {
      // For JWT, logout is typically handled client-side by removing token
      // If you implement token blacklisting, add logic here

      return res.status(200).json({
        success: true,
        message: "Logout successful"
      });

    } catch (error) {
      console.error("Logout Error:", error);
      return res.status(500).json({
        success: false,
        message: "Logout failed",
        error: error.message
      });
    }
  }
};

module.exports = authController;