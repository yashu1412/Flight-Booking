// models/Flight.js

const pool = require("../config/database");

// Create Flights Table if not exists
const createFlightsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS flights (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      flight_id VARCHAR(20) UNIQUE NOT NULL,
      airline VARCHAR(100) NOT NULL,
      departure_city VARCHAR(100) NOT NULL,
      arrival_city VARCHAR(100) NOT NULL,
      base_price DECIMAL(10, 2) NOT NULL CHECK (base_price BETWEEN 2000 AND 3000),
      departure_time TIME NOT NULL,
      arrival_time TIME NOT NULL,
      available_seats INTEGER DEFAULT 180,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL
    );
  `;
  await pool.query(query);
  
  // Create index for faster search
  const indexQuery = `
    CREATE INDEX IF NOT EXISTS idx_flights_route 
    ON flights(departure_city, arrival_city);
  `;
  await pool.query(indexQuery);
  
  console.log("✅ Flights table created");
};

const init = async () => {
  await createFlightsTable();
};

const Flight = {
  // Create a new flight
  create: async ({
    flight_id,
    airline,
    departure_city,
    arrival_city,
    base_price,
    departure_time,
    arrival_time,
    available_seats = 180
  }) => {
    const query = `
      INSERT INTO flights (
        flight_id, airline, departure_city, arrival_city, 
        base_price, departure_time, arrival_time, available_seats
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      flight_id, airline, departure_city, arrival_city,
      base_price, departure_time, arrival_time, available_seats
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Find all active flights
  findAll: async (limit = 10) => {
    const query = `
      SELECT * FROM flights 
      WHERE deleted_at IS NULL AND status = 'active'
      ORDER BY created_at DESC
      LIMIT $1;
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  },

  // Find flight by UUID id
  findById: async (id) => {
    const query = `
      SELECT * FROM flights 
      WHERE id = $1 AND deleted_at IS NULL;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Find flight by flight_id (e.g., "AI101")
  findByFlightId: async (flight_id) => {
    const query = `
      SELECT * FROM flights 
      WHERE flight_id = $1 AND deleted_at IS NULL;
    `;
    const result = await pool.query(query, [flight_id]);
    return result.rows[0];
  },

  // Search flights by route (departure & arrival cities)
  searchByRoute: async (departure_city, arrival_city, limit = 10) => {
    let query = `
      SELECT * FROM flights 
      WHERE deleted_at IS NULL AND status = 'active'
    `;
    const values = [];
    let paramCount = 0;

    if (departure_city) {
      paramCount++;
      query += ` AND LOWER(departure_city) LIKE LOWER($${paramCount})`;
      values.push(`%${departure_city}%`);
    }

    if (arrival_city) {
      paramCount++;
      query += ` AND LOWER(arrival_city) LIKE LOWER($${paramCount})`;
      values.push(`%${arrival_city}%`);
    }

    paramCount++;
    query += ` ORDER BY base_price ASC LIMIT $${paramCount};`;
    values.push(limit);

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Search with filters and sorting
  searchWithFilters: async ({
    departure_city,
    arrival_city,
    min_price,
    max_price,
    airline,
    sort_by = 'base_price',
    sort_order = 'ASC',
    limit = 10
  }) => {
    let query = `
      SELECT * FROM flights 
      WHERE deleted_at IS NULL AND status = 'active'
    `;
    const values = [];
    let paramCount = 0;

    if (departure_city) {
      paramCount++;
      query += ` AND LOWER(departure_city) LIKE LOWER($${paramCount})`;
      values.push(`%${departure_city}%`);
    }

    if (arrival_city) {
      paramCount++;
      query += ` AND LOWER(arrival_city) LIKE LOWER($${paramCount})`;
      values.push(`%${arrival_city}%`);
    }

    if (min_price) {
      paramCount++;
      query += ` AND base_price >= $${paramCount}`;
      values.push(min_price);
    }

    if (max_price) {
      paramCount++;
      query += ` AND base_price <= $${paramCount}`;
      values.push(max_price);
    }

    if (airline) {
      paramCount++;
      query += ` AND LOWER(airline) LIKE LOWER($${paramCount})`;
      values.push(`%${airline}%`);
    }

    // Validate sort_by to prevent SQL injection
    const allowedSortFields = ['base_price', 'departure_time', 'airline', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sort_by) ? sort_by : 'base_price';
    const safeSortOrder = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    paramCount++;
    query += ` LIMIT $${paramCount};`;
    values.push(limit);

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Update flight details
  update: async (id, {
    airline,
    departure_city,
    arrival_city,
    base_price,
    departure_time,
    arrival_time,
    available_seats,
    status
  }) => {
    const query = `
      UPDATE flights SET
        airline = COALESCE($1, airline),
        departure_city = COALESCE($2, departure_city),
        arrival_city = COALESCE($3, arrival_city),
        base_price = COALESCE($4, base_price),
        departure_time = COALESCE($5, departure_time),
        arrival_time = COALESCE($6, arrival_time),
        available_seats = COALESCE($7, available_seats),
        status = COALESCE($8, status),
        updated_at = NOW()
      WHERE id = $9 AND deleted_at IS NULL
      RETURNING *;
    `;
    const values = [
      airline, departure_city, arrival_city, base_price,
      departure_time, arrival_time, available_seats, status, id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Decrease available seats after booking
  decrementSeats: async (id, count = 1) => {
    const query = `
      UPDATE flights SET
        available_seats = available_seats - $1,
        updated_at = NOW()
      WHERE id = $2 AND available_seats >= $1 AND deleted_at IS NULL
      RETURNING *;
    `;
    const result = await pool.query(query, [count, id]);
    return result.rows[0];
  },

  // Soft delete a flight
  softDelete: async (id) => {
    const query = `
      UPDATE flights SET deleted_at = NOW() 
      WHERE id = $1 
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get distinct cities for dropdown
  getDistinctCities: async () => {
    const query = `
      SELECT DISTINCT departure_city AS city FROM flights 
      WHERE deleted_at IS NULL
      UNION
      SELECT DISTINCT arrival_city AS city FROM flights 
      WHERE deleted_at IS NULL
      ORDER BY city;
    `;
    const run = async () => {
      const result = await pool.query(query);
      return result.rows.map(row => row.city);
    };
    try {
      return await run();
    } catch {
      await new Promise(r => setTimeout(r, 500));
      return await run();
    }
  },

  // Get distinct airlines for filter
  getDistinctAirlines: async () => {
    const query = `
      SELECT DISTINCT airline FROM flights 
      WHERE deleted_at IS NULL
      ORDER BY airline;
    `;
    const run = async () => {
      const result = await pool.query(query);
      return result.rows.map(row => row.airline);
    };
    try {
      return await run();
    } catch {
      await new Promise(r => setTimeout(r, 500));
      return await run();
    }
  },

  // Count total active flights
  countAll: async () => {
    const query = `
      SELECT COUNT(*) as total FROM flights 
      WHERE deleted_at IS NULL AND status = 'active';
    `;
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }
};

module.exports = Flight;
module.exports.init = init;
