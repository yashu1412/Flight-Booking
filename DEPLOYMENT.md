# 🚀 Deployment & Testing Guide

## Production Deployment Checklist

### Backend Deployment (to Heroku, Railway, or Render)

#### 1. Prepare Environment
```bash
# Create .env.production
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
JWT_SECRET=[generate-secure-key-min-32-chars]
FRONTEND_URL=https://your-frontend-url.com
```

#### 2. Deploy to Heroku
```bash
# Install Heroku CLI
npm install -g heroku
heroku login

# Create app
heroku create your-flight-booking-api

# Set environment variables
heroku config:set DATABASE_URL="postgresql://..." --app your-flight-booking-api
heroku config:set JWT_SECRET="your_secret_key" --app your-flight-booking-api

# Push code
git push heroku main

# Run seeding
heroku run npm run seed --app your-flight-booking-api
```

#### 3. Deploy to Railway
```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Create project
railway init

# Add environment variables in Railway dashboard
# Database URL
# JWT_SECRET

# Deploy
railway up
```

#### 4. Deploy to Render
```
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Add environment variables
5. Deploy
```

---

### Frontend Deployment (to Vercel or Netlify)

#### 1. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd flight-booking-frontend
vercel --prod

# Set environment variables in Vercel dashboard
VITE_API_URL=https://your-backend-url.com
```

#### 2. Deploy to Netlify
```bash
# Build
npm run build

# Deploy using Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## Testing Procedures

### 1. Authentication Testing

```
Test Case 1: User Registration
- Navigate to registration page
- Enter email, password, name
- Click register
- Verify: User created with ₹50,000 wallet
- Expected: Redirect to login

Test Case 2: User Login
- Enter demo@example.com / password123
- Click login
- Expected: Redirect to home page, auth token stored

Test Case 3: Invalid Credentials
- Enter wrong password
- Expected: Error message displayed
```

### 2. Flight Search Testing

```
Test Case 1: Search All Flights
- Click "Search Flights"
- Expected: Display 10 flights from PostgreSQL
- Verify: Each shows airline, route, departure time, price

Test Case 2: Filter by Cities
- Select "From: Mumbai"
- Select "To: Delhi"
- Click search
- Expected: Show only Mumbai→Delhi flights

Test Case 3: Sort by Price
- Select "Sort: Price (Low to High)"
- Click search
- Expected: Flights sorted by price ascending

Test Case 4: Price Filter
- Select "Price: ₹2000 - ₹2500"
- Click search
- Expected: Show flights within price range
```

### 3. Surge Pricing Testing

```
Test Case 1: First Booking Attempt
- Select a flight
- Click "Book Now"
- Expected: Price = base price (no surge)

Test Case 2: Second Booking Attempt (Same Flight)
- Book same flight again within 5 minutes
- Expected: Price still = base price

Test Case 3: Third Booking Attempt - Surge Triggered
- Book same flight 3rd time within 5 minutes
- Expected: Price = base_price * 1.10 (10% surge)
- Verify: "Surge pricing applied" badge shown
- Verify: Countdown timer "Resets in 9:45..."

Test Case 4: Price Reset After 10 Minutes
- Wait 10 minutes
- Try booking same flight again
- Expected: Price = base price (surge removed)
- Verify: No surge badge shown
```

### 4. Wallet System Testing

```
Test Case 1: Check Initial Balance
- Login as demo@example.com
- Go to Wallet page
- Expected: Balance = ₹50,000

Test Case 2: Add Funds
- Click "Add ₹5000"
- Expected: Balance = ₹55,000
- Verify: Transaction appears in history

Test Case 3: Sufficient Balance Booking
- Select flight priced at ₹2500
- Book with passenger name
- Expected: Booking confirmed
- Verify: Balance deducted (e.g., ₹55,000 - ₹2500 = ₹52,500)

Test Case 4: Insufficient Balance Error
- Select flight when balance < flight price
- Expected: Error "Insufficient balance"
- Verify: Booking not created

Test Case 5: Refund on Cancellation
- Book a flight (balance reduced)
- Go to booking history
- Click "Cancel Booking"
- Expected: Booking status = CANCELLED
- Verify: Wallet refunded (balance increased)
```

### 5. PDF Generation Testing

```
Test Case 1: PDF Download
- Go to booking history
- Click "Download Ticket"
- Expected: PDF downloaded
- Verify: PDF opens in browser/reader

Test Case 2: PDF Content Verification
- Open downloaded PDF
- Verify all required fields:
  ✓ PNR code (6 characters, e.g., "ABC123")
  ✓ Passenger name
  ✓ Airline & Flight ID
  ✓ Route (From → To)
  ✓ Final price paid
  ✓ Booking date & time
  ✓ Status (CONFIRMED/CANCELLED)

Test Case 3: Re-download
- Download same ticket multiple times
- Expected: PDF downloads successfully each time
```

### 6. Booking History Testing

```
Test Case 1: View Booking History
- Go to History page
- Expected: Show all user's bookings
- Verify: Shows at least 1 booking

Test Case 2: Booking Details Display
- Click on a booking
- Expected: Show:
  ✓ Flight details (airline, route, time)
  ✓ Amount paid
  ✓ Booking date & PNR
  ✓ Download button

Test Case 3: Copy PNR
- Click "Copy PNR" button
- Paste in notepad
- Expected: 6-character code pasted
```

### 7. Dark/Light Theme Testing

```
Test Case 1: Toggle Theme
- Click theme button (☀️/🌙)
- Expected: Page colors invert
- Verify: All pages themed correctly

Test Case 2: Theme Persistence
- Toggle theme
- Refresh page
- Expected: Theme persists

Test Case 3: Theme Across Pages
- Set dark mode
- Navigate through all pages
- Expected: Dark mode active on all pages
```

### 8. Responsive Design Testing

```
Desktop (1920px):
- Verify: Layout full-width, no overflow

Tablet (768px):
- Verify: Sidebar collapses, content adapts
- Verify: Buttons/forms accessible

Mobile (375px):
- Verify: Single column layout
- Verify: Touch-friendly button sizes (min 44x44px)
- Verify: No horizontal scroll
```

---

## Performance Testing

### Load Testing
```bash
# Install Apache Bench
# Benchmark API endpoints
ab -n 1000 -c 10 https://your-api.com/api/flights/search

# Expected: < 200ms response time
```

### Database Query Optimization
```
Check slow queries:
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC;

Verify indexes exist:
SELECT * FROM pg_indexes WHERE tablename = 'flights';
```

---

## Security Testing

```
Test Case 1: SQL Injection
- Try search: "'; DROP TABLE flights; --"
- Expected: Query properly parameterized, no errors

Test Case 2: JWT Token Expiry
- Get auth token
- Wait for expiry (typically 7 days)
- Try to access protected endpoint
- Expected: 401 Unauthorized response

Test Case 3: Password Hashing
- Check database
- Password should NOT be plain text
- Expected: bcryptjs hash (starts with $2a$...)

Test Case 4: Rate Limiting
- Make 100 requests in 1 minute
- Expected: After threshold, 429 Too Many Requests
```

---

## Verification Checklist

### Core Requirements ✅
- [ ] 15 flights seeded in PostgreSQL
- [ ] Surge pricing: 3 attempts → 10% increase in 5 min
- [ ] Wallet: ₹50,000 default, deduction on booking
- [ ] PDF: All required fields (PNR, name, airline, flight, route, price, date/time)
- [ ] Booking history: Flight details, amount, date, PNR, download button

### Optional Enhancements ✅
- [ ] Sorting & filtering flights
- [ ] Surge indicators & countdown timers
- [ ] Responsive UI
- [ ] Authentication
- [ ] Search by cities
- [ ] Dark/Light mode
- [ ] Error handling
- [ ] Rate limiting
- [ ] Clean code

---

## Troubleshooting

### Backend Issues

```
Issue: Database connection failed
Solution:
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Ensure database created: createdb flight_booking

Issue: API returns 500 errors
Solution:
- Check backend logs: npm run dev
- Verify all required env variables set
- Check database migrations ran

Issue: JWT token invalid
Solution:
- Ensure JWT_SECRET is set and consistent
- Clear browser cookies and re-login
- Verify token expiry time set correctly
```

### Frontend Issues

```
Issue: API requests failing (CORS error)
Solution:
- Check VITE_API_URL is correct
- Verify backend has CORS middleware enabled
- Check both run on different ports

Issue: Dark mode not persisting
Solution:
- Check localStorage not disabled
- Verify theme context working
- Check browser doesn't block storage

Issue: PDF download not working
Solution:
- Check backend pdfService.js is generating
- Verify file permissions
- Check browser download settings
```

---

## Deployment Success Criteria

✅ **Backend**
- All health checks pass (GET /health)
- Database seeding successful (15 flights visible)
- All API endpoints respond correctly
- Rate limiting active

✅ **Frontend**
- Pages load without errors
- API calls successful
- Theme system working
- PDF downloads work

✅ **Integration**
- End-to-end booking flow works
- Surge pricing triggers correctly
- Wallet deduction happens
- Booking history displays correctly

---

## Production Monitoring

### Monitoring Tools
- **Backend**: PM2, New Relic, or DataDog
- **Frontend**: Sentry for error tracking
- **Database**: pgAdmin or similar
- **Performance**: New Relic APM

### Recommended Alerts
- API response time > 500ms
- Error rate > 1%
- Database connection pool exhausted
- Disk space < 10%
- Memory usage > 80%

---

**Last Updated**: 2024
**Version**: 1.0.0
