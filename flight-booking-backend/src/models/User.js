// models/User.js

const pool = require("../config/database");
const bcrypt = require("bcryptjs");

// Default wallet balance for new users
const DEFAULT_WALLET_BALANCE = 50000.00;

// Create Users Table if not exists
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      wallet_balance DECIMAL(10, 2) DEFAULT 50000.00,
      role VARCHAR(20) NOT NULL DEFAULT 'customer',
      is_verified BOOLEAN DEFAULT FALSE,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL
    );
  `;
  await pool.query(query);

  // Create index for faster email lookup
  const indexQuery = `
    CREATE INDEX IF NOT EXISTS idx_users_email 
    ON users(email);
  `;
  await pool.query(indexQuery);

  console.log("✅ Users table created");
};

// Export initializer to be called on startup if needed
const init = async () => {
  await createUsersTable();
};

const User = {
  // Get default wallet balance
  getDefaultWalletBalance: () => DEFAULT_WALLET_BALANCE,

  // Create a new user
  create: async ({
    first_name,
    last_name,
    email,
    password,
    phone = null,
    role = "customer"
  }) => {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (
        first_name, last_name, email, password, phone, 
        wallet_balance, role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id, first_name, last_name, email, phone, 
        wallet_balance, role, created_at;
    `;
    const values = [
      first_name,
      last_name,
      email.toLowerCase().trim(),
      hashedPassword,
      phone,
      DEFAULT_WALLET_BALANCE,
      role
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const query = `
      SELECT 
        id, first_name, last_name, email, phone,
        wallet_balance, role, is_verified, last_login,
        created_at, updated_at
      FROM users 
      WHERE id = $1 AND deleted_at IS NULL;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Find user by ID (include password for auth)
  findByIdWithPassword: async (id) => {
    const query = `
      SELECT * FROM users 
      WHERE id = $1 AND deleted_at IS NULL;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Find user by email
  findByEmail: async (email) => {
    const query = `
      SELECT * FROM users 
      WHERE email = $1 AND deleted_at IS NULL;
    `;
    const result = await pool.query(query, [email.toLowerCase().trim()]);
    return result.rows[0];
  },

  // Find user by email (without password)
  findByEmailSafe: async (email) => {
    const query = `
      SELECT 
        id, first_name, last_name, email, phone,
        wallet_balance, role, is_verified, last_login,
        created_at, updated_at
      FROM users 
      WHERE email = $1 AND deleted_at IS NULL;
    `;
    const result = await pool.query(query, [email.toLowerCase().trim()]);
    return result.rows[0];
  },

  // Check if email exists
  emailExists: async (email) => {
    const query = `
      SELECT id FROM users 
      WHERE email = $1 AND deleted_at IS NULL;
    `;
    const result = await pool.query(query, [email.toLowerCase().trim()]);
    return result.rows.length > 0;
  },

  // Get all users (admin function)
  findAll: async ({ page = 1, limit = 10, role, includeDeleted = false } = {}) => {
    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        id, first_name, last_name, email, phone,
        wallet_balance, role, is_verified, last_login,
        created_at, updated_at
      FROM users
    `;
    const values = [];
    let paramCount = 0;
    const conditions = [];

    if (!includeDeleted) {
      conditions.push("deleted_at IS NULL");
    }

    if (role) {
      paramCount++;
      conditions.push(`role = $${paramCount}`);
      values.push(role);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY created_at DESC`;

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    values.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount};`;
    values.push(offset);

    const result = await pool.query(query, values);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM users`;
    const countConditions = [];
    const countValues = [];
    let countParamCount = 0;

    if (!includeDeleted) {
      countConditions.push("deleted_at IS NULL");
    }

    if (role) {
      countParamCount++;
      countConditions.push(`role = $${countParamCount}`);
      countValues.push(role);
    }

    if (countConditions.length > 0) {
      countQuery += ` WHERE ${countConditions.join(" AND ")}`;
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].total);

    return {
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Update user profile
  update: async (id, {
    first_name,
    last_name,
    email,
    phone
  }) => {
    const query = `
      UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        updated_at = NOW()
      WHERE id = $5 AND deleted_at IS NULL
      RETURNING 
        id, first_name, last_name, email, phone,
        wallet_balance, role, is_verified, created_at, updated_at;
    `;
    const values = [
      first_name,
      last_name,
      email ? email.toLowerCase().trim() : null,
      phone,
      id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Update password
  updatePassword: async (id, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const query = `
      UPDATE users SET
        password = $1,
        updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id;
    `;
    const result = await pool.query(query, [hashedPassword, id]);
    return result.rows[0];
  },

  // Change user role (admin function)
  changeRole: async (id, newRole) => {
    const validRoles = ["admin", "customer"];
    if (!validRoles.includes(newRole)) {
      throw new Error("Invalid role. Must be 'admin' or 'customer'");
    }

    const query = `
      UPDATE users SET
        role = $1,
        updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING 
        id, first_name, last_name, email, role, updated_at;
    `;
    const result = await pool.query(query, [newRole, id]);
    return result.rows[0];
  },

  // Validate password
  validatePassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // Update last login timestamp
  updateLastLogin: async (id) => {
    const query = `
      UPDATE users SET
        last_login = NOW(),
        updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING last_login;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Verify user email
  verifyEmail: async (id) => {
    const query = `
      UPDATE users SET
        is_verified = TRUE,
        updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, is_verified;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get wallet balance
  getWalletBalance: async (id) => {
    const query = `
      SELECT wallet_balance FROM users 
      WHERE id = $1 AND deleted_at IS NULL;
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return parseFloat(result.rows[0].wallet_balance);
  },

  // Update wallet balance (internal use)
  updateWalletBalance: async (id, newBalance) => {
    const query = `
      UPDATE users SET
        wallet_balance = $1,
        updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING wallet_balance;
    `;
    const result = await pool.query(query, [newBalance, id]);
    return parseFloat(result.rows[0]?.wallet_balance);
  },

  // Deduct from wallet
  deductFromWallet: async (id, amount) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get current balance with row lock
      const balanceQuery = `
        SELECT wallet_balance FROM users 
        WHERE id = $1 AND deleted_at IS NULL
        FOR UPDATE;
      `;
      const balanceResult = await client.query(balanceQuery, [id]);

      if (balanceResult.rows.length === 0) {
        throw new Error("User not found");
      }

      const currentBalance = parseFloat(balanceResult.rows[0].wallet_balance);
      const deductAmount = parseFloat(amount);

      if (currentBalance < deductAmount) {
        throw new Error("Insufficient wallet balance");
      }

      const newBalance = currentBalance - deductAmount;

      // Update balance
      const updateQuery = `
        UPDATE users SET
          wallet_balance = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING wallet_balance;
      `;
      const updateResult = await client.query(updateQuery, [newBalance, id]);

      await client.query("COMMIT");

      return {
        previousBalance: currentBalance,
        deductedAmount: deductAmount,
        newBalance: parseFloat(updateResult.rows[0].wallet_balance)
      };

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Add to wallet (refund)
  addToWallet: async (id, amount) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get current balance
      const balanceQuery = `
        SELECT wallet_balance FROM users 
        WHERE id = $1 AND deleted_at IS NULL
        FOR UPDATE;
      `;
      const balanceResult = await client.query(balanceQuery, [id]);

      if (balanceResult.rows.length === 0) {
        throw new Error("User not found");
      }

      const currentBalance = parseFloat(balanceResult.rows[0].wallet_balance);
      const addAmount = parseFloat(amount);
      const newBalance = currentBalance + addAmount;

      // Update balance
      const updateQuery = `
        UPDATE users SET
          wallet_balance = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING wallet_balance;
      `;
      const updateResult = await client.query(updateQuery, [newBalance, id]);

      await client.query("COMMIT");

      return {
        previousBalance: currentBalance,
        addedAmount: addAmount,
        newBalance: parseFloat(updateResult.rows[0].wallet_balance)
      };

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Reset wallet to default balance
  resetWallet: async (id) => {
    const query = `
      UPDATE users SET
        wallet_balance = $1,
        updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING wallet_balance;
    `;
    const result = await pool.query(query, [DEFAULT_WALLET_BALANCE, id]);
    return parseFloat(result.rows[0]?.wallet_balance);
  },

  // Soft delete user
  softDelete: async (id) => {
    const query = `
      UPDATE users SET
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, deleted_at;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Restore soft deleted user
  restore: async (id) => {
    const query = `
      UPDATE users SET
        deleted_at = NULL,
        updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NOT NULL
      RETURNING id, first_name, last_name, email;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Permanent delete (admin only)
  hardDelete: async (id) => {
    const query = `
      DELETE FROM users 
      WHERE id = $1 
      RETURNING id;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Count total users
  count: async ({ role, includeDeleted = false } = {}) => {
    let query = `SELECT COUNT(*) as total FROM users`;
    const conditions = [];
    const values = [];
    let paramCount = 0;

    if (!includeDeleted) {
      conditions.push("deleted_at IS NULL");
    }

    if (role) {
      paramCount++;
      conditions.push(`role = $${paramCount}`);
      values.push(role);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  },

  // Search users by name or email
  search: async (searchTerm, { page = 1, limit = 10 } = {}) => {
    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;

    const query = `
      SELECT 
        id, first_name, last_name, email, phone,
        wallet_balance, role, is_verified, created_at
      FROM users
      WHERE deleted_at IS NULL
        AND (
          LOWER(first_name) LIKE LOWER($1)
          OR LOWER(last_name) LIKE LOWER($1)
          OR LOWER(email) LIKE LOWER($1)
        )
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const result = await pool.query(query, [searchPattern, limit, offset]);
    return result.rows;
  },

  // Get user statistics (admin dashboard)
  getStatistics: async () => {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as total_customers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
        COALESCE(SUM(wallet_balance), 0) as total_wallet_balance,
        COALESCE(AVG(wallet_balance), 0) as avg_wallet_balance
      FROM users
      WHERE deleted_at IS NULL;
    `;
    const result = await pool.query(query);

    return {
      totalUsers: parseInt(result.rows[0].total_users),
      totalCustomers: parseInt(result.rows[0].total_customers),
      totalAdmins: parseInt(result.rows[0].total_admins),
      verifiedUsers: parseInt(result.rows[0].verified_users),
      totalWalletBalance: parseFloat(result.rows[0].total_wallet_balance),
      avgWalletBalance: parseFloat(result.rows[0].avg_wallet_balance).toFixed(2)
    };
  }
};

module.exports = User;
module.exports.init = init;
