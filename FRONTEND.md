# 🎨 Frontend Architecture & Component Guide

## Frontend Overview

**Framework**: React 18
**Build Tool**: Vite
**Styling**: TailwindCSS v3 (Dark/Light Mode)
**Routing**: React Router v7
**Animations**: Framer Motion
**HTTP Client**: Axios

---

## 📁 Directory Structure

```
flight-booking-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx                      # Root component with routing
│   ├── main.jsx                     # React DOM entry
│   ├── index.css                    # Tailwind directives
│   ├── components/
│   │   ├── Navbar.jsx               # Header with auth & theme
│   │   ├── Footer.jsx               # Footer
│   │   └── FlightCard.jsx           # Reusable flight card
│   ├── context/
│   │   └── ThemeContext.jsx         # Dark/Light theme state
│   ├── pages/
│   │   ├── Home.jsx                 # Landing page
│   │   ├── Flights.jsx              # Flight search & list
│   │   ├── FlightDetails.jsx        # Booking page
│   │   ├── History.jsx              # Booking history
│   │   ├── Wallet.jsx               # Wallet management
│   │   ├── About.jsx                # About page
│   │   ├── Contact.jsx              # Contact page
│   │   ├── AuthLogin.jsx            # Login page
│   │   ├── AuthRegister.jsx         # Registration page
│   │   ├── AuthProfile.jsx          # User profile
│   │   ├── BookingPNR.jsx           # PNR lookup
│   │   └── FlightsMeta.jsx          # Flight metadata
│   ├── lib/
│   │   └── api.js                   # Axios API client
│   ├── package.json
│   └── vite.config.js
├── postcss.config.js                # PostCSS + Tailwind
├── tailwind.config.js               # TailwindCSS config
└── index.html                       # HTML entry point
```

---

## 🎨 Component Architecture

### 1. Navbar Component
**File**: `src/components/Navbar.jsx`

```jsx
Features:
- Navigation links (Home, Flights, History, Wallet)
- Authentication buttons (Login/Register or Profile)
- Theme toggle (☀️/🌙)
- User dropdown menu
- Responsive mobile menu

Props: None (uses context)

State:
- showAuthModal: boolean
- authMode: 'login' | 'register'
- showUserMenu: boolean
```

**Dark Mode Implementation**:
```jsx
// Uses TailwindCSS class selector
className="dark:bg-gray-900 dark:text-white"

// Theme toggle
<button onClick={() => toggleTheme()}>
  {theme === 'dark' ? '☀️' : '🌙'}
</button>
```

---

### 2. FlightCard Component
**File**: `src/components/FlightCard.jsx`

```jsx
Props:
- flight: {
    id, flight_id, airline, departure_city, 
    arrival_city, departure_time, base_price, 
    available_seats
  }
- onSelect?: (flight) => void

Features:
- Display flight details
- Show base price
- Show available seats
- Book button
- Responsive grid layout

Styling:
- Gradient background
- Hover effects
- Dark mode support
```

---

### 3. ThemeContext
**File**: `src/context/ThemeContext.jsx`

```jsx
Exports:
- useTheme() hook

State:
- theme: 'light' | 'dark'
- toggleTheme: () => void

Persistence:
- Stores in localStorage as 'theme'
- Falls back to system preference

HTML Class Update:
- Sets 'dark' class on <html> element
- Triggers TailwindCSS dark: variants
```

---

## 📄 Pages Overview

### Home Page
**File**: `src/pages/Home.jsx`

```
Sections:
1. Hero Banner
   - Welcome message
   - Quick search CTA
   - Background image

2. Why Choose Us
   - 4 feature cards
   - Icons & descriptions
   - Hover animations

3. How It Works
   - 4-step process
   - Step numbers & descriptions
   - Vertical timeline

4. Statistics
   - 500+ Flights
   - 50+ Routes
   - 10K+ Users
   - 50K+ Bookings

5. Testimonials
   - 3 customer reviews
   - 5-star ratings
   - Avatar images

6. Special Offers
   - New User ₹500 bonus
   - Loyalty rewards
   - Weekday special deals

7. FAQ
   - 5 expandable questions
   - Accordion animation
   - Helpful tips

8. Call-to-Action
   - Search flights button
   - Contact us link
```

---

### Flights Page
**File**: `src/pages/Flights.jsx`

```
Layout: Sidebar + Grid

Sidebar (Filters):
- From (city select)
- To (city select)
- Airline (multi-select)
- Price Range (₹2000 - ₹5000)
- Sort By (Price, Time, Airline)

Main Content:
- Results count
- Flight statistics
  * Lowest price
  * Average price
  * Highest price
- Flight grid (responsive)
- Loading state (6 skeletons)
- Empty state message

Features:
- Real-time filtering
- API calls with filters
- Caching mechanism
- Error handling
```

---

### Flight Details Page
**File**: `src/pages/FlightDetails.jsx`

```
Layout: Flight info + Booking form

Left Side (Flight Details):
- Airline & Flight ID
- Route & Times
- Duration
- Available seats
- Base price

Right Side (Booking Form):
- Passenger name input
- Email input (validation)
- Phone input (validation)
- Price breakdown
  * Base fare
  * Surge charges
  * Total price
- Wallet status
  * Current balance
  * Green if sufficient
  * Red if insufficient
- Important information
  * Check-in timing
  * Document requirements
  * Cancellation policy
  * Contact number

Submission:
- Form validation
- Price check
- Wallet check
- Booking confirmation
- PDF download

State:
- formData: { name, email, phone }
- errors: {}
- loading: boolean
- bookingResult: {}
```

---

### Booking History Page
**File**: `src/pages/History.jsx`

```
Layout: List view

Features:
- List all user bookings
- Show flight details per booking
  * Airline & Flight ID
  * Route
  * Times
  * Amount paid
  * Booking date
  * PNR code
- Actions per booking
  * Download ticket (PDF)
  * Copy PNR
  * Cancel booking
  * View details
- Status badges
  * CONFIRMED (green)
  * CANCELLED (red)
- Empty state (no bookings)
- Loading state

Pagination:
- 10 bookings per page
- Previous/Next buttons
```

---

### Wallet Page
**File**: `src/pages/Wallet.jsx`

```
Sections:

1. Balance Display
   - Large number showing current balance
   - "₹" prefix
   - Green highlight

2. Quick Stats
   - Total spent
   - Number of bookings
   - Total bonus credits

3. Add Funds
   - Amount input field
   - Quick buttons
     * ₹1,000
     * ₹5,000
     * ₹10,000
     * ₹25,000
   - Custom amount option

4. Balance Checker
   - Enter flight price
   - Check if balance sufficient
   - Show "Sufficient ✓" or "Insufficient ✗"

5. Transaction History
   - Table view
   - Columns:
     * Description
     * Type (CREDIT/DEBIT)
     * Amount
     * Date & Time
   - Color coded
     * Green for credits
     * Red for debits
   - Sorted by date (newest first)

State:
- balance: number
- transactions: []
- addAmount: number
- checkPrice: number
- checkResult: null
```

---

### Authentication Pages

#### AuthLogin.jsx
```jsx
Form Fields:
- Email (email validation)
- Password (min 6 chars)

Buttons:
- Login button
- Register link

Features:
- Form validation
- Error messages
- Loading state
- Remember me checkbox
- Forgot password link
```

#### AuthRegister.jsx
```jsx
Form Fields:
- First Name (required)
- Last Name (required)
- Email (email validation)
- Phone (10 digits)
- Password (min 6 chars)
- Confirm Password (match check)

Features:
- Password strength indicator
- Error messages per field
- Terms acceptance checkbox
- Loading state
- Already have account link
```

#### AuthProfile.jsx
```jsx
Sections:

1. Personal Information
   - First Name input
   - Last Name input
   - Email display (read-only)
   - Phone input
   - Save/Cancel buttons

2. Security
   - Change Password section
   - Enable 2FA toggle
   - Active sessions list

3. Preferences
   - Email notifications toggle
   - Booking alerts toggle
   - Marketing emails toggle
   - Newsletter signup

4. Account Overview (Sidebar)
   - User role display
   - Wallet balance
   - Member since date
   - Total bookings

5. Quick Actions
   - View Bookings button
   - Check Wallet button
   - Download History button
```

---

## 🌐 API Integration

### API Client Setup
**File**: `src/lib/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

// Request interceptor (add token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Calls Used

```javascript
// Authentication
POST /api/auth/register
POST /api/auth/login

// Flights
GET /api/flights/search?from={city}&to={city}&sort={sort}
GET /api/flights/:id
GET /api/flights/:id/price

// Bookings
POST /api/bookings/initiate
POST /api/bookings/confirm
GET /api/bookings/history
POST /api/bookings/:pnr/cancel
GET /api/bookings/:pnr/ticket (PDF download)

// Wallet
GET /api/wallet/balance
POST /api/wallet/add-funds
GET /api/wallet/transactions
```

---

## 🎨 Styling & Theme System

### TailwindCSS Configuration
**File**: `tailwind.config.js`

```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class', // Use 'dark' class selector
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',    // Blue
        secondary: '#059669',  // Green
        accent: '#f59e0b',     // Amber
      },
    },
  },
  plugins: [],
};
```

### Dark Mode Classes
```jsx
// Light mode (default)
<div className="bg-white text-black">

// Dark mode
<div className="dark:bg-gray-900 dark:text-white">

// Both
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
```

### CSS Custom Properties
**File**: `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom animations */
@layer components {
  .fade-in {
    @apply animate-fadeIn;
  }
  .slide-up {
    @apply animate-slideUp;
  }
}

/* Keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 🎬 Animations

### Framer Motion Usage

```jsx
import { motion } from 'framer-motion';

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>

// Slide up
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.2 }}
>
  Content
</motion.div>

// Hover effect
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.div>
```

---

## 🔐 Authentication Flow

### Login Flow
1. User enters email & password
2. POST /api/auth/login
3. Backend returns JWT token
4. Store token in localStorage
5. Redirect to home page
6. All subsequent requests include Authorization header

### Protected Routes
```jsx
// Using PrivateRoute component
<PrivateRoute>
  <ProtectedPage />
</PrivateRoute>

// Checks for token in localStorage
// Redirects to login if no token
```

### Token Refresh
```javascript
// Stored as 'authToken' in localStorage
// Sent in Authorization header: Bearer {token}
// Auto-logout on 401 response
```

---

## 📱 Responsive Design

### Breakpoints
```
Mobile:    < 640px   (sm)
Tablet:    640px     (md)
Desktop:   1024px    (lg)
Large:     1280px    (xl)
```

### Mobile-First Approach
```jsx
// Mobile by default
<div className="w-full p-4">
  {/* 100% width, 16px padding */}
  
  {/* Tablet: 2 columns */}
  <div className="grid grid-cols-1 md:grid-cols-2">
  
  {/* Desktop: 3 columns */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## 🐛 Error Handling

### Try-Catch Pattern
```jsx
const handleSubmit = async () => {
  try {
    setLoading(true);
    const response = await api.post('/endpoint', data);
    setSuccess(true);
  } catch (error) {
    setError(error.response?.data?.message || 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```

### Error Display
```jsx
{error && (
  <div className="bg-red-100 border border-red-400 
                  text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}
```

---

## 🚀 Build & Deploy

### Development
```bash
npm install
npm run dev
# Runs on http://localhost:5173
```

### Production Build
```bash
npm run build
# Creates optimized bundle in dist/

npm run preview
# Preview production build
```

### Environment Variables
```bash
VITE_API_URL=https://your-backend-api.com
```

### Deploy to Vercel
```bash
npm run build
vercel deploy --prod
```

### Deploy to Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## 📊 Performance Optimization

### Code Splitting
```jsx
import { lazy, Suspense } from 'react';

const LazyFlights = lazy(() => import('./pages/Flights'));

<Suspense fallback={<Loading />}>
  <LazyFlights />
</Suspense>
```

### Memoization
```jsx
// Prevent unnecessary re-renders
export default memo(FlightCard);

// Cache expensive computations
const sortedFlights = useMemo(
  () => flights.sort((a, b) => a.price - b.price),
  [flights]
);
```

### Image Optimization
```jsx
// Use WebP with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Flight" />
</picture>
```

---

## ✅ Testing Checklist

- [ ] All pages load without errors
- [ ] Navigation works across all pages
- [ ] Authentication: Login/Register/Logout
- [ ] Flight search returns results
- [ ] Filters work correctly
- [ ] Booking flow complete
- [ ] Wallet balance updates
- [ ] PDF downloads
- [ ] Dark mode toggles
- [ ] Mobile responsive
- [ ] Form validation works
- [ ] Error messages display

---

**Last Updated**: January 2024
**Version**: 1.0.0
