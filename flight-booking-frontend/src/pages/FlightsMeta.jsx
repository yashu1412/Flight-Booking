import { useEffect, useState } from "react"
import { useTheme } from "../context/ThemeContext.jsx"
import api from "../lib/api.js"

export default function FlightsMeta() {
  const { isDark } = useTheme()
  const [cities, setCities] = useState([])
  const [airlines, setAirlines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [c, a] = await Promise.all([
          api.get("/flights/cities"),
          api.get("/flights/airlines")
        ])
        setCities(c.data.data.cities || [])
        setAirlines(a.data.data.airlines || [])
      } catch {} finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Flight Network</h1>
        <p className={`mt-2 text-lg ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>
          Explore our extensive network of cities and partner airlines
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="animate-pulse h-96 dark:bg-gray-800 light:bg-gray-200 rounded-xl"></div>
          <div className="animate-pulse h-96 dark:bg-gray-800 light:bg-gray-200 rounded-xl"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Cities Section */}
          <div>
            <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-8`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>
                  ✈️ Cities
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-brandGradient text-white`}>
                  {cities.length}
                </span>
              </div>
              
              <p className={`text-sm ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} mb-6`}>
                We operate flights to {cities.length} major cities across India, connecting you with essential travel destinations.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {cities.map(c => (
                  <div 
                    key={c} 
                    className={`dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:border-hairline light:border-light-border rounded-lg border p-4 hover:shadow-md transition dark:hover:bg-[#222] light:hover:bg-[#E8E9EB]`}
                  >
                    <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>
                      {c}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} mt-1`}>
                      Major hub
                    </div>
                  </div>
                ))}
              </div>

              {/* City Stats */}
              <div className={`mt-8 pt-8 border-t dark:border-hairline light:border-light-border`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`dark:bg-[#1a1a24] light:bg-[#f8f9fa] rounded-lg p-4 text-center`}>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>{cities.length}</div>
                    <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} mt-1`}>Total Cities</div>
                  </div>
                  <div className={`dark:bg-[#1a1a24] light:bg-[#f8f9fa] rounded-lg p-4 text-center`}>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>${(cities.length * cities.length - cities.length) / 2}</div>
                    <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} mt-1`}>Routes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Airlines Section */}
          <div>
            <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-8`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>
                  🛫 Airlines
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-brandGradient text-white`}>
                  {airlines.length}
                </span>
              </div>

              <p className={`text-sm ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} mb-6`}>
                Partner with {airlines.length} trusted airlines offering competitive pricing and excellent service.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {airlines.map(a => (
                  <div 
                    key={a} 
                    className={`dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:border-hairline light:border-light-border rounded-lg border p-4 hover:shadow-md transition dark:hover:bg-[#222] light:hover:bg-[#E8E9EB]`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-brandGradient"></div>
                      <div>
                        <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>
                          {a}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>
                          Active
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Airline Stats */}
              <div className={`mt-8 pt-8 border-t dark:border-hairline light:border-light-border`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`dark:bg-[#1a1a24] light:bg-[#f8f9fa] rounded-lg p-4 text-center`}>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>{airlines.length}</div>
                    <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} mt-1`}>Partners</div>
                  </div>
                  <div className={`dark:bg-[#1a1a24] light:bg-[#f8f9fa] rounded-lg p-4 text-center`}>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>100+</div>
                    <div className={`text-xs ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} mt-1`}>Active Flights</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className={`mt-12 glass dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-12 text-center`}>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Ready to explore?</h2>
        <p className={`mt-3 ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>Search and book flights from any of our {cities.length} cities</p>
        <a href="/flights" className="mt-6 inline-block px-8 py-3 rounded-xl text-white bg-brandGradient hover:opacity-90 transition font-medium">
          Search Flights
        </a>
      </div>
    </div>
  )
}
