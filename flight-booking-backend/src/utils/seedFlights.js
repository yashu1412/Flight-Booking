// utils/seedFlights.js

const pool = require("../config/database");
const { init: initUsers } = require("../models/User");
const { init: initFlights } = require("../models/Flight");
const { init: initBookings } = require("../models/Booking");
const { init: initAttempts } = require("../models/BookingAttempt");
const bcrypt = require("bcryptjs");
const constants = require("./constants");
const helpers = require("./helpers");

const seedDatabase = async () => {
  console.log("🌱 Starting database seeding...\n");

  try {
    // ==========================================
    // ENSURE REQUIRED EXTENSIONS AND TABLES
    // ==========================================
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    await initUsers();
    await initFlights();
    await initBookings();
    await initAttempts();

    // ==========================================
    // CLEAR EXISTING DATA
    // ==========================================
    console.log("🗑️  Clearing existing data...");
    await pool.query("DELETE FROM booking_attempts");
    await pool.query("DELETE FROM bookings");
    await pool.query("DELETE FROM flights");
    await pool.query("DELETE FROM users");
    console.log("✅ Existing data cleared\n");

    // ==========================================
    // SEED DEMO USER
    // ==========================================
    console.log("👤 Creating demo user...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const userResult = await pool.query(`
      INSERT INTO users (first_name, last_name, email, password, wallet_balance, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, first_name, last_name, email, wallet_balance, role
    `, ["Demo", "User", "demo@example.com", hashedPassword, 50000, "customer"]);

    console.log("✅ Demo user created:");
    console.log(`   Email: demo@example.com`);
    console.log(`   Password: password123`);
    console.log(`   Wallet: ₹50,000\n`);

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    await pool.query(`
      INSERT INTO users (first_name, last_name, email, password, wallet_balance, role)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, ["Admin", "User", "admin@example.com", adminPassword, 100000, "admin"]);

    console.log("✅ Admin user created:");
    console.log(`   Email: admin@example.com`);
    console.log(`   Password: admin123\n`);

    // ==========================================
    // SEED FLIGHTS (15 Flights)
    // ==========================================
    console.log("✈️  Seeding flights...\n");

    const flightsData = [
      { flight_id: "AI101", airline: "Air India", departure: "Mumbai", arrival: "Delhi" },
      { flight_id: "6E205", airline: "IndiGo", departure: "Delhi", arrival: "Bangalore" },
      { flight_id: "SG301", airline: "SpiceJet", departure: "Bangalore", arrival: "Chennai" },
      { flight_id: "UK401", airline: "Vistara", departure: "Chennai", arrival: "Kolkata" },
      { flight_id: "G8501", airline: "GoAir", departure: "Kolkata", arrival: "Hyderabad" },
      { flight_id: "I5601", airline: "AirAsia India", departure: "Hyderabad", arrival: "Mumbai" },
      { flight_id: "AI202", airline: "Air India", departure: "Mumbai", arrival: "Bangalore" },
      { flight_id: "6E306", airline: "IndiGo", departure: "Delhi", arrival: "Chennai" },
      { flight_id: "SG402", airline: "SpiceJet", departure: "Bangalore", arrival: "Kolkata" },
      { flight_id: "UK502", airline: "Vistara", departure: "Chennai", arrival: "Mumbai" },
      { flight_id: "G8602", airline: "GoAir", departure: "Kolkata", arrival: "Delhi" },
      { flight_id: "I5702", airline: "AirAsia India", departure: "Hyderabad", arrival: "Bangalore" },
      { flight_id: "AI303", airline: "Air India", departure: "Mumbai", arrival: "Kolkata" },
      { flight_id: "6E407", airline: "IndiGo", departure: "Delhi", arrival: "Hyderabad" },
      { flight_id: "SG503", airline: "SpiceJet", departure: "Bangalore", arrival: "Mumbai" }
    ];

    const seededFlights = [];

    for (const flight of flightsData) {
      const basePrice = helpers.generateRandomPrice();
      const departureTime = helpers.generateRandomTime();
      const arrivalTime = helpers.generateRandomTime();
      const availableSeats = helpers.randomInRange(50, 180);

      const result = await pool.query(`
        INSERT INTO flights (flight_id, airline, departure_city, arrival_city, base_price, departure_time, arrival_time, available_seats)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING flight_id, airline, departure_city, arrival_city, base_price
      `, [
        flight.flight_id,
        flight.airline,
        flight.departure,
        flight.arrival,
        basePrice,
        departureTime,
        arrivalTime,
        availableSeats
      ]);

      seededFlights.push(result.rows[0]);
    }

    // Display seeded flights
    console.log("✅ Flights seeded successfully!\n");
    console.log("┌────────────┬──────────────────┬─────────────────────────────────┬──────────┐");
    console.log("│ Flight ID  │ Airline          │ Route                           │ Price    │");
    console.log("├────────────┼──────────────────┼─────────────────────────────────┼──────────┤");

    seededFlights.forEach((flight) => {
      const flightId = flight.flight_id.padEnd(10);
      const airline = flight.airline.padEnd(16);
      const route = `${flight.departure_city} → ${flight.arrival_city}`.padEnd(31);
      const price = `₹${flight.base_price}`.padStart(8);
      console.log(`│ ${flightId} │ ${airline} │ ${route} │ ${price} │`);
    });

    console.log("└────────────┴──────────────────┴─────────────────────────────────┴──────────┘");

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log("\n" + "═".repeat(60));
    console.log("🎉 DATABASE SEEDING COMPLETED!");
    console.log("═".repeat(60));
    console.log(`
📊 Summary:
   • Users created: 2 (1 customer, 1 admin)
   • Flights seeded: ${seededFlights.length}
   • Price range: ₹2,000 - ₹3,000

🔐 Login Credentials:
   Customer: demo@example.com / password123
   Admin:    admin@example.com / admin123

💰 Wallet Balance: ₹50,000 (default)

🚀 Ready to start the server!
    `);

  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed. Exiting...");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
