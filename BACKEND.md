# 🔧 Backend Architecture & API Documentation

## Backend Overview

**Framework**: Express.js (Node.js)
**Database**: PostgreSQL
**Authentication**: JWT + bcryptjs
**PDF Generation**: PDFKit
**Security**: Helmet.js, Rate Limiting

---

## 📁 Directory Structure

```
flight-booking-backend/
├── src/
│   ├── app.js                    # Express app initialization
│   ├── config/
│   │   ├── database.js           # PostgreSQL connection pool
│   │   └── environment.js        # Environment variables validation
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── bookingController.js  # Booking operations
│   │   ├── flightController.js   # Flight search & retrieval
│   │   └── walletController.js   # Wallet operations
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── adminMiddleware.js    # Admin role check
│   │   ├── errorHandler.js       # Error handling
│   │   ├── rateLimiter.js        # Rate limiting
│   │   └── validator.js          # Request validation
│   ├── models/
│   │   ├── User.js               # User schema & queries
│   │   ├── Flight.js             # Flight schema & queries
│   │   ├── Booking.js            # Booking schema & queries
│   │   └── BookingAttempt.js     # Booking attempt tracking
│   ├── services/
│   │   ├── authService.js        # Auth business logic
│   │   ├── bookingService.js     # Booking workflow
│   │   ├── flightService.js      # Flight operations
│   │   ├── walletService.js      # Wallet transactions
│   │   ├── pricingService.js     # Surge pricing engine
│   │   └── pdfService.js         # PDF generation
│   ├── routes/
│   │   ├── index.js              # Route aggregator
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── flightRoutes.js       # Flight endpoints
│   │   ├── bookingRoutes.js      # Booking endpoints
│   │   └── walletRoutes.js       # Wallet endpoints
│   ├── utils/
│   │   ├── constants.js          # App constants
│   │   ├── helpers.js            # Utility functions
│   │   ├── seedFlights.js        # Database seeding
│   │   ├── pnrGenerator.js       # PNR generation
│   │   └── responseHandler.js    # Response formatting
│   ├── validators/
│   │   ├── authValidator.js      # Auth validation schemas
│   │   ├── bookingValidator.js   # Booking validation
│   │   └── flightValidator.js    # Flight validation
│   └── package.json
```

---

## 🔐 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer',
  wallet_balance DECIMAL(10,2) DEFAULT 50000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Flights Table
```sql
CREATE TABLE flights (
  id SERIAL PRIMARY KEY,
  flight_id VARCHAR(20) UNIQUE NOT NULL,
  airline VARCHAR(100) NOT NULL,
  departure_city VARCHAR(100) NOT NULL,
  arrival_city VARCHAR(100) NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price BETWEEN 2000 AND 3000),
  available_seats INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departure_city ON flights(departure_city);
CREATE INDEX idx_arrival_city ON flights(arrival_city);
CREATE INDEX idx_route ON flights(departure_city, arrival_city);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  pnr VARCHAR(10) UNIQUE NOT NULL,
  user_id INT NOT NULL REFERENCES users(id),
  flight_id INT NOT NULL REFERENCES flights(id),
  passenger_name VARCHAR(100) NOT NULL,
  passenger_email VARCHAR(255),
  passenger_phone VARCHAR(20),
  base_price DECIMAL(10,2) NOT NULL,
  surge_percentage DECIMAL(5,2) DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL,
  surge_applied BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'CONFIRMED',
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_bookings ON bookings(user_id);
CREATE INDEX idx_pnr ON bookings(pnr);
```

### Booking Attempts Table
```sql
CREATE TABLE booking_attempts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  flight_id INT NOT NULL REFERENCES flights(id),
  attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attempt_user_flight ON booking_attempts(user_id, flight_id);
CREATE INDEX idx_attempt_time ON booking_attempts(attempt_time);
```

---

## 🔌 API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "9876543210"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "wallet_balance": 50000
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "demo@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "demo@example.com",
    "wallet_balance": 50000
  }
}
```

### Flight Endpoints

#### Search Flights
```http
GET /api/flights/search?from=Mumbai&to=Delhi&sort=price
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "count": 3,
  "flights": [
    {
      "id": 1,
      "flight_id": "AI101",
      "airline": "Air India",
      "departure_city": "Mumbai",
      "arrival_city": "Delhi",
      "departure_time": "06:30",
      "arrival_time": "08:15",
      "base_price": 2500,
      "available_seats": 45
    }
  ]
}
```

#### Get Flight Details
```http
GET /api/flights/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "flight": { /* flight object */ }
}
```

#### Get Price Info (with surge check)
```http
GET /api/flights/:id/price
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "base_price": 2500,
  "surge_applied": true,
  "surge_percentage": 10,
  "final_price": 2750,
  "surge_status": {
    "surge_active": true,
    "attempts_count": 3,
    "reset_time": "2024-01-15T14:25:30Z",
    "countdown_seconds": 125
  }
}
```

### Booking Endpoints

#### Create Booking (Initial)
```http
POST /api/bookings/initiate
Content-Type: application/json
Authorization: Bearer <token>

{
  "flight_id": 1,
  "passenger_name": "John Doe",
  "passenger_email": "john@example.com",
  "passenger_phone": "9876543210"
}

Response (200):
{
  "success": true,
  "message": "Booking initiated",
  "booking_estimate": {
    "flight_id": 1,
    "base_price": 2500,
    "surge_percentage": 0,
    "final_price": 2500,
    "user_balance": 50000,
    "sufficient_balance": true
  }
}
```

#### Confirm Booking
```http
POST /api/bookings/confirm
Content-Type: application/json
Authorization: Bearer <token>

{
  "flight_id": 1,
  "passenger_name": "John Doe",
  "passenger_email": "john@example.com",
  "passenger_phone": "9876543210"
}

Response (201):
{
  "success": true,
  "message": "Booking confirmed",
  "booking": {
    "pnr": "ABC123",
    "flight": { /* flight object */ },
    "passenger_name": "John Doe",
    "base_price": 2500,
    "surge_percentage": 0,
    "final_price": 2500,
    "status": "CONFIRMED",
    "booking_date": "2024-01-15T12:00:00Z"
  }
}
```

#### Get Booking History
```http
GET /api/bookings/history?page=1&limit=10
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "total": 5,
  "page": 1,
  "bookings": [
    {
      "id": 1,
      "pnr": "ABC123",
      "flight": { /* flight object */ },
      "passenger_name": "John Doe",
      "base_price": 2500,
      "surge_percentage": 0,
      "final_price": 2500,
      "status": "CONFIRMED",
      "booking_date": "2024-01-15T12:00:00Z"
    }
  ]
}
```

#### Cancel Booking
```http
POST /api/bookings/:pnr/cancel
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Booking cancelled and refund processed",
  "refund_amount": 2500
}
```

#### Download Ticket PDF
```http
GET /api/bookings/:pnr/ticket
Authorization: Bearer <token>

Response: PDF file (application/pdf)
```

### Wallet Endpoints

#### Get Wallet Balance
```http
GET /api/wallet/balance
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "balance": 47500,
  "currency": "INR"
}
```

#### Add Funds
```http
POST /api/wallet/add-funds
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 5000
}

Response (200):
{
  "success": true,
  "message": "Funds added successfully",
  "new_balance": 52500
}
```

#### Get Transaction History
```http
GET /api/wallet/transactions?limit=10
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "transactions": [
    {
      "type": "DEBIT",
      "amount": 2500,
      "reason": "Flight Booking - AI101",
      "date": "2024-01-15T12:00:00Z"
    }
  ]
}
```

---

## 🏗️ Core Services

### 1. Pricing Service (Surge Engine)
**File**: `src/services/pricingService.js`

```javascript
// Configuration
ATTEMPT_THRESHOLD = 3        // Attempts to trigger surge
SURGE_WINDOW_MINUTES = 5     // Window to count attempts
RESET_WINDOW_MINUTES = 10    // Window to reset surge
SURGE_PERCENTAGE = 10        // Price increase %

// Methods
calculatePrice(userId, flightId, basePrice)
  // Records attempt, applies surge if threshold met
  
getPriceInfo(userId, flightId, basePrice)
  // Gets price WITHOUT recording attempt (for display)

checkSurgeStatus(userId, flightId)
  // Returns surge status, countdown, attempts
```

### 2. Booking Service
**File**: `src/services/bookingService.js`

```javascript
// Main workflow
initiateBooking(userId, flightId, passengerData)
  // Check flight exists and has seats
  // Calculate final price with surge
  // Check wallet balance
  // Return booking estimate

confirmBooking(userId, flightId, passengerData)
  // Deduct wallet balance
  // Decrement available seats
  // Generate PNR
  // Create booking record
  // Generate PDF

cancelBooking(pnr)
  // Mark as CANCELLED
  // Refund wallet
  // Increment available seats
```

### 3. PDF Service
**File**: `src/services/pdfService.js`

```javascript
generateTicket(bookingData)
  // Create professional PDF with:
  // - PNR (large, red, prominent)
  // - Passenger name
  // - Airline & Flight ID
  // - Route (From → To)
  // - Times (Departure/Arrival)
  // - Final price
  // - Booking date
  // - Status (CONFIRMED/CANCELLED)
  // - Additional notices
```

### 4. Wallet Service
**File**: `src/services/walletService.js`

```javascript
getBalance(userId)
  // Get current balance

checkSufficientBalance(userId, amount)
  // Verify balance >= amount

deduct(userId, amount, reason)
  // Remove amount, log transaction

credit(userId, amount, reason)
  // Add amount, log transaction

reset(userId)
  // Reset to ₹50,000 (testing)
```

---

## 🔐 Security Features

### 1. Authentication
- JWT tokens with 7-day expiry
- Password hashing with bcryptjs (10 salt rounds)
- Token verification middleware on protected routes

### 2. Rate Limiting
- 100 requests per 15 minutes per IP
- Applied to auth endpoints (200/15min)
- Returns 429 Too Many Requests when exceeded

### 3. Security Headers
- Helmet.js enabled for:
  - Content Security Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security

### 4. Input Validation
- Request validation middleware
- Sanitization of email, phone inputs
- Type checking for numeric fields

### 5. Database Security
- Parameterized queries (no SQL injection)
- Connection pooling with timeout
- Indexes on frequently queried columns

---

## ⚙️ Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/flight_booking

# Server
NODE_ENV=development
PORT=5000

# Authentication
JWT_SECRET=your_secret_key_minimum_32_characters

# CORS
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_WINDOW=15          # minutes
RATE_LIMIT_MAX_REQUESTS=100   # requests
```

---

## 🚀 Running the Backend

### Development
```bash
npm install
npm run dev
# Runs on http://localhost:5000 with auto-reload
```

### Database Setup
```bash
# Create database
createdb flight_booking

# Seed with 15 flights
npm run seed
```

### Testing
```bash
npm run test
npm run lint
```

### Production
```bash
npm start
# Runs on port specified in environment
```

---

## 📊 Performance Considerations

### Query Optimization
- Indexes on `flights(departure_city, arrival_city)`
- Indexes on `bookings(user_id, pnr)`
- Connection pooling (max 20 connections)

### Caching Strategies
- Flight data cached in frontend (60 sec TTL)
- Pricing info cached (no cache, real-time)
- User wallet cached (10 sec TTL)

### Scalability
- Stateless API (no server sessions)
- Database connection pooling
- Ready for horizontal scaling
- CDN-ready assets

---

## 🐛 Error Handling

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "statusCode": 400
}
```

---

## 📝 Logging

All requests logged with Morgan:
```
[15/Jan/2024 14:30:45] POST /api/bookings/confirm 201 45.23ms
[15/Jan/2024 14:30:46] GET /api/flights/search 200 23.15ms
```

---

**Last Updated**: January 2024
**Version**: 1.0.0
