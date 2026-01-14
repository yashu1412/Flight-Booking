// services/bookingService.js

const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const User = require("../models/User");
const pricingService = require("./pricingService");
const walletService = require("./walletService");
const pdfService = require("./pdfService");

const bookingService = {
  // Initiate booking (check price & wallet)
  initiateBooking: async (userId, flightId) => {
    // Get flight
    const flight = await Flight.findById(flightId);
    if (!flight) {
      throw new Error("Flight not found");
    }

    // Check seat availability
    if (flight.available_seats <= 0) {
      throw new Error("No seats available");
    }

    // Calculate price with surge (records attempt)
    const priceInfo = await pricingService.calculatePrice(
      userId,
      flightId,
      flight.base_price
    );

    // Get wallet balance
    const walletInfo = await walletService.getBalance(userId);
    const canAfford = walletInfo.balance >= priceInfo.currentPrice;

    return {
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
      pricing: priceInfo,
      wallet: {
        balance: walletInfo.balance,
        canAfford,
        shortfall: canAfford ? 0 : priceInfo.currentPrice - walletInfo.balance
      }
    };
  },

  // Confirm booking
  confirmBooking: async (userId, bookingData) => {
    const { flight_id, passenger_name, passenger_email, passenger_phone } = bookingData;

    // Get flight
    const flight = await Flight.findById(flight_id);
    if (!flight) {
      throw new Error("Flight not found");
    }

    // Check seats
    if (flight.available_seats <= 0) {
      throw new Error("No seats available");
    }

    // Get current price (without recording new attempt)
    const priceInfo = await pricingService.getPriceInfo(
      userId,
      flight_id,
      flight.base_price
    );

    const finalPrice = priceInfo.currentPrice;

    // Check wallet balance
    const walletCheck = await walletService.checkSufficientBalance(userId, finalPrice);
    if (!walletCheck.isSufficient) {
      throw new Error(`Insufficient balance. Required: ₹${finalPrice}, Available: ₹${walletCheck.balance}`);
    }

    // Deduct from wallet
    const walletResult = await walletService.deduct(userId, finalPrice);

    // Decrement seats
    await Flight.decrementSeats(flight_id, 1);

    // Create booking
    const booking = await Booking.create({
      user_id: userId,
      flight_id,
      passenger_name,
      passenger_email,
      passenger_phone,
      final_price: finalPrice,
      surge_applied: priceInfo.surgeApplied,
      surge_percentage: priceInfo.surgePercentage
    });

    // Get full booking with flight details
    const fullBooking = await Booking.findByPNR(booking.pnr);

    return {
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
        previousBalance: walletResult.previousBalance,
        deducted: walletResult.deductedAmount,
        newBalance: walletResult.newBalance
      }
    };
  },

  // Get booking by PNR
  getBookingByPNR: async (pnr, userId) => {
    const booking = await Booking.findByPNRAndUser(pnr, userId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    return booking;
  },

  // Get user's booking history
  getBookingHistory: async (userId, pagination = {}) => {
    const { page = 1, limit = 10 } = pagination;
    return await Booking.findByUserId(userId, { page, limit });
  },

  // Cancel booking
  cancelBooking: async (pnr, userId) => {
    // Get booking
    const booking = await Booking.findByPNRAndUser(pnr, userId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "CANCELLED") {
      throw new Error("Booking already cancelled");
    }

    // Cancel booking
    await Booking.cancel(booking.id, userId);

    // Refund to wallet
    const refundResult = await walletService.credit(
      userId,
      booking.final_price,
      `Refund for PNR: ${pnr}`
    );

    return {
      pnr: booking.pnr,
      refundAmount: booking.final_price,
      wallet: {
        previousBalance: refundResult.previousBalance,
        refunded: refundResult.creditedAmount,
        newBalance: refundResult.newBalance
      }
    };
  },

  // Generate ticket PDF
  generateTicketPDF: async (pnr, userId) => {
    const booking = await Booking.findByPNRAndUser(pnr, userId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const pdfBuffer = await pdfService.generateTicketPDF({
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

    return pdfBuffer;
  },

  // Get all bookings (admin)
  getAllBookings: async (filters = {}) => {
    return await Booking.findAll(filters);
  },

  // Get booking statistics (admin)
  getStatistics: async () => {
    return await Booking.getStatistics();
  }
};

module.exports = bookingService;