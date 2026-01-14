// models/Booking.js

const pool = require("../config/database");
const crypto = require("crypto");

// Create Bookings Table if not exists
const createBookingsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pnr VARCHAR(10) UNIQUE NOT NULL,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
      passenger_name VARCHAR(100) NOT NULL,
      passenger_email VARCHAR(100),
      passenger_phone VARCHAR(20),
      final_price DECIMAL(10, 2) NOT NULL,
      surge_applied BOOLEAN DEFAULT FALSE,
      surge_percentage DECIMAL(5, 2) DEFAULT 0,
      booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'CONFIRMED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL
    );
  `;
  await pool.query(query);

  // Create indexes
  const indexQueries = [
    `CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_bookings_pnr ON bookings(pnr);`,
    `CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);`
  ];

  for (const indexQuery of indexQueries) {
    await pool.query(indexQuery);
  }

  console.log("✅ Bookings table created");
};

const init = async () => {
  await createBookingsTable();
};

const Booking = {
  // Generate unique 6-character PNR
  generatePNR: () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pnr = "";
    for (let i = 0; i < 6; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
  },

  // Generate unique PNR (with collision check)
  generateUniquePNR: async () => {
    let pnr;
    let exists = true;

    while (exists) {
      pnr = Booking.generatePNR();
      const query = `SELECT id FROM bookings WHERE pnr = $1;`;
      const result = await pool.query(query, [pnr]);
      exists = result.rows.length > 0;
    }

    return pnr;
  },

  // Create a new booking
  create: async ({
    user_id,
    flight_id,
    passenger_name,
    passenger_email,
    passenger_phone,
    final_price,
    surge_applied = false,
    surge_percentage = 0
  }) => {
    const pnr = await Booking.generateUniquePNR();

    const query = `
      INSERT INTO bookings (
        pnr, user_id, flight_id, passenger_name, passenger_email,
        passenger_phone, final_price, surge_applied, surge_percentage
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      pnr, user_id, flight_id, passenger_name, passenger_email,
      passenger_phone, final_price, surge_applied, surge_percentage
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Find booking by ID
  findById: async (id) => {
    const query = `
      SELECT 
        b.*,
        f.flight_id as flight_number,
        f.airline,
        f.departure_city,
        f.arrival_city,
        f.departure_time,
        f.arrival_time,
        f.base_price
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      WHERE b.id = $1 AND b.deleted_at IS NULL;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Find booking by PNR
  findByPNR: async (pnr) => {
    const query = `
      SELECT 
        b.*,
        f.flight_id as flight_number,
        f.airline,
        f.departure_city,
        f.arrival_city,
        f.departure_time,
        f.arrival_time,
        f.base_price
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      WHERE b.pnr = $1 AND b.deleted_at IS NULL;
    `;
    const result = await pool.query(query, [pnr.toUpperCase()]);
    return result.rows[0];
  },

  // Find booking by PNR for specific user
  findByPNRAndUser: async (pnr, user_id) => {
    const query = `
      SELECT 
        b.*,
        f.flight_id as flight_number,
        f.airline,
        f.departure_city,
        f.arrival_city,
        f.departure_time,
        f.arrival_time,
        f.base_price
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      WHERE b.pnr = $1 AND b.user_id = $2 AND b.deleted_at IS NULL;
    `;
    const result = await pool.query(query, [pnr.toUpperCase(), user_id]);
    return result.rows[0];
  },

  // Get all bookings for a user (booking history)
  findByUserId: async (user_id, { page = 1, limit = 10 } = {}) => {
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        b.*,
        f.flight_id as flight_number,
        f.airline,
        f.departure_city,
        f.arrival_city,
        f.departure_time,
        f.arrival_time,
        f.base_price
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      WHERE b.user_id = $1 AND b.deleted_at IS NULL
      ORDER BY b.booking_date DESC
      LIMIT $2 OFFSET $3;
    `;
    const result = await pool.query(query, [user_id, limit, offset]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total FROM bookings 
      WHERE user_id = $1 AND deleted_at IS NULL;
    `;
    const countResult = await pool.query(countQuery, [user_id]);
    const total = parseInt(countResult.rows[0].total);

    return {
      bookings: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Get all bookings (admin)
  findAll: async ({ page = 1, limit = 10, status } = {}) => {
    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        b.*,
        f.flight_id as flight_number,
        f.airline,
        f.departure_city,
        f.arrival_city,
        u.first_name,
        u.last_name,
        u.email as user_email
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      JOIN users u ON b.user_id = u.id
      WHERE b.deleted_at IS NULL
    `;
    const values = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND b.status = $${paramCount}`;
      values.push(status);
    }

    query += ` ORDER BY b.booking_date DESC`;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    values.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount};`;
    values.push(offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Update booking status
  updateStatus: async (id, status) => {
    const validStatuses = ["CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid booking status");
    }

    const query = `
      UPDATE bookings SET
        status = $1,
        updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *;
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  },

  // Cancel booking
  cancel: async (id, user_id) => {
    const query = `
      UPDATE bookings SET
        status = 'CANCELLED',
        updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
      RETURNING *;
    `;
    const result = await pool.query(query, [id, user_id]);
    return result.rows[0];
  },

  // Soft delete booking
  softDelete: async (id) => {
    const query = `
      UPDATE bookings SET deleted_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Count user's total bookings
  countByUserId: async (user_id) => {
    const query = `
      SELECT COUNT(*) as total FROM bookings
      WHERE user_id = $1 AND deleted_at IS NULL;
    `;
    const result = await pool.query(query, [user_id]);
    return parseInt(result.rows[0].total);
  },

  // Get booking statistics (admin)
  getStatistics: async () => {
    const query = `
      SELECT 
        COUNT(*) as total_bookings,
        SUM(final_price) as total_revenue,
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_count,
        COUNT(CASE WHEN surge_applied = true THEN 1 END) as surge_bookings
      FROM bookings
      WHERE deleted_at IS NULL;
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
};

module.exports = Booking;
module.exports.init = init;
