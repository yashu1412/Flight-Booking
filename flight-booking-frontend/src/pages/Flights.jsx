import { useEffect, useMemo, useState, useCallback } from "react"
import { useTheme } from "../context/ThemeContext.jsx"
import api from "../lib/api.js"
import FlightCard from "../components/FlightCard.jsx"

export default function Flights() {
  const { isDark } = useTheme()
  const [flights, setFlights] = useState([])
  const [cities, setCities] = useState([])
  const [airlines, setAirlines] = useState([])
  const [filters, setFilters] = useState({ departure_city: "", arrival_city: "", airline: "", min_price: "", max_price: "", sort_by: "base_price", sort_order: "ASC" })
  const [loading, setLoading] = useState(true)
  const [searchMade, setSearchMade] = useState(false)

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [c, a] = await Promise.all([api.get("/flights/cities"), api.get("/flights/airlines")])
        setCities(c.data.data.cities || [])
        setAirlines(a.data.data.airlines || [])
      } catch {}
    }
    loadMeta()
  }, [])

  const fetchFlights = useCallback(async () => {
    setLoading(true)
    setSearchMade(true)
    try {
      const { data } = await api.get("/flights/search", { params: { ...filters, limit: 50 } })
      setFlights(data.data.flights || [])
    } catch {
      setFlights([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  const onChange = (key, value) => setFilters(f => ({ ...f, [key]: value }))

  const resetFilters = () => {
    setFilters({ departure_city: "", arrival_city: "", airline: "", min_price: "", max_price: "", sort_by: "base_price", sort_order: "ASC" })
    setFlights([])
    setSearchMade(false)
  }

  const stats = useMemo(() => {
    if (flights.length === 0) return null
    const prices = flights.map(f => f.base_price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(0)
    }
  }, [flights])

  const filterPanel = useMemo(() => (
    <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Filters</h2>
        <button onClick={resetFilters} className="text-xs px-2 py-1 rounded dark:hover:bg-[#222] light:hover:bg-[#E8E9EB] transition">Reset</button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className={`block text-xs font-medium ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} mb-2 uppercase`}>From</label>
          <select value={filters.departure_city} onChange={(e) => onChange("departure_city", e.target.value)} className={`w-full px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:text-white light:text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary`}>
            <option value="">All cities</option>
            {cities.map(c => <option key={`d-${c}`} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className={`block text-xs font-medium ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} mb-2 uppercase`}>To</label>
          <select value={filters.arrival_city} onChange={(e) => onChange("arrival_city", e.target.value)} className={`w-full px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:text-white light:text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary`}>
            <option value="">All cities</option>
            {cities.map(c => <option key={`a-${c}`} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className={`block text-xs font-medium ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} mb-2 uppercase`}>Airline</label>
          <select value={filters.airline} onChange={(e) => onChange("airline", e.target.value)} className={`w-full px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:text-white light:text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary`}>
            <option value="">All airlines</option>
            {airlines.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="pt-2">
          <label className={`block text-xs font-medium ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} mb-2 uppercase`}>Price Range</label>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Min" value={filters.min_price} onChange={(e) => onChange("min_price", e.target.value)} className={`px-3 py-2 rounded-lg border dark:border-hairline light:border-light-border dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:text-white light:text-light-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary`} />
            <input type="number" placeholder="Max" value={filters.max_price} onChange={(e) => onChange("max_price", e.target.value)} className={`px-3 py-2 rounded-lg border dark:border-hairline light:border-light-border dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:text-white light:text-light-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary`} />
          </div>
        </div>

        <div className="pt-2">
          <label className={`block text-xs font-medium ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} mb-2 uppercase`}>Sort By</label>
          <div className="grid grid-cols-2 gap-2">
            <select value={filters.sort_by} onChange={(e) => onChange("sort_by", e.target.value)} className={`px-3 py-2 rounded-lg border dark:border-hairline light:border-light-border dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:text-white light:text-light-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary`}>
              <option value="base_price">Price</option>
              <option value="airline">Airline</option>
              <option value="departure_time">Time</option>
            </select>
            <select value={filters.sort_order} onChange={(e) => onChange("sort_order", e.target.value)} className={`px-3 py-2 rounded-lg border dark:border-hairline light:border-light-border dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:text-white light:text-light-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary`}>
              <option value="ASC">Low to High</option>
              <option value="DESC">High to Low</option>
            </select>
          </div>
        </div>

        <div className="pt-4 grid grid-cols-2 gap-2">
          <button onClick={fetchFlights} disabled={loading} className="px-4 py-3 rounded-xl text-white bg-brandGradient disabled:opacity-50 font-medium text-sm">
            {loading ? "Searching..." : "Search"}
          </button>
          <button onClick={resetFilters} className={`px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:text-white light:text-light-text-primary text-sm font-medium`}>
            Clear
          </button>
        </div>
      </div>
    </div>
  ), [filters, cities, airlines, loading, isDark, fetchFlights])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Find Your Flight</h1>
        <p className={`mt-2 ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>Search and compare flights with real-time pricing</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar Filters */}
        <div className="md:col-span-1">
          {filterPanel}
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          {/* Results Summary */}
          {searchMade && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>
                    {flights.length} Flights Found
                  </h2>
                  <p className={`mt-1 text-sm ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>
                    {filters.departure_city && filters.arrival_city 
                      ? `${filters.departure_city} → ${filters.arrival_city}`
                      : 'All routes'}
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-lg border p-4`}>
                    <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} uppercase`}>Lowest</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>₹{Number(stats.min).toLocaleString("en-IN")}</div>
                  </div>
                  <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-lg border p-4`}>
                    <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} uppercase`}>Average</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>₹{Number(stats.avg).toLocaleString("en-IN")}</div>
                  </div>
                  <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-lg border p-4`}>
                    <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} uppercase`}>Highest</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>₹{Number(stats.max).toLocaleString("en-IN")}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`animate-pulse h-32 dark:bg-gray-800 light:bg-gray-200 rounded-xl`}></div>
              ))}
            </div>
          )}

          {/* No Search Made */}
          {!searchMade && !loading && (
            <div className={`glass dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-12 text-center`}>
              <div className="text-3xl mb-4">🔍</div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Start searching</h3>
              <p className={`mt-2 ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>Select your departure and arrival cities to see available flights</p>
            </div>
          )}

          {/* No Results */}
          {searchMade && !loading && flights.length === 0 && (
            <div className={`glass dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-12 text-center`}>
              <div className="text-3xl mb-4">✈️</div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>No flights found</h3>
              <p className={`mt-2 ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>Try adjusting your filters or search criteria</p>
              <button onClick={resetFilters} className="mt-6 px-6 py-3 rounded-xl text-white bg-brandGradient">Clear Filters</button>
            </div>
          )}

          {/* Flight Results Grid */}
          {!loading && flights.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {flights.map(f => <FlightCard key={f.id} flight={f} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
