// controllers/walletController.js

const User = require("../models/User");

const walletController = {
  // ==========================================
  // GET WALLET BALANCE
  // GET /api/wallet/balance
  // ==========================================
  getBalance: async (req, res) => {
    try {
      const userId = req.user.id;

      const balance = await User.getWalletBalance(userId);

      return res.status(200).json({
        success: true,
        data: {
          wallet_balance: balance,
          currency: "INR",
          formatted: `₹${balance.toLocaleString("en-IN")}`
        }
      });

    } catch (error) {
      console.error("Get Balance Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch wallet balance",
        error: error.message
      });
    }
  },

  // ==========================================
  // CHECK IF BALANCE IS SUFFICIENT
  // POST /api/wallet/check
  // ==========================================
  checkBalance: async (req, res) => {
    try {
      const userId = req.user.id;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid amount is required"
        });
      }

      const balance = await User.getWalletBalance(userId);
      const isSufficient = balance >= parseFloat(amount);

      return res.status(200).json({
        success: true,
        data: {
          required_amount: parseFloat(amount),
          wallet_balance: balance,
          is_sufficient: isSufficient,
          shortfall: isSufficient ? 0 : parseFloat(amount) - balance
        }
      });

    } catch (error) {
      console.error("Check Balance Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to check balance",
        error: error.message
      });
    }
  },

  // ==========================================
  // RESET WALLET TO DEFAULT (For Testing)
  // POST /api/wallet/reset
  // ==========================================
  resetWallet: async (req, res) => {
    try {
      const userId = req.user.id;

      const newBalance = await User.resetWallet(userId);

      return res.status(200).json({
        success: true,
        message: "Wallet reset to default balance",
        data: {
          wallet_balance: newBalance,
          formatted: `₹${newBalance.toLocaleString("en-IN")}`
        }
      });

    } catch (error) {
      console.error("Reset Wallet Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to reset wallet",
        error: error.message
      });
    }
  }
};

module.exports = walletController;