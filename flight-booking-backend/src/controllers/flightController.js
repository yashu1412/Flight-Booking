// controllers/flightController.js

const Flight = require("../models/Flight");
const BookingAttempt = require("../models/BookingAttempt");

const flightController = {
  // ==========================================
  // GET ALL FLIGHTS (Returns 10 flights)
  // GET /api/flights
  // ==========================================
  getAllFlights: async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const flights = await Flight.findAll(parseInt(limit));

      return res.status(200).json({
        success: true,
        message: "Flights fetched successfully",
        data: {
          flights,
          count: flights.length
        }
      });

    } catch (error) {
      console.error("Get All Flights Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch flights",
        error: error.message
      });
    }
  },

  // ==========================================
  // SEARCH FLIGHTS BY ROUTE
  // GET /api/flights/search?departure_city=Mumbai&arrival_city=Delhi
  // ==========================================
  searchFlights: async (req, res) => {
    try {
      const {
        departure_city,
        arrival_city,
        min_price,
        max_price,
        airline,
        sort_by = "base_price",
        sort_order = "ASC",
        limit = 10
      } = req.query;

      const flights = await Flight.searchWithFilters({
        departure_city,
        arrival_city,
        min_price: min_price ? parseFloat(min_price) : null,
        max_price: max_price ? parseFloat(max_price) : null,
        airline,
        sort_by,
        sort_order,
        limit: parseInt(limit)
      });

      // If user is authenticated, add surge pricing info
      let flightsWithPricing = flights;
      if (req.user) {
        flightsWithPricing = await Promise.all(
          flights.map(async (flight) => {
            const priceInfo = await BookingAttempt.getPriceInfo(
              req.user.id,
              flight.id,
              flight.base_price
            );
            return {
              ...flight,
              current_price: priceInfo.currentPrice,
              surge_applied: priceInfo.surgeApplied,
              surge_percentage: priceInfo.surgePercentage
            };
          })
        );
      }

      return res.status(200).json({
        success: true,
        message: flights.length > 0 
          ? "Flights found" 
          : "No flights found for the given criteria",
        data: {
          flights: flightsWithPricing,
          count: flightsWithPricing.length,
          filters: {
            departure_city,
            arrival_city,
            min_price,
            max_price,
            airline
          }
        }
      });

    } catch (error) {
      console.error("Search Flights Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to search flights",
        error: error.message
      });
    }
  },

  // ==========================================
  // GET SINGLE FLIGHT BY ID
  // GET /api/flights/:id
  // ==========================================
  getFlightById: async (req, res) => {
    try {
      const { id } = req.params;

      const flight = await Flight.findById(id);
      if (!flight) {
        return res.status(404).json({
          success: false,
          message: "Flight not found"
        });
      }

      // Add pricing info if user is authenticated
      let priceInfo = null;
      if (req.user) {
        priceInfo = await BookingAttempt.getPriceInfo(
          req.user.id,
          flight.id,
          flight.base_price
        );
      }

      return res.status(200).json({
        success: true,
        data: {
          flight: {
            ...flight,
            current_price: priceInfo?.currentPrice || flight.base_price,
            surge_applied: priceInfo?.surgeApplied || false,
            surge_percentage: priceInfo?.surgePercentage || 0,
            remaining_attempts: priceInfo?.remainingAttempts || 3
          }
        }
      });

    } catch (error) {
      console.error("Get Flight By ID Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch flight",
        error: error.message
      });
    }
  },

  // ==========================================
  // GET FLIGHT WITH DYNAMIC PRICING
  // GET /api/flights/:id/pricing
  // (Records booking attempt - use when user clicks "Book")
  // ==========================================
  getFlightWithPricing: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const flight = await Flight.findById(id);
      if (!flight) {
        return res.status(404).json({
          success: false,
          message: "Flight not found"
        });
      }

      // Calculate price (this records the booking attempt)
      const priceInfo = await BookingAttempt.calculatePrice(
        userId,
        flight.id,
        flight.base_price
      );

      return res.status(200).json({
        success: true,
        message: priceInfo.surgeApplied 
          ? "Surge pricing applied due to high demand" 
          : "Standard pricing",
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
            attempt_count: priceInfo.attemptCount,
            reset_time: priceInfo.resetTime
          }
        }
      });

    } catch (error) {
      console.error("Get Flight With Pricing Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch flight pricing",
        error: error.message
      });
    }
  },

  // ==========================================
  // GET DISTINCT CITIES (For dropdowns)
  // GET /api/flights/cities
  // ==========================================
  getCities: async (req, res) => {
    try {
      const cities = await Flight.getDistinctCities();

      return res.status(200).json({
        success: true,
        data: { cities }
      });

    } catch (error) {
      console.error("Get Cities Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch cities",
        error: error.message
      });
    }
  },

  // ==========================================
  // GET DISTINCT AIRLINES (For filters)
  // GET /api/flights/airlines
  // ==========================================
  getAirlines: async (req, res) => {
    try {
      const airlines = await Flight.getDistinctAirlines();

      return res.status(200).json({
        success: true,
        data: { airlines }
      });

    } catch (error) {
      console.error("Get Airlines Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch airlines",
        error: error.message
      });
    }
  },

  // ==========================================
  // CREATE NEW FLIGHT (Admin Only)
  // POST /api/flights
  // ==========================================
  createFlight: async (req, res) => {
    try {
      const {
        flight_id,
        airline,
        departure_city,
        arrival_city,
        base_price,
        departure_time,
        arrival_time,
        available_seats
      } = req.body;

      // Validation
      if (!flight_id || !airline || !departure_city || !arrival_city || !base_price) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields"
        });
      }

      // Validate price range
      if (base_price < 2000 || base_price > 3000) {
        return res.status(400).json({
          success: false,
          message: "Base price must be between ₹2000 and ₹3000"
        });
      }

      // Check if flight_id already exists
      const existingFlight = await Flight.findByFlightId(flight_id);
      if (existingFlight) {
        return res.status(409).json({
          success: false,
          message: "Flight ID already exists"
        });
      }

      const newFlight = await Flight.create({
        flight_id,
        airline,
        departure_city,
        arrival_city,
        base_price,
        departure_time,
        arrival_time,
        available_seats
      });

      return res.status(201).json({
        success: true,
        message: "Flight created successfully",
        data: { flight: newFlight }
      });

    } catch (error) {
      console.error("Create Flight Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create flight",
        error: error.message
      });
    }
  },

  // ==========================================
  // UPDATE FLIGHT (Admin Only)
  // PUT /api/flights/:id
  // ==========================================
  updateFlight: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate price range if provided
      if (updateData.base_price && 
          (updateData.base_price < 2000 || updateData.base_price > 3000)) {
        return res.status(400).json({
          success: false,
          message: "Base price must be between ₹2000 and ₹3000"
        });
      }

      const updatedFlight = await Flight.update(id, updateData);
      if (!updatedFlight) {
        return res.status(404).json({
          success: false,
          message: "Flight not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Flight updated successfully",
        data: { flight: updatedFlight }
      });

    } catch (error) {
      console.error("Update Flight Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update flight",
        error: error.message
      });
    }
  },

  // ==========================================
  // DELETE FLIGHT (Admin Only)
  // DELETE /api/flights/:id
  // ==========================================
  deleteFlight: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedFlight = await Flight.softDelete(id);
      if (!deletedFlight) {
        return res.status(404).json({
          success: false,
          message: "Flight not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Flight deleted successfully"
      });

    } catch (error) {
      console.error("Delete Flight Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete flight",
        error: error.message
      });
    }
  }
};

module.exports = flightController;