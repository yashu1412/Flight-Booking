# ✈️ Flight Booking System - Complete End-to-End Application
Live : https://flight-booking-5naa.vercel.app/

A professional, production-ready flight booking platform built with modern web technologies. This project demonstrates full-stack development capabilities with database-driven features, dynamic pricing, wallet system, and PDF ticket generation.

## 📋 Project Overview

XTechon Air is a comprehensive flight booking system featuring:

✅ **Database-Driven Flight Search** - Real-time flight data from PostgreSQL
✅ **Dynamic Surge Pricing** - Intelligent price adjustment based on booking attempts
✅ **Smart Wallet System** - ₹50,000 default balance with transaction tracking
✅ **PDF Ticket Generation** - Professional, downloadable e-tickets with PNR
✅ **Complete Booking History** - Track all bookings with details and re-download capability
✅ **User Authentication** - Secure JWT-based login/registration
✅ **Responsive UI** - Dark/Light mode with TailwindCSS
✅ **Rate Limiting & Security** - Production-grade security measures

---

## 🎯 Assignment Requirements Compliance

### ✅ 1. Flight Search Module (Database Required)
- **15 flights seeded** into PostgreSQL database (exceeds 10-20 requirement)
- Each flight includes: `flight_id`, `airline`, `departure_city`, `arrival_city`, `base_price` (₹2000-₹3000)
- **Every search returns flights directly from database** (no static JSON or random generation)
- Search by cities, airlines, price range with real database queries
- **Status**: ✅ COMPLETE

### ✅ 2. Dynamic Pricing Engine
- **Surge pricing triggered** when user attempts to book same flight 3 times within 5 minutes
- **Price increase**: 10% surge charge applied automatically
- **Reset mechanism**: Price returns to base after 10 minutes
- Countdown timer displayed to users
- **Status**: ✅ COMPLETE

### ✅ 3. Wallet System
- **Default balance**: ₹50,000
- **Deduction on booking**: Final price (including surge) deducted from wallet
- **Validation error** shown if balance insufficient
- Transaction history with credits/debits
- **Status**: ✅ COMPLETE

### ✅ 4. Ticket PDF Generation
- **PDF includes all required fields**:
  - ✅ Passenger name
  - ✅ Airline & Flight ID
  - ✅ Route (Departure → Arrival)
  - ✅ Final price paid
  - ✅ Booking date & time
  - ✅ Unique PNR (6-character code)
- Professional design with color coding
- Re-downloadable from booking history
- **Status**: ✅ COMPLETE

### ✅ 5. Booking History Page
- **Complete booking display** with:
  - ✅ Flight details, Amount paid, Booking date, PNR code
  - ✅ Download ticket button, Copy PNR functionality
  - ✅ Booking status display
- Stored in PostgreSQL database
- **Status**: ✅ COMPLETE

### ✅ Optional Enhancements - ALL IMPLEMENTED
- ✅ Sorting & filtering flights | ✅ Surge indicators & countdown timers
- ✅ Responsive UI | ✅ Authentication | ✅ Search by cities
- ✅ Dark/Light mode | ✅ Clean Git history | ✅ Professional code structure

---

## 📦 Installation & Setup

### Prerequisites
```bash
- Node.js 18+ & npm
- PostgreSQL 12+
- Git
```

### 1. Clone Repository
```bash
git clone <repository-url>
cd my-app
```

### 2. Backend Setup
```bash
cd flight-booking-backend
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/flight_booking
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
EOF

# Create database
createdb flight_booking

# Seed database with 15 flights
npm run seed

# Start server
npm run dev
# Running at http://localhost:5000
```

### 3. Frontend Setup
```bash
cd flight-booking-frontend
npm install
npm run dev
# Running at http://localhost:5173
```

---

## 🔑 Login Credentials

### Demo User
```
Email:    demo@example.com
Password: password123
Wallet:   ₹50,000
```
---

## 🌟 Key Features

### Dynamic Surge Pricing
- Track booking attempts per flight
- Auto-trigger 10% surge after 3 attempts within 5 minutes
- Auto-reset after 10 minutes
- Real-time countdown displayed

### Wallet System
- Default ₹50,000 balance
- Real-time transaction tracking
- Balance validation before booking
- Automatic refunds on cancellation

### PDF Tickets
- Professional e-ticket design
- Unique 6-character PNR codes
- All booking details included
- Re-downloadable anytime

### Flight Search
- Database-backed search
- Filter by airline, price range
- Sort by price, time, airline
- Real-time statistics

---

## 🏗️ Project Structure

```
flight-booking-backend/
  ├── src/
  │   ├── config/          - Database & environment
  │   ├── controllers/     - Request handlers
  │   ├── models/          - DB schemas
  │   ├── services/        - Business logic
  │   ├── middleware/      - Auth, validation, rate limiting
  │   ├── routes/          - API routes
  │   └── utils/           - Helpers, seeding
  └── package.json

flight-booking-frontend/
  ├── src/
  │   ├── components/      - Reusable UI components
  │   ├── context/         - React Context
  │   ├── pages/           - Page components
  │   ├── lib/             - API client
  │   └── App.jsx          - Root component
  └── package.json
```

---

## 📊 Database Schema

```
users (id, email, password, first_name, last_name, wallet_balance)
flights (id, flight_id, airline, departure_city, arrival_city, base_price)
bookings (id, pnr, user_id, flight_id, final_price, surge_applied, surge_percentage)
booking_attempts (id, user_id, flight_id, attempt_time)
```

---

## 🔌 Key API Endpoints

```
POST   /api/auth/register              - Register user
POST   /api/auth/login                 - Login & get token
GET    /api/flights/search             - Search flights with filters
POST   /api/bookings/confirm           - Confirm booking (deduct wallet)
GET    /api/bookings/history           - User's booking history
GET    /api/bookings/:pnr/ticket       - Download PDF ticket
GET    /api/wallet/balance             - Get wallet balance
```

---

## ✨ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT + bcryptjs |
| PDF Generation | PDFKit |
| Security | Rate limiting, Helmet.js |

---

## 🚀 Production Deployment

### Environment Variables Required
```
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=your_secret_key_minimum_32_characters
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.com
```

### Deploy Backend
```bash
# Heroku, Railway, Render
git push origin main
```

### Deploy Frontend
```bash
# Vercel or Netlify
npm run build
# Deploy build folder
```

---
---

**Built with ❤️ by Yashpalsingh Pawara - Full Stack Excellence**
