// controllers/bookingController.js

const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const User = require("../models/User");
const BookingAttempt = require("../models/BookingAttempt");
const PDFService = require("../services/pdfService");

const bookingController = {
  // ==========================================
  // INITIATE BOOKING (Check price & wallet)
  // POST /api/bookings/initiate
  // ==========================================
  initiateBooking: async (req, res) => {
    try {
      const { flight_id } = req.body;
      const userId = req.user.id;

      // Validation
      if (!flight_id) {
        return res.status(400).json({
          success: false,
          message: "Flight ID is required"
        });
      }

      // Get flight
      const flight = await Flight.findById(flight_id);
      if (!flight) {
        return res.status(404).json({
          success: false,
          message: "Flight not found"
        });
      }

      // Check available seats
      if (flight.available_seats <= 0) {
        return res.status(400).json({
          success: false,
          message: "No seats available on this flight"
        });
      }

      // Calculate price with surge (records attempt)
      const priceInfo = await BookingAttempt.calculatePrice(
        userId,
        flight.id,
        flight.base_price
      );

      // Get wallet balance
      const walletBalance = await User.getWalletBalance(userId);

      // Check if user can afford
      const canAfford = walletBalance >= priceInfo.currentPrice;

      return res.status(200).json({
        success: true,
        message: priceInfo.surgeApplied 
          ? "⚠️ Surge pricing applied due to high demand"
          : "Booking initiated",
        data: {
          flight: {
            id: flight.id,
            flight_id: flight.flight_id,
            airline: flight.airline,
            departure_city: flight.departure_city,
            arrival_city: flight.arrival_city,
            departure_time: flight.departure_time,
            arrival_time: flight.arrival_time,
            available_seats: flight.available_seats
          },
          pricing: {
            base_price: priceInfo.basePrice,
            current_price: priceInfo.currentPrice,
            surge_applied: priceInfo.surgeApplied,
            surge_percentage: priceInfo.surgePercentage,
            reset_time: priceInfo.resetTime
          },
          wallet: {
            balance: walletBalance,
            can_afford: canAfford,
            shortfall: canAfford ? 0 : priceInfo.currentPrice - walletBalance
          }
        }
      });

    } catch (error) {
      console.error("Initiate Booking Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to initiate booking",
        error: error.message
      });
    }
  },

  // ==========================================
  // CONFIRM BOOKING (Deduct wallet & create booking)
  // POST /api/bookings/confirm
  // ==========================================
  confirmBooking: async (req, res) => {
    try {
      const {
        flight_id,
        passenger_name,
        passenger_email,
        passenger_phone
      } = req.body;
      const userId = req.user.id;

      // Validation
      if (!flight_id || !passenger_name) {
        return res.status(400).json({
          success: false,
          message: "Flight ID and passenger name are required"
        });
      }

      // Get flight
      const flight = await Flight.findById(flight_id);
      if (!flight) {
        return res.status(404).json({
          success: false,
          message: "Flight not found"
        });
      }

      // Check available seats
      if (flight.available_seats <= 0) {
        return res.status(400).json({
          success: false,
          message: "No seats available on this flight"
        });
      }

      // Get current price (without recording new attempt)
      const priceInfo = await BookingAttempt.getPriceInfo(
        userId,
        flight.id,
        flight.base_price
      );

      const finalPrice = priceInfo.currentPrice;

      // Check wallet balance
      const walletBalance = await User.getWalletBalance(userId);
      if (walletBalance < finalPrice) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance",
          data: {
            required: finalPrice,
            available: walletBalance,
            shortfall: finalPrice - walletBalance
          }
        });
      }

      // Deduct from wallet
      const walletResult = await User.deductFromWallet(userId, finalPrice);

      // Decrement available seats
      await Flight.decrementSeats(flight.id, 1);

      // Create booking
      const booking = await Booking.create({
        user_id: userId,
        flight_id: flight.id,
        passenger_name,
        passenger_email,
        passenger_phone,
        final_price: finalPrice,
        surge_applied: priceInfo.surgeApplied,
        surge_percentage: priceInfo.surgePercentage
      });

      // Get full booking details
      const fullBooking = await Booking.findByPNR(booking.pnr);

      return res.status(201).json({
        success: true,
        message: "🎉 Booking confirmed successfully!",
        data: {
          booking: {
            id: fullBooking.id,
            pnr: fullBooking.pnr,
            passenger_name: fullBooking.passenger_name,
            flight: {
              flight_id: fullBooking.flight_number,
              airline: fullBooking.airline,
              route: `${fullBooking.departure_city} → ${fullBooking.arrival_city}`,
              departure_time: fullBooking.departure_time,
              arrival_time: fullBooking.arrival_time
            },
            payment: {
              base_price: priceInfo.basePrice,
              final_price: fullBooking.final_price,
              surge_applied: fullBooking.surge_applied,
              surge_percentage: fullBooking.surge_percentage
            },
            booking_date: fullBooking.booking_date,
            status: fullBooking.status
          },
          wallet: {
            previous_balance: walletResult.previousBalance,
            deducted: walletResult.deductedAmount,
            new_balance: walletResult.newBalance
          }
        }
      });

    } catch (error) {
      console.error("Confirm Booking Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to confirm booking",
        error: error.message
      });
    }
  },

  // ==========================================
  // GET BOOKING HISTORY
  // GET /api/bookings/history
  // ==========================================
  getBookingHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await Booking.findByUserId(userId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      // Format bookings for response
      const formattedBookings = result.bookings.map(booking => ({
        id: booking.id,
        pnr: booking.pnr,
        passenger_name: booking.passenger_name,
        flight: {
          flight_id: booking.flight_number,
          airline: booking.airline,
          route: `${booking.departure_city} → ${booking.arrival_city}`,
          departure_time: booking.departure_time,
          arrival_time: booking.arrival_time
        },
        final_price: booking.final_price,
        surge_applied: booking.surge_applied,
        booking_date: booking.booking_date,
        status: booking.status
      }));

      return res.status(200).json({
        success: true,
        message: "Booking history fetched successfully",
        data: {
          bookings: formattedBookings,
          pagination: result.pagination
        }
      });

    } catch (error) {
      console.error("Get Booking History Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch booking history",
        error: error.message
      });
    }
  },

  // ==========================================
  // GET SINGLE BOOKING BY PNR
  // GET /api/bookings/:pnr
  // ==========================================
  getBookingByPNR: async (req, res) => {
    try {
      const { pnr } = req.params;
      const userId = req.user.id;

      const booking = await Booking.findByPNRAndUser(pnr, userId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          booking: {
            id: booking.id,
            pnr: booking.pnr,
            passenger_name: booking.passenger_name,
            passenger_email: booking.passenger_email,
            passenger_phone: booking.passenger_phone,
            flight: {
              flight_id: booking.flight_number,
              airline: booking.airline,
              departure_city: booking.departure_city,
              arrival_city: booking.arrival_city,
              departure_time: booking.departure_time,
              arrival_time: booking.arrival_time
            },
            final_price: booking.final_price,
            surge_applied: booking.surge_applied,
            surge_percentage: booking.surge_percentage,
            booking_date: booking.booking_date,
            status: booking.status
          }
        }
      });

    } catch (error) {
      console.error("Get Booking By PNR Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch booking",
        error: error.message
      });
    }
  },

  // ==========================================
  // DOWNLOAD TICKET PDF
  // GET /api/bookings/:pnr/ticket
  // ==========================================
  downloadTicket: async (req, res) => {
    try {
      const { pnr } = req.params;
      const userId = req.user.id;

      // Get booking
      const booking = await Booking.findByPNRAndUser(pnr, userId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        });
      }

      // Generate PDF
      const pdfBuffer = await PDFService.generateTicketPDF({
        pnr: booking.pnr,
        passenger_name: booking.passenger_name,
        airline: booking.airline,
        flight_id: booking.flight_number,
        departure_city: booking.departure_city,
        arrival_city: booking.arrival_city,
        departure_time: booking.departure_time,
        arrival_time: booking.arrival_time,
        final_price: booking.final_price,
        booking_date: booking.booking_date,
        status: booking.status
      });

      // Set response headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=ticket-${pnr}.pdf`
      );

      return res.send(pdfBuffer);

    } catch (error) {
      console.error("Download Ticket Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate ticket",
        error: error.message
      });
    }
  },

  // ==========================================
  // CANCEL BOOKING
  // PUT /api/bookings/:pnr/cancel
  // ==========================================
  cancelBooking: async (req, res) => {
    try {
      const { pnr } = req.params;
      const userId = req.user.id;

      // Get booking
      const booking = await Booking.findByPNRAndUser(pnr, userId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        });
      }

      // Check if already cancelled
      if (booking.status === "CANCELLED") {
        return res.status(400).json({
          success: false,
          message: "Booking is already cancelled"
        });
      }

      // Cancel booking
      await Booking.cancel(booking.id, userId);

      // Refund to wallet
      const refundAmount = booking.final_price;
      const walletResult = await User.addToWallet(userId, refundAmount);

      // Restore seat
      await Flight.update(booking.flight_id, {
        available_seats: booking.available_seats + 1
      });

      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully. Amount refunded to wallet.",
        data: {
          pnr: booking.pnr,
          refund_amount: refundAmount,
          wallet: {
            previous_balance: walletResult.previousBalance,
            refunded: walletResult.addedAmount,
            new_balance: walletResult.newBalance
          }
        }
      });

    } catch (error) {
      console.error("Cancel Booking Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to cancel booking",
        error: error.message
      });
    }
  },

  // ==========================================
  // GET ALL BOOKINGS (Admin Only)
  // GET /api/bookings/admin/all
  // ==========================================
  getAllBookings: async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const bookings = await Booking.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });

      return res.status(200).json({
        success: true,
        data: { bookings }
      });

    } catch (error) {
      console.error("Get All Bookings Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch bookings",
        error: error.message
      });
    }
  },

  // ==========================================
  // GET BOOKING STATISTICS (Admin Only)
  // GET /api/bookings/admin/stats
  // ==========================================
  getBookingStats: async (req, res) => {
    try {
      const stats = await Booking.getStatistics();

      return res.status(200).json({
        success: true,
        data: {
          statistics: {
            total_bookings: parseInt(stats.total_bookings),
            total_revenue: parseFloat(stats.total_revenue) || 0,
            confirmed_bookings: parseInt(stats.confirmed_count),
            cancelled_bookings: parseInt(stats.cancelled_count),
            surge_bookings: parseInt(stats.surge_bookings)
          }
        }
      });

    } catch (error) {
      console.error("Get Booking Stats Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch booking statistics",
        error: error.message
      });
    }
  }
};

module.exports = bookingController;