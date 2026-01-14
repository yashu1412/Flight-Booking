import { useState } from "react"
import { useTheme } from "../context/ThemeContext.jsx"
import api from "../lib/api.js"

export default function BookingPNR() {
  const { isDark } = useTheme()
  const [pnr, setPnr] = useState("")
  const [booking, setBooking] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const lookup = async () => {
    if (!pnr.trim()) {
      setStatus({ ok: false, msg: "Please enter a PNR" })
      return
    }
    setLoading(true)
    setStatus("pending")
    try {
      const { data } = await api.get(`/bookings/${pnr}`)
      setBooking(data.data.booking)
      setStatus({ ok: true })
    } catch (e) {
      setBooking(null)
      setStatus({ ok: false, msg: e.response?.data?.message || "Booking not found" })
    } finally {
      setLoading(false)
    }
  }

  const cancel = async () => {
    if (!pnr) return
    setLoading(true)
    setStatus("pending")
    try {
      const { data } = await api.put(`/bookings/${pnr}/cancel`)
      setStatus({ ok: true, msg: data.message || "Booking cancelled successfully" })
      lookup()
    } catch (e) {
      setStatus({ ok: false, msg: e.response?.data?.message || "Cancellation failed" })
    } finally {
      setLoading(false)
    }
  }

  const download = async () => {
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
    } catch (e) {}
  }

  const copyPNR = () => {
    navigator.clipboard.writeText(pnr)
  }

  const getStatusBadge = (status) => {
    if (!status) return "PENDING"
    return status.toLowerCase() === "cancelled" ? "CANCELLED" : "CONFIRMED"
  }

  const getStatusColor = (status) => {
    if (!status) return "text-yellow-500"
    return status.toLowerCase() === "cancelled" ? "text-red-500" : "text-green-500"
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Booking Tools</h1>
        <p className={`mt-2 ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>Look up your booking details, download tickets, or manage your reservations</p>
      </div>

      {/* Search Section */}
      <div className={`glass rounded-xl dark:border-hairline light:border-light-border p-8 shadow-glass dark:bg-surface/50 light:bg-light-surface/50 mb-8`}>
        <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'} mb-4`}>Find Your Booking</div>
        <div className="flex items-center gap-3 flex-wrap">
          <input 
            value={pnr} 
            onChange={(e) => setPnr(e.target.value.toUpperCase())} 
            onKeyPress={(e) => e.key === 'Enter' && lookup()}
            placeholder="Enter PNR (e.g., ABC123XYZ)" 
            className={`px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:text-white light:text-light-text-primary dark:placeholder-textSecondary light:placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-primary w-64`} 
          />
          <button 
            onClick={lookup} 
            disabled={loading}
            className="px-6 py-3 rounded-xl text-white bg-brandGradient disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Booking"}
          </button>
        </div>
        {status && status !== "pending" && (
          <div className={`mt-3 p-3 rounded-lg ${status.ok ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'} text-sm`}>
            {status.msg}
          </div>
        )}
      </div>

      {/* Booking Details */}
      {booking && (
        <div className="space-y-6">
          {/* Status & PNR Card */}
          <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-6`}>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Status */}
              <div>
                <div className={`text-sm ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>Booking Status</div>
                <div className={`mt-2 text-2xl font-bold ${getStatusColor(booking.status)}`}>
                  {getStatusBadge(booking.status)}
                </div>
              </div>
              {/* PNR */}
              <div>
                <div className={`text-sm ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>PNR Code</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`text-2xl font-mono font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>{booking.pnr}</div>
                  <button onClick={copyPNR} className={`px-3 py-1 rounded text-xs border dark:border-hairline light:border-light-border dark:hover:bg-[#222] light:hover:bg-[#E8E9EB] transition`}>
                    Copy
                  </button>
                </div>
              </div>
              {/* Booking Date */}
              <div>
                <div className={`text-sm ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>Booking Date</div>
                <div className={`mt-2 text-lg font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>{booking.booking_date}</div>
              </div>
            </div>
          </div>

          {/* Flight & Passenger Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Flight Details */}
            <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-6`}>
              <div className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Flight Details</div>
              <div className="space-y-3">
                <div>
                  <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} uppercase tracking-wide`}>Airline</div>
                  <div className={`mt-1 font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>{booking.flight?.airline}</div>
                </div>
                <div>
                  <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} uppercase tracking-wide`}>Flight Number</div>
                  <div className={`mt-1 font-mono font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>{booking.flight?.flight_id}</div>
                </div>
                <div>
                  <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} uppercase tracking-wide`}>Route</div>
                  <div className={`mt-1 font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>
                    {booking.flight?.departure_city} → {booking.flight?.arrival_city}
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger & Pricing */}
            <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-6`}>
              <div className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Passenger & Pricing</div>
              <div className="space-y-3">
                <div>
                  <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} uppercase tracking-wide`}>Passenger Name</div>
                  <div className={`mt-1 font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>{booking.passenger_name}</div>
                </div>
                <div>
                  <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} uppercase tracking-wide`}>Final Amount</div>
                  <div className={`mt-1 text-2xl font-bold bg-brandGradient bg-clip-text text-transparent`}>
                    ₹{Number(booking.final_price).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-6`}>
            <div className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Price Breakdown</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={isDark ? 'text-textSecondary' : 'text-light-text-secondary'}>Base Price</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>₹{Number(booking.flight?.base_price || 0).toLocaleString("en-IN")}</span>
              </div>
              {booking.surge_applied && (
                <div className="flex justify-between pt-2 border-t dark:border-hairline light:border-light-border">
                  <span className="text-orange-500">Surge Charge (+{booking.surge_percentage}%)</span>
                  <span className="font-semibold text-orange-500">+₹{Number(booking.final_price - booking.flight?.base_price).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t dark:border-hairline light:border-light-border">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Total Amount</span>
                <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>₹{Number(booking.final_price).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button 
              onClick={download} 
              className="px-6 py-3 rounded-xl text-white bg-brandGradient hover:opacity-90 transition"
            >
              📥 Download Ticket (PDF)
            </button>
            {booking.status?.toLowerCase() !== "cancelled" && (
              <button 
                onClick={cancel} 
                disabled={loading}
                className={`px-6 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:text-white light:text-light-text-primary hover:opacity-80 transition disabled:opacity-50`}
              >
                {loading ? "Processing..." : "❌ Cancel Booking"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!booking && status && status !== "pending" && status.ok === false && (
        <div className={`glass rounded-xl dark:border-hairline light:border-light-border p-12 text-center`}>
          <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>No booking found</div>
          <div className={`mt-2 ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>Please check your PNR and try again</div>
        </div>
      )}
    </div>
  )
}
