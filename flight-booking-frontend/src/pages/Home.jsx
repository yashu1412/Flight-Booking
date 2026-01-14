import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../lib/api.js"
import { motion } from "framer-motion"
import FlightCard from "../components/FlightCard.jsx"
import { useTheme } from "../context/ThemeContext.jsx"

export default function Home() {
  const { isDark } = useTheme()
  const [cities, setCities] = useState([])
  const [results, setResults] = useState([])
  const [departure, setDeparture] = useState("")
  const [arrival, setArrival] = useState("")
  const [loading, setLoading] = useState(false)
  const [flights, setFlights] = useState([])
  const [featured, setFeatured] = useState(null)
  const [featuredPrice, setFeaturedPrice] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/flights/cities")
        setCities(data.data.cities || [])
      } catch {}
      try {
        const { data } = await api.get("/flights", { params: { limit: 10 } })
        setFlights(data.data.flights || [])
        const first = (data.data.flights || [])[0] || null
        setFeatured(first)
      } catch {}
    }
    load()
  }, [])

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        if (featured?.id && localStorage.getItem("token")) {
          const { data } = await api.get(`/flights/${featured.id}/pricing`)
          setFeaturedPrice({
            current_price: data?.data?.flight?.current_price ?? featured.base_price,
            base_price: featured.base_price,
            surge_applied: data?.data?.flight?.surge_applied ?? false,
            surge_percentage: data?.data?.flight?.surge_percentage ?? 0
          })
        } else {
          setFeaturedPrice({
            current_price: featured?.base_price,
            base_price: featured?.base_price,
            surge_applied: false,
            surge_percentage: 0
          })
        }
      } catch {
        setFeaturedPrice({
          current_price: featured?.base_price,
          base_price: featured?.base_price,
          surge_applied: false,
          surge_percentage: 0
        })
      }
    }
    fetchPricing()
  }, [featured])

  const search = async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/flights/search", { params: { departure_city: departure || undefined, arrival_city: arrival || undefined, limit: 10 } })
      setResults(data.data.flights || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <section className="relative overflow-hidden on-dark dark:on-dark light:on-light">
        <div className="absolute inset-0 dark:bg-heroOverlay light:bg-lightHeroOverlay"></div>
        <div className="max-w-6xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight dark:text-white light:text-light-text-primary">Book flights with real‑time pricing & instant tickets.</h1>
            <p className="mt-4 dark:text-textSecondary light:text-light-text-secondary">Database-backed search, surge pricing, wallet checkout, PDF tickets.</p>
            <div className="mt-8 flex items-center gap-3">
              <Link to="/flights" className="px-6 py-3 rounded-xl text-white bg-brandGradient">Search flights</Link>
              <Link to="/history" className="px-6 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:hover:bg-[#222] light:hover:bg-[#E8E9EB] dark:text-white light:text-light-text-primary">View booking history</Link>
            </div>
            <div className="mt-4 glass inline-flex px-3 py-1 rounded-full dark:border-hairline light:border-light-border dark:text-textSecondary light:text-light-text-secondary text-sm">Wallet ₹50,000</div>
            <div className="mt-8 relative">
              <div className="text-outline absolute -top-16 -left-6 text-7xl opacity-15 select-none">FLIGHTS</div>
              <motion.div className="absolute -top-10 left-24 floating-pill">LIVE PRICING</motion.div>
              <motion.div className="absolute -top-6 left-64 floating-pill">PDF TICKET</motion.div>
              <motion.div className="absolute -top-4 left-8 floating-pill">PNR GENERATED</motion.div>
            </div>
          </div>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="h-64 rounded-2xl dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border shadow-cardHover">
            {featured && (
              <div className="h-full w-full p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm dark:text-textSecondary light:text-light-text-secondary">
                    <div className="h-6 w-6 rounded-lg bg-brandGradient"></div>
                    <span>{featured.airline}</span>
                    <span>· {featured.flight_id}</span>
                  </div>
                  <div className="mt-2 text-2xl font-semibold dark:text-white light:text-light-text-primary">{featured.departure_city} → {featured.arrival_city}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold dark:text-white light:text-light-text-primary">₹{Number((featuredPrice?.current_price ?? featured.base_price)).toLocaleString("en-IN")}</div>
                    <div className="text-sm dark:text-textSecondary light:text-light-text-secondary">Base ₹{Number((featuredPrice?.base_price ?? featured.base_price)).toLocaleString("en-IN")}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {featuredPrice?.surge_applied && (
                      <span className="px-3 py-1 rounded-full dark:border-hairline light:border-light-border text-sm">SURGE +{featuredPrice?.surge_percentage}%</span>
                    )}
                    <Link to={`/flights/${featured.id}`} className="px-4 py-2 rounded-xl text-white bg-brandGradient">Book now</Link>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
        <div className="marquee mt-4">
          <div className="marquee-content">
            Mumbai → Delhi • Pune → Goa • Chennai → Kolkata • Bengaluru → Jaipur • Hyderabad → Kochi • Ahmedabad → Lucknow • Surat → Indore • Nagpur → Patna •
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 on-dark light:on-light">
        <div className="glass rounded-xl dark:border-hairline light:border-light-border p-6 shadow-glass">
          <div className="text-lg font-semibold dark:text-clear light:text-light-text-primary">Quick Search</div>
          <div className="mt-4 grid md:grid-cols-4 gap-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 dark:text-textSecondary light:text-light-text-secondary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C7.58 2 4 5.58 4 10c0 7 8 12 8 12s8-5 8-12c0-4.42-3.58-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill="currentColor"/>
              </svg>
              <select value={departure} onChange={(e) => setDeparture(e.target.value)} className="pl-10 pr-4 py-3 w-full rounded-xl dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:text-textPrimary light:text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Departure City</option>
                {cities.map(c => <option key={`d-${c}`} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 dark:text-textSecondary light:text-light-text-secondary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16V8a2 2 0 0 0-2-2h-4l-2-2H7L5 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z" fill="currentColor"/>
              </svg>
              <select value={arrival} onChange={(e) => setArrival(e.target.value)} className="pl-10 pr-4 py-3 w-full rounded-xl dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:text-textPrimary light:text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Arrival City</option>
                {cities.map(c => <option key={`a-${c}`} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 dark:text-textSecondary light:text-light-text-secondary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 2v2H5a2 2 0 0 0-2 2v1h18V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm14 7H3v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9z" fill="currentColor"/>
              </svg>
              <input placeholder="Date (optional)" className="pl-10 pr-4 py-3 w-full rounded-xl dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:text-textPrimary light:text-light-text-primary dark:placeholder-textSecondary light:placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <button onClick={search} className="px-4 py-3 rounded-xl text-white bg-brandGradient">Search</button>
          </div>
          <div className="mt-2 text-sm dark:text-textSecondary light:text-light-text-secondary">Choose departure and arrival to fetch 10 flights from DB.</div>
          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <div className="animate-pulse h-24 bg-[#222] rounded-xl"></div>
            ) : (
              <div className="flex gap-4">
                {results.map(f => <div key={f.id} className="min-w-[280px]"><FlightCard flight={f} /></div>)}
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 mt-16">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-semibold dark:text-white light:text-light-text-primary">Trending Routes</div>
          <Link to="/flights" className="text-sm dark:text-textSecondary light:text-light-text-secondary hover:underline">See all</Link>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4">
            {flights.map(f => (
              <div key={`tr-${f.id}`} className="poster min-w-[260px] card">
                <div className="p-4">
                  <div className="text-sm dark:text-textSecondary light:text-light-text-secondary">{f.airline} · {f.flight_id}</div>
                  <div className="mt-2 font-semibold dark:text-white light:text-light-text-primary">{f.departure_city} → {f.arrival_city}</div>
                </div>
                <div className="poster-overlay">
                  <Link to={`/flights/${f.id}`} className="px-3 py-2 rounded-xl dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface text-sm mr-2">View</Link>
                  <Link to={`/flights/${f.id}`} className="btn-primary px-4 py-2">Book</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 mt-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-semibold dark:text-white light:text-light-text-primary">Lowest Prices</div>
          <Link to="/flights" className="text-sm dark:text-textSecondary light:text-light-text-secondary hover:underline">See all</Link>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4">
            {[...flights].sort((a,b) => a.base_price - b.base_price).map(f => (
              <div key={`lp-${f.id}`} className="poster min-w-[260px] card">
                <div className="p-4">
                  <div className="text-sm dark:text-textSecondary light:text-light-text-secondary">₹{Number(f.base_price).toFixed(2)}</div>
                  <div className="mt-2 font-semibold dark:text-white light:text-light-text-primary">{f.departure_city} → {f.arrival_city}</div>
                </div>
                <div className="poster-overlay">
                  <Link to={`/flights/${f.id}`} className="px-3 py-2 rounded-xl dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface text-sm mr-2">View</Link>
                  <Link to={`/flights/${f.id}`} className="btn-primary px-4 py-2">Book</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 mt-16">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { title: "Dynamic Surge Pricing", desc: "Triggers on repeated booking attempts." },
            { title: "Wallet Payments", desc: "Fast checkout with balance validation." },
            { title: "Instant PDF Ticket", desc: "Download and re‑download anytime." },
            { title: "Booking History", desc: "PNR, amount paid, date, and PDF." }
          ].map(item => (
            <div key={item.title} className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl shadow-sm p-6 transition hover:shadow-cardHover">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-brandGradient"></div>
                <div className="font-semibold dark:text-white light:text-light-text-primary">{item.title}</div>
              </div>
              <div className="mt-2 text-sm dark:text-textSecondary light:text-light-text-secondary">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-16">
        <div className="text-3xl font-bold dark:text-white light:text-light-text-primary mb-8">Why Choose XTechon Air?</div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className={`rounded-xl border p-6 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-brandGradient flex-shrink-0"></div>
              <div>
                <div className="font-semibold dark:text-white light:text-light-text-primary">Real-Time Pricing</div>
                <p className="mt-2 text-sm dark:text-textSecondary light:text-light-text-secondary">Get live pricing updates with dynamic surge pricing based on demand. No hidden charges.</p>
              </div>
            </div>
          </div>
          <div className={`rounded-xl border p-6 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-brandGradient flex-shrink-0"></div>
              <div>
                <div className="font-semibold dark:text-white light:text-light-text-primary">Smart Wallet System</div>
                <p className="mt-2 text-sm dark:text-textSecondary light:text-light-text-secondary">Manage bookings with our integrated wallet. Easy fund management and transaction history.</p>
              </div>
            </div>
          </div>
          <div className={`rounded-xl border p-6 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-brandGradient flex-shrink-0"></div>
              <div>
                <div className="font-semibold dark:text-white light:text-light-text-primary">Instant Digital Tickets</div>
                <p className="mt-2 text-sm dark:text-textSecondary light:text-light-text-secondary">Generate and download PDF tickets instantly. Never lose your booking details again.</p>
              </div>
            </div>
          </div>
          <div className={`rounded-xl border p-6 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-brandGradient flex-shrink-0"></div>
              <div>
                <div className="font-semibold dark:text-white light:text-light-text-primary">Complete Booking History</div>
                <p className="mt-2 text-sm dark:text-textSecondary light:text-light-text-secondary">Access all your bookings, PNRs, and tickets from your personal dashboard anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-16">
        <div className="text-3xl font-bold dark:text-white light:text-light-text-primary mb-8">How It Works</div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: 1, title: "Search Flights", desc: "Select your departure and arrival cities to find available flights" },
            { step: 2, title: "Compare & Book", desc: "View real-time pricing and choose your preferred flight" },
            { step: 3, title: "Secure Payment", desc: "Use your wallet balance or add funds for quick checkout" },
            { step: 4, title: "Get Ticket", desc: "Receive instant PDF ticket with PNR to your email" }
          ].map(item => (
            <div key={item.step} className="relative">
              <div className={`rounded-xl border p-6 text-center ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-brandGradient text-white font-bold mb-4">
                  {item.step}
                </div>
                <div className="font-semibold dark:text-white light:text-light-text-primary">{item.title}</div>
                <p className="mt-2 text-sm dark:text-textSecondary light:text-light-text-secondary">{item.desc}</p>
              </div>
              {item.step < 4 && <div className="hidden md:block absolute top-12 -right-2 text-2xl dark:text-textSecondary light:text-light-text-secondary">→</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-16">
        <div className="text-3xl font-bold dark:text-white light:text-light-text-primary mb-8">Statistics</div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { label: "Total Flights", value: "500+", icon: "✈️" },
            { label: "Routes Covered", value: "50+", icon: "🌍" },
            { label: "Active Users", value: "10K+", icon: "👥" },
            { label: "Bookings Completed", value: "50K+", icon: "✓" }
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl border p-8 text-center transition hover:shadow-cardHover ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold dark:text-white light:text-light-text-primary">{stat.value}</div>
              <div className="mt-2 text-sm dark:text-textSecondary light:text-light-text-secondary">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-16">
        <div className="text-3xl font-bold dark:text-white light:text-light-text-primary mb-8">Customer Testimonials</div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Priya Sharma", city: "Mumbai", rating: 5, text: "Booking flights has never been easier! The instant PDF tickets and wallet system saved me so much time." },
            { name: "Rajesh Kumar", city: "Bangalore", rating: 5, text: "Love the real-time pricing and surge indicator. Very transparent pricing with no hidden charges." },
            { name: "Anita Patel", city: "Delhi", rating: 5, text: "The booking history feature is amazing. I can access all my past bookings and PNRs in one place." }
          ].map(testimonial => (
            <div key={testimonial.name} className={`rounded-xl border p-6 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold dark:text-white light:text-light-text-primary">{testimonial.name}</div>
                  <div className="text-sm dark:text-textSecondary light:text-light-text-secondary">{testimonial.city}</div>
                </div>
                <div className="text-yellow-400">★★★★★</div>
              </div>
              <p className="text-sm dark:text-textSecondary light:text-light-text-secondary italic">&ldquo;{testimonial.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-16">
        <div className="text-3xl font-bold dark:text-white light:text-light-text-primary mb-8">Special Offers</div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { badge: "NEW USER", title: "₹500 Bonus", desc: "New users get ₹500 instantly in their wallet on signup!" },
            { badge: "LOYALTY", title: "Rewards Program", desc: "Earn points on every booking and redeem for discounts." },
            { badge: "WEEKDAY", title: "Special Deals", desc: "Get up to 20% off on flights booked for weekday travel." }
          ].map(offer => (
            <div key={offer.badge} className={`rounded-xl border p-6 relative overflow-hidden ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-brandGradient text-white text-xs font-semibold">{offer.badge}</div>
              <div className="mt-4">
                <div className="text-xl font-bold dark:text-white light:text-light-text-primary">{offer.title}</div>
                <p className="mt-2 text-sm dark:text-textSecondary light:text-light-text-secondary">{offer.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-16">
        <div className={`rounded-2xl border p-12 text-center ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
          <div className="text-3xl font-bold dark:text-white light:text-light-text-primary mb-3">Ready to Book Your Flight?</div>
          <p className="dark:text-textSecondary light:text-light-text-secondary mb-6">Join thousands of happy travelers using XTechon Air for seamless flight bookings.</p>
          <Link to="/flights" className="inline-flex px-8 py-3 rounded-xl text-white bg-brandGradient">Start Searching Now</Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-16">
        <div className="text-3xl font-bold dark:text-white light:text-light-text-primary mb-8">Frequently Asked Questions</div>
        <div className="space-y-4">
          {[
            { q: "How do I reset my wallet?", a: "Go to your Wallet page and click 'Reset to ₹50,000'. Your balance will be instantly restored." },
            { q: "Can I download my ticket multiple times?", a: "Yes! You can download your PDF ticket anytime from your booking history or the booking tools." },
            { q: "What if I need to cancel my booking?", a: "You can cancel confirmed bookings from the booking tools page. A refund will be processed to your wallet." },
            { q: "Are there any hidden charges?", a: "No hidden charges! All pricing is transparent. Surge pricing is clearly indicated when applicable." },
            { q: "How long does it take to get my ticket?", a: "Your PDF ticket is generated instantly after booking confirmation. Check your email or dashboard." }
          ].map((faq, idx) => (
            <FAQItem key={idx} question={faq.q} answer={faq.a} isDark={isDark} />
          ))}
        </div>
      </section>
    </div>
  )
}

function FAQItem({ question, answer, isDark }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`rounded-xl border p-4 cursor-pointer transition ${isDark ? 'dark:bg-surface dark:border-hairline dark:hover:bg-[#222]' : 'light:bg-light-surface light:border-light-border light:hover:bg-[#E8E9EB]'}`} onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between">
        <div className="font-semibold dark:text-white light:text-light-text-primary">{question}</div>
        <div className={`text-2xl transition ${open ? 'rotate-180' : ''}`}>▼</div>
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t dark:border-hairline light:border-light-border text-sm dark:text-textSecondary light:text-light-text-secondary">
          {answer}
        </div>
      )}
    </div>
  )
}
