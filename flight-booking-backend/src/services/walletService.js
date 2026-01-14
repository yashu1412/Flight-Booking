// services/walletService.js

const User = require("../models/User");
const environment = require("../config/environment");

const DEFAULT_BALANCE = environment.DEFAULT_WALLET_BALANCE || 50000;

const walletService = {
  // Get default balance
  getDefaultBalance: () => DEFAULT_BALANCE,

  // Get current balance
  getBalance: async (userId) => {
    const balance = await User.getWalletBalance(userId);
    return {
      balance,
      formatted: `₹${balance.toLocaleString("en-IN")}`,
      currency: "INR"
    };
  },

  // Check if balance is sufficient
  checkSufficientBalance: async (userId, amount) => {
    const balance = await User.getWalletBalance(userId);
    const required = parseFloat(amount);
    const isSufficient = balance >= required;

    return {
      balance,
      required,
      isSufficient,
      shortfall: isSufficient ? 0 : required - balance
    };
  },

  // Deduct from wallet (for booking)
  deduct: async (userId, amount, description = "Flight booking") => {
    const balance = await User.getWalletBalance(userId);
    const deductAmount = parseFloat(amount);

    if (balance < deductAmount) {
      throw new Error("Insufficient wallet balance");
    }

    const result = await User.deductFromWallet(userId, deductAmount);

    return {
      success: true,
      previousBalance: result.previousBalance,
      deductedAmount: result.deductedAmount,
      newBalance: result.newBalance,
      description,
      timestamp: new Date()
    };
  },

  // Credit to wallet (for refund)
  credit: async (userId, amount, description = "Refund") => {
    const result = await User.addToWallet(userId, parseFloat(amount));

    return {
      success: true,
      previousBalance: result.previousBalance,
      creditedAmount: result.addedAmount,
      newBalance: result.newBalance,
      description,
      timestamp: new Date()
    };
  },

  // Reset wallet to default
  resetWallet: async (userId) => {
    const newBalance = await User.resetWallet(userId);

    return {
      success: true,
      newBalance,
      formatted: `₹${newBalance.toLocaleString("en-IN")}`
    };
  },

  // Process booking payment
  processBookingPayment: async (userId, amount, bookingId) => {
    const checkResult = await walletService.checkSufficientBalance(userId, amount);

    if (!checkResult.isSufficient) {
      return {
        success: false,
        error: "Insufficient balance",
        required: checkResult.required,
        available: checkResult.balance,
        shortfall: checkResult.shortfall
      };
    }

    const deductResult = await walletService.deduct(
      userId,
      amount,
      `Booking payment - ID: ${bookingId}`
    );

    return {
      success: true,
      ...deductResult
    };
  },

  // Process refund
  processRefund: async (userId, amount, bookingId, pnr) => {
    const creditResult = await walletService.credit(
      userId,
      amount,
      `Refund for cancelled booking - PNR: ${pnr}`
    );

    return {
      success: true,
      ...creditResult
    };
  },

  // Get wallet summary
  getWalletSummary: async (userId) => {
    const balance = await User.getWalletBalance(userId);

    return {
      currentBalance: balance,
      formatted: `₹${balance.toLocaleString("en-IN")}`,
      defaultBalance: DEFAULT_BALANCE,
      spentAmount: DEFAULT_BALANCE - balance,
      currency: "INR"
    };
  }
};

module.exports = walletService;