import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../lib/api.js"
import { useTheme } from "../context/ThemeContext.jsx"

export default function FlightDetails() {
  const { isDark } = useTheme()
  const { id } = useParams()
  const [flight, setFlight] = useState(null)
  const [pricing, setPricing] = useState(null)
  const [passenger, setPassenger] = useState({ name: "", email: "", phone: "" })
  const [wallet, setWallet] = useState(null)
  const [status, setStatus] = useState(null)
  const [errors, setErrors] = useState({})

  const load = async () => {
    try {
      const { data } = await api.get(`/flights/${id}`)
      setFlight(data.data.flight)
    } catch {}
    try {
      const { data } = await api.get(`/flights/${id}/pricing`)
      setPricing(data.data.pricing)
    } catch {}
    try {
      const { data } = await api.get("/wallet/balance")
      setWallet(data.data.wallet_balance)
    } catch {}
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const canAfford = pricing && wallet ? wallet >= pricing.current_price : false

  const validateForm = () => {
    const newErrors = {}
    if (!passenger.name.trim()) newErrors.name = "Name is required"
    if (!passenger.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)) newErrors.email = "Invalid email"
    if (!passenger.phone.trim()) newErrors.phone = "Phone is required"
    else if (!/^\d{10}$/.test(passenger.phone.replace(/\D/g, ''))) newErrors.phone = "Invalid phone number"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const confirm = async () => {
    if (!validateForm()) return
    setStatus("pending")
    try {
      const body = { flight_id: id, passenger_name: passenger.name, passenger_email: passenger.email, passenger_phone: passenger.phone }
      const { data } = await api.post("/bookings/confirm", body)
      setStatus({ ok: true, booking: data.data.booking })
    } catch (e) {
      setStatus({ ok: false, msg: e.response?.data?.message || "Booking failed" })
    }
  }

  const downloadTicket = async (pnr) => {
    try {
      const res = await api.get(`/bookings/${pnr}/ticket`, { responseType: "blob" })
      const blob = new Blob([res.data], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ticket-${pnr}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {}
  }

  return (
    <div className={`max-w-7xl mx-auto px-6 py-6`}>
      <div className="mb-8">
        <h1 className={`text-4xl font-bold ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Flight Details</h1>
        <p className={`mt-2 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Complete your booking securely</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className={`rounded-xl border p-6 mb-6 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className={`text-sm font-semibold mb-4 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>FLIGHT DETAILS</div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isDark ? 'dark:bg-[#222] dark:text-textSecondary' : 'light:bg-[#E8E9EB] light:text-light-text-secondary'}`}>{flight?.airline}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isDark ? 'dark:bg-[#222] dark:text-textSecondary' : 'light:bg-[#E8E9EB] light:text-light-text-secondary'}`}>{flight?.flight_id}</span>
            </div>
            <div className={`text-sm mb-1 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>{flight?.departure_city} → {flight?.arrival_city}</div>
            <div className={`text-xs mb-4 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>{flight?.departure_time} → {flight?.arrival_time}</div>
            
            <div className={`border-t ${isDark ? 'dark:border-hairline' : 'light:border-light-border'} pt-4 mt-4`}>
              <div className={`text-xs font-semibold mb-2 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>FARE</div>
              {pricing?.surge_applied && (
                <div className={`text-xs mb-1 ${isDark ? 'dark:text-error' : 'light:text-error'}`}>🔴 Surge +{pricing?.surge_percentage}%</div>
              )}
              {pricing?.surge_applied && (
                <div className={`text-sm line-through mb-1 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>₹{Number(pricing?.base_price).toFixed(2)}</div>
              )}
              <div className={`text-3xl font-bold ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>₹{Number(pricing?.current_price || flight?.base_price || 0).toFixed(2)}</div>
              <div className={`text-xs mt-2 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Base: ₹{Number(pricing?.base_price || flight?.base_price || 0).toFixed(2)}</div>
            </div>

            <div className={`border-t ${isDark ? 'dark:border-hairline' : 'light:border-light-border'} pt-4 mt-4`}>
              <div className={`text-xs font-semibold mb-2 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>WALLET</div>
              <div className={`text-xl font-bold mb-2 ${canAfford ? (isDark ? 'dark:text-green-400' : 'light:text-green-600') : (isDark ? 'dark:text-error' : 'light:text-error')}`}>
                ₹{wallet !== null ? Number(wallet).toLocaleString("en-IN") : "—"}
              </div>
              <div className={`text-xs ${canAfford ? (isDark ? 'dark:text-green-400 dark:bg-green-900' : 'light:text-green-600 light:bg-green-100') : (isDark ? 'dark:text-error dark:bg-red-900' : 'light:text-error light:bg-red-100')} px-3 py-1 rounded-full`}>
                {canAfford ? "✓ Sufficient balance" : "⚠ Insufficient balance"}
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-6 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className={`text-sm font-semibold mb-4 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>PRICE BREAKDOWN</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}>Base Fare</span>
                <span className={isDark ? 'dark:text-white' : 'light:text-light-text-primary'}>₹{Number(pricing?.base_price || flight?.base_price || 0).toFixed(2)}</span>
              </div>
              {pricing?.surge_applied && (
                <>
                  <div className="flex justify-between">
                    <span className={isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}>Surge Charge (+{pricing?.surge_percentage}%)</span>
                    <span className={isDark ? 'dark:text-error' : 'light:text-error'}>₹{Number((pricing?.current_price - pricing?.base_price)).toFixed(2)}</span>
                  </div>
                  <div className={`border-t ${isDark ? 'dark:border-hairline' : 'light:border-light-border'} pt-2 mt-2`}></div>
                </>
              )}
              <div className="flex justify-between font-bold">
                <span className={isDark ? 'dark:text-white' : 'light:text-light-text-primary'}>Total</span>
                <span className={isDark ? 'dark:text-white' : 'light:text-light-text-primary'}>₹{Number(pricing?.current_price || flight?.base_price || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className={`rounded-xl border p-8 mb-8 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className={`text-2xl font-semibold mb-6 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Passenger Information</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm mb-2 font-semibold ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Full Name *</label>
                <input 
                  value={passenger.name} 
                  onChange={(e) => { setPassenger(p => ({ ...p, name: e.target.value })); if (errors.name) setErrors({...errors, name: ''}) }} 
                  placeholder="Enter passenger name" 
                  className={`px-4 py-3 w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary ${isDark ? 'dark:border-hairline dark:bg-[#1a1a1f] dark:text-white' : 'light:border-light-border light:bg-[#f8f8f9] light:text-light-text-primary'}`} 
                />
                {errors.name && <div className={`text-xs mt-1 ${isDark ? 'dark:text-error' : 'light:text-error'}`}>{errors.name}</div>}
              </div>
              <div>
                <label className={`block text-sm mb-2 font-semibold ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Email *</label>
                <input 
                  value={passenger.email} 
                  onChange={(e) => { setPassenger(p => ({ ...p, email: e.target.value })); if (errors.email) setErrors({...errors, email: ''}) }} 
                  placeholder="Passenger email" 
                  className={`px-4 py-3 w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary ${isDark ? 'dark:border-hairline dark:bg-[#1a1a1f] dark:text-white' : 'light:border-light-border light:bg-[#f8f8f9] light:text-light-text-primary'}`} 
                />
                {errors.email && <div className={`text-xs mt-1 ${isDark ? 'dark:text-error' : 'light:text-error'}`}>{errors.email}</div>}
              </div>
              <div>
                <label className={`block text-sm mb-2 font-semibold ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Phone *</label>
                <input 
                  value={passenger.phone} 
                  onChange={(e) => { setPassenger(p => ({ ...p, phone: e.target.value })); if (errors.phone) setErrors({...errors, phone: ''}) }} 
                  placeholder="10-digit phone number" 
                  className={`px-4 py-3 w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary ${isDark ? 'dark:border-hairline dark:bg-[#1a1a1f] dark:text-white' : 'light:border-light-border light:bg-[#f8f8f9] light:text-light-text-primary'}`} 
                />
                {errors.phone && <div className={`text-xs mt-1 ${isDark ? 'dark:text-error' : 'light:text-error'}`}>{errors.phone}</div>}
              </div>
            </div>

            <div className="mt-8">
              <div className={`flex items-center gap-3 mb-4 p-4 rounded-lg ${isDark ? 'dark:bg-[#1a1a1f]' : 'light:bg-[#f8f8f9]'}`}>
                <input type="checkbox" id="terms" className="w-4 h-4" />
                <label htmlFor="terms" className={`text-sm ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>I agree to the terms and conditions</label>
              </div>
              <button 
                disabled={!canAfford || Object.keys(errors).length > 0 || status === "pending"} 
                onClick={confirm} 
                className={`w-full px-6 py-3 rounded-xl font-semibold transition ${!canAfford || Object.keys(errors).length > 0 ? (isDark ? 'dark:bg-[#333] dark:text-[#777]' : 'light:bg-[#e0e0e0] light:text-[#999]') : 'text-white bg-brandGradient'}`}
              >
                {status === "pending" ? "Processing..." : "Confirm Booking"}
              </button>
              {!canAfford && <div className={`mt-3 text-sm ${isDark ? 'dark:text-error' : 'light:text-error'}`}>⚠ Insufficient wallet balance. Please add funds.</div>}
            </div>

            {status && status !== "pending" && status.ok && (
              <div className={`mt-6 p-6 rounded-xl border ${isDark ? 'dark:bg-green-900 dark:border-green-700 dark:text-green-200' : 'light:bg-green-100 light:border-green-300 light:text-green-800'}`}>
                <div className={`text-lg font-semibold`}>✓ Booking Confirmed!</div>
                <div className={`mt-3 text-sm`}>PNR: <span className="font-bold">{status.booking.pnr}</span></div>
                <button onClick={() => downloadTicket(status.booking.pnr)} className="mt-4 inline-flex px-6 py-2 rounded-lg text-white bg-brandGradient">Download Ticket (PDF)</button>
              </div>
            )}
            {status && status !== "pending" && !status.ok && (
              <div className={`mt-6 p-6 rounded-xl border ${isDark ? 'dark:bg-red-900 dark:border-red-700 dark:text-red-200' : 'light:bg-red-100 light:border-red-300 light:text-red-800'}`}>
                <div className={`text-lg font-semibold`}>✗ Booking Failed</div>
                <div className={`mt-2 text-sm`}>{status.msg}</div>
              </div>
            )}
          </div>

          <div className={`rounded-xl border p-6 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className={`font-semibold mb-4 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Important Information</div>
            <ul className="space-y-3 text-sm">
              <li className={`flex gap-3 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>
                <span>✓</span>
                <span>Your PDF ticket will be sent to your email instantly after confirmation</span>
              </li>
              <li className={`flex gap-3 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>
                <span>✓</span>
                <span>Keep your PNR safe. You&apos;ll need it to check-in and for cancellations</span>
              </li>
              <li className={`flex gap-3 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>
                <span>✓</span>
                <span>Reach the airport at least 2 hours before departure</span>
              </li>
              <li className={`flex gap-3 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>
                <span>✓</span>
                <span>Cancellations are subject to airline policies</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={`fixed md:hidden bottom-0 inset-x-0 p-4 ${isDark ? 'dark:bg-[#0B0B0F] dark:border-hairline' : 'light:bg-white light:border-light-border'} border-t`}>
        <button 
          disabled={!canAfford || Object.keys(errors).length > 0 || status === "pending"} 
          onClick={confirm} 
          className={`w-full px-6 py-3 rounded-xl font-semibold ${!canAfford || Object.keys(errors).length > 0 ? (isDark ? 'dark:bg-[#333] dark:text-[#777]' : 'light:bg-[#e0e0e0] light:text-[#999]') : 'text-white bg-brandGradient'}`}
        >
          Book Now
        </button>
      </div>
    </div>
  )
}

