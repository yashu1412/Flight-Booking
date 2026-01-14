// services/flightService.js

const Flight = require("../models/Flight");
const pricingService = require("./pricingService");

const flightService = {
  // Get all flights (limit 10)
  getAllFlights: async (limit = 10) => {
    return await Flight.findAll(limit);
  },

  // Get flight by ID
  getFlightById: async (flightId) => {
    const flight = await Flight.findById(flightId);
    if (!flight) {
      throw new Error("Flight not found");
    }
    return flight;
  },

  // Search flights with filters
  searchFlights: async (filters) => {
    const {
      departure_city,
      arrival_city,
      min_price,
      max_price,
      airline,
      sort_by = "base_price",
      sort_order = "ASC",
      limit = 10
    } = filters;

    return await Flight.searchWithFilters({
      departure_city,
      arrival_city,
      min_price,
      max_price,
      airline,
      sort_by,
      sort_order,
      limit
    });
  },

  // Search with dynamic pricing for authenticated user
  searchWithPricing: async (filters, userId) => {
    const flights = await flightService.searchFlights(filters);

    if (!userId) return flights;

    // Add pricing info for each flight
    const flightsWithPricing = await Promise.all(
      flights.map(async (flight) => {
        const priceInfo = await pricingService.getPriceInfo(
          userId,
          flight.id,
          flight.base_price
        );
        return {
          ...flight,
          current_price: priceInfo.currentPrice,
          surge_applied: priceInfo.surgeApplied,
          surge_percentage: priceInfo.surgePercentage,
          remaining_attempts: priceInfo.remainingAttempts
        };
      })
    );

    return flightsWithPricing;
  },

  // Get flight with dynamic pricing (records attempt)
  getFlightWithPricing: async (flightId, userId) => {
    const flight = await Flight.findById(flightId);
    if (!flight) {
      throw new Error("Flight not found");
    }

    // Calculate price (records booking attempt)
    const priceInfo = await pricingService.calculatePrice(
      userId,
      flight.id,
      flight.base_price
    );

    return {
      flight,
      pricing: priceInfo
    };
  },

  // Get distinct cities for dropdown
  getCities: async () => {
    return await Flight.getDistinctCities();
  },

  // Get distinct airlines for filter
  getAirlines: async () => {
    return await Flight.getDistinctAirlines();
  },

  // Create flight (admin)
  createFlight: async (flightData) => {
    // Check if flight_id exists
    const existing = await Flight.findByFlightId(flightData.flight_id);
    if (existing) {
      throw new Error("Flight ID already exists");
    }

    // Validate price range
    if (flightData.base_price < 2000 || flightData.base_price > 3000) {
      throw new Error("Price must be between ₹2000 and ₹3000");
    }

    return await Flight.create(flightData);
  },

  // Update flight (admin)
  updateFlight: async (flightId, updateData) => {
    if (updateData.base_price) {
      if (updateData.base_price < 2000 || updateData.base_price > 3000) {
        throw new Error("Price must be between ₹2000 and ₹3000");
      }
    }

    const updated = await Flight.update(flightId, updateData);
    if (!updated) {
      throw new Error("Flight not found");
    }
    return updated;
  },

  // Delete flight (admin)
  deleteFlight: async (flightId) => {
    const deleted = await Flight.softDelete(flightId);
    if (!deleted) {
      throw new Error("Flight not found");
    }
    return deleted;
  },

  // Check seat availability
  checkAvailability: async (flightId, seats = 1) => {
    const flight = await Flight.findById(flightId);
    if (!flight) {
      throw new Error("Flight not found");
    }
    return flight.available_seats >= seats;
  },

  // Decrement seats after booking
  decrementSeats: async (flightId, count = 1) => {
    return await Flight.decrementSeats(flightId, count);
  }
};

module.exports = flightService;