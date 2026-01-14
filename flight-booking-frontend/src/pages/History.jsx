import { useEffect, useMemo, useState } from "react"
import { useTheme } from "../context/ThemeContext.jsx"
import api from "../lib/api.js"

export default function History() {
  const { isDark } = useTheme()
  const [bookings, setBookings] = useState([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [airlineFilter, setAirlineFilter] = useState("")

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

  const load = async () => {
    setLoading(true)
    try {
      const [historyRes, profileRes, walletRes] = await Promise.all([
        api.get("/bookings/history", { params: { page: 1, limit: 20 } }),
        api.get("/auth/profile"),
        api.get("/wallet/balance")
      ])
      setBookings(historyRes.data.data.bookings || [])
      setProfile(profileRes.data.data.user || null)
      setWallet(walletRes.data.data.wallet_balance || 0)
    } catch {
      setBookings([])
      setProfile(null)
      setWallet(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = bookings.filter(b => !airlineFilter || b.flight.airline === airlineFilter)
    if (!q) return base
    return base.filter(b => (b.pnr || "").toLowerCase().includes(q) || (b.passenger_name || "").toLowerCase().includes(q))
  }, [bookings, query, airlineFilter])

  const copyPNR = (pnr) => {
    navigator.clipboard.writeText(pnr)
  }

  const totalSpent = bookings.reduce((sum, b) => sum + (b.final_price || 0), 0)
  const uniqueAirlines = [...new Set(bookings.map(b => b.flight?.airline))].filter(Boolean)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* User Profile Header */}
      <div className="mb-8">
        <div className={`glass rounded-xl dark:border-hairline light:border-light-border p-8 shadow-glass dark:bg-surface/50 light:bg-light-surface/50`}>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-brandGradient flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold dark:text-white light:text-light-text-primary">
                    {profile?.first_name} {profile?.last_name}
                  </h1>
                  <p className="mt-1 dark:text-textSecondary light:text-light-text-secondary">{profile?.email}</p>
                  {profile?.phone && <p className="mt-1 dark:text-textSecondary light:text-light-text-secondary">{profile?.phone}</p>}
                </div>
              </div>
            </div>

            {/* Wallet Card */}
            <div className="dark:bg-[#1a1a24] light:bg-[#f8f9fa] rounded-xl p-6 border dark:border-hairline light:border-light-border">
              <div className="text-sm dark:text-textSecondary light:text-light-text-secondary">Wallet Balance</div>
              <div className="mt-3 text-3xl font-bold dark:text-white light:text-light-text-primary">
                ₹{Number(wallet || 0).toLocaleString("en-IN")}
              </div>
              <a href="/wallet" className="mt-4 inline-block px-4 py-2 rounded-lg text-white bg-brandGradient text-sm font-medium">
                Manage Wallet
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-8 grid md:grid-cols-4 gap-4">
        <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl p-6 border">
          <div className="text-sm dark:text-textSecondary light:text-light-text-secondary">Total Bookings</div>
          <div className="mt-2 text-3xl font-bold dark:text-white light:text-light-text-primary">{bookings.length}</div>
        </div>
        <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl p-6 border">
          <div className="text-sm dark:text-textSecondary light:text-light-text-secondary">Total Spent</div>
          <div className="mt-2 text-3xl font-bold dark:text-white light:text-light-text-primary">₹{Number(totalSpent).toLocaleString("en-IN")}</div>
        </div>
        <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl p-6 border">
          <div className="text-sm dark:text-textSecondary light:text-light-text-secondary">Airlines Used</div>
          <div className="mt-2 text-3xl font-bold dark:text-white light:text-light-text-primary">{uniqueAirlines.length}</div>
        </div>
        <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl p-6 border">
          <div className="text-sm dark:text-textSecondary light:text-light-text-secondary">Member Since</div>
          <div className="mt-2 text-lg font-bold dark:text-white light:text-light-text-primary">Today</div>
        </div>
      </div>

      {/* Booking History */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold dark:text-white light:text-light-text-primary">Booking History</h2>
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search PNR or name" 
            className="px-4 py-2 rounded-xl border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:text-white light:text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary w-64" 
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse h-24 dark:bg-gray-800 light:bg-gray-200 rounded-xl"></div>
            <div className="animate-pulse h-24 dark:bg-gray-800 light:bg-gray-200 rounded-xl"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`glass rounded-xl dark:border-hairline light:border-light-border p-12 text-center`}>
            <div className="text-xl font-semibold dark:text-white light:text-light-text-primary">No bookings yet</div>
            <div className="mt-2 dark:text-textSecondary light:text-light-text-secondary">Start by searching flights</div>
            <a href="/flights" className="mt-6 inline-flex px-6 py-3 rounded-xl text-white bg-brandGradient">Search flights</a>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="dark:text-textSecondary light:text-light-text-secondary border-b dark:border-hairline light:border-light-border">
                      <th className="text-left py-3 font-semibold">Airline</th>
                      <th className="text-left py-3 font-semibold">Flight</th>
                      <th className="text-left py-3 font-semibold">Route</th>
                      <th className="text-left py-3 font-semibold">Amount</th>
                      <th className="text-left py-3 font-semibold">Date</th>
                      <th className="text-left py-3 font-semibold">PNR</th>
                      <th className="text-left py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => (
                      <tr key={b.id} className="border-b dark:border-hairline light:border-light-border dark:hover:bg-[#1a1a24] light:hover:bg-[#f8f9fa]">
                        <td className="py-3 dark:text-white light:text-light-text-primary">{b.flight.airline}</td>
                        <td className="dark:text-textSecondary light:text-light-text-secondary">{b.flight.flight_id}</td>
                        <td className="dark:text-textSecondary light:text-light-text-secondary">{b.flight.route}</td>
                        <td className="font-semibold dark:text-white light:text-light-text-primary">₹{Number(b.final_price).toFixed(2)}</td>
                        <td className="dark:text-textSecondary light:text-light-text-secondary">{b.booking_date}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-mono dark:text-white light:text-light-text-primary">{b.pnr}</span>
                            <button onClick={() => copyPNR(b.pnr)} className="px-2 py-1 rounded border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface text-xs hover:opacity-80">
                              Copy
                            </button>
                          </div>
                        </td>
                        <td>
                          <button onClick={() => downloadTicket(b.pnr)} className="px-3 py-1 rounded text-white bg-brandGradient text-xs">
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filtered.map(b => (
                <div key={b.id} className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold dark:text-white light:text-light-text-primary">{b.flight.airline} · {b.flight.flight_id}</div>
                      <div className="mt-1 text-sm dark:text-textSecondary light:text-light-text-secondary">{b.flight.route}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold dark:text-white light:text-light-text-primary">₹{Number(b.final_price).toFixed(2)}</div>
                      <div className="text-xs dark:text-textSecondary light:text-light-text-secondary">{b.booking_date}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono dark:text-textSecondary light:text-light-text-secondary">PNR: {b.pnr}</span>
                      <button onClick={() => copyPNR(b.pnr)} className="px-2 py-1 rounded border dark:border-hairline light:border-light-border text-xs">
                        Copy
                      </button>
                    </div>
                    <button onClick={() => downloadTicket(b.pnr)} className="px-3 py-1 rounded text-white bg-brandGradient text-xs">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
