import React from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useTheme } from "./context/ThemeContext.jsx"
import Navbar from "./components/Navbar.jsx"
import Footer from "./components/Footer.jsx"
import Home from "./pages/Home.jsx"
import Flights from "./pages/Flights.jsx"
import FlightDetails from "./pages/FlightDetails.jsx"
import History from "./pages/History.jsx"
import Wallet from "./pages/Wallet.jsx"
import About from "./pages/About.jsx"
import Contact from "./pages/Contact.jsx"
import AuthLogin from "./pages/AuthLogin.jsx"
import AuthRegister from "./pages/AuthRegister.jsx"
import AuthProfile from "./pages/AuthProfile.jsx"
import AuthChangePassword from "./pages/AuthChangePassword.jsx"
import FlightsMeta from "./pages/FlightsMeta.jsx"
import BookingPNR from "./pages/BookingPNR.jsx"

const Page = ({ children }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()
  const { isDark } = useTheme()
  
  // Apply dark/light class to html element
  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.remove("light")
    } else {
      document.documentElement.classList.add("light")
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])
  
  return (
    <div className={`flex flex-col min-h-screen ${isDark ? "bg-[#0B0B0F] text-textPrimary on-dark" : "bg-light-bg text-light-text-primary"}`}>
      <div className="fixed inset-0 -z-10">
        <div className={`absolute inset-0 ${isDark ? "bg-radialWash1" : "bg-lightRadialWash1"}`}></div>
        <div className={`absolute inset-0 ${isDark ? "bg-radialWash2" : "bg-lightRadialWash2"}`}></div>
      </div>
      <Navbar />
      <main className="pt-20 flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/flights" element={<Page><Flights /></Page>} />
            <Route path="/flights/:id" element={<Page><FlightDetails /></Page>} />
            <Route path="/history" element={<Page><History /></Page>} />
            <Route path="/wallet" element={<Page><Wallet /></Page>} />
            <Route path="/auth/login" element={<Page><AuthLogin /></Page>} />
            <Route path="/auth/register" element={<Page><AuthRegister /></Page>} />
            <Route path="/auth/profile" element={<Page><AuthProfile /></Page>} />
            <Route path="/auth/change-password" element={<Page><AuthChangePassword /></Page>} />
            <Route path="/flights/meta" element={<Page><FlightsMeta /></Page>} />
            <Route path="/bookings/tools" element={<Page><BookingPNR /></Page>} />
            <Route path="/about" element={<Page><About /></Page>} />
            <Route path="/contact" element={<Page><Contact /></Page>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
