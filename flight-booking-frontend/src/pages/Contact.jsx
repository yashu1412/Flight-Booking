import { useState } from "react"
import { useTheme } from "../context/ThemeContext.jsx"

export default function Contact() {
  const { isDark } = useTheme()
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = "Name is required"
    if (!form.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email"
    if (!form.subject.trim()) newErrors.subject = "Subject is required"
    if (!form.message.trim()) newErrors.message = "Message is required"
    return newErrors
  }

  const submit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setSent(true)
    setForm({ name: "", email: "", subject: "", message: "" })
    setTimeout(() => setSent(false), 4000)
  }

  const faqs = [
    { q: "How do I book a flight?", a: "Search for flights using departure/arrival cities, select a flight, proceed to checkout with wallet payment, and receive instant PDF ticket." },
    { q: "What is surge pricing?", a: "Dynamic pricing based on booking demand. Repeated booking attempts within 5 minutes trigger up to 2x price multiplier." },
    { q: "Can I cancel my booking?", a: "Yes, use the Booking Tools with your PNR to cancel. Cancellation may have restrictions based on booking status." },
    { q: "How do I download my ticket?", a: "Go to your Dashboard (Booking History) or use Booking Tools with your PNR. Click 'Download Ticket' to get the PDF." },
    { q: "What is the wallet limit?", a: "Your wallet starts with ₹50,000. You can use Booking Tools to check balance sufficiency before booking." }
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Get in Touch</h1>
        <p className={`mt-2 text-lg ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>
          Have questions? Were here to help. Reach out through any of these channels.
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-6`}>
          <div className="text-2xl mb-3">✉️</div>
          <div className={`font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Email</div>
          <div className={`mt-2 ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} text-sm`}>
            <div>Support: hello@example.com</div>
            <div className="mt-1">Sales: sales@example.com</div>
          </div>
        </div>

        <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-6`}>
          <div className="text-2xl mb-3">🕐</div>
          <div className={`font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Support Hours</div>
          <div className={`mt-2 ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} text-sm`}>
            <div>Mon - Fri: 9AM - 6PM IST</div>
            <div className="mt-1">Sat - Sun: 10AM - 4PM IST</div>
          </div>
        </div>

        <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-6`}>
          <div className="text-2xl mb-3">🌐</div>
          <div className={`font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Social & Community</div>
          <div className={`mt-2 ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} text-sm space-y-1`}>
            <div>GitHub: github.com/xtechon</div>
            <div>Twitter: @xtechonair</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Contact Form */}
        <form onSubmit={submit} className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-8`}>
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Send us a message</h2>
          <p className={`mt-2 ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} text-sm`}>Well get back to you within 24 hours</p>
          
          <div className="mt-6 grid gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-light-text-primary'} mb-2`}>Name</label>
              <input 
                value={form.name} 
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} 
                placeholder="Your name" 
                className={`w-full px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:text-white light:text-light-text-primary dark:placeholder-textSecondary light:placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-primary ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <div className="mt-1 text-red-500 text-xs">{errors.name}</div>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-light-text-primary'} mb-2`}>Email</label>
              <input 
                value={form.email} 
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} 
                placeholder="your@email.com" 
                type="email"
                className={`w-full px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:text-white light:text-light-text-primary dark:placeholder-textSecondary light:placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-primary ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <div className="mt-1 text-red-500 text-xs">{errors.email}</div>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-light-text-primary'} mb-2`}>Subject</label>
              <select 
                value={form.subject} 
                onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:text-white light:text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${errors.subject ? 'border-red-500' : ''}`}
              >
                <option value="">Select a topic</option>
                <option value="booking">Booking Issues</option>
                <option value="payment">Payment & Wallet</option>
                <option value="ticket">Ticket & PNR</option>
                <option value="cancellation">Cancellation & Refunds</option>
                <option value="technical">Technical Issues</option>
                <option value="other">Other</option>
              </select>
              {errors.subject && <div className="mt-1 text-red-500 text-xs">{errors.subject}</div>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-light-text-primary'} mb-2`}>Message</label>
              <textarea 
                value={form.message} 
                onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} 
                placeholder="Describe your issue or inquiry..." 
                className={`w-full px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:text-white light:text-light-text-primary dark:placeholder-textSecondary light:placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none ${errors.message ? 'border-red-500' : ''}`}
              />
              {errors.message && <div className="mt-1 text-red-500 text-xs">{errors.message}</div>}
            </div>

            <button type="submit" className="px-6 py-3 rounded-xl text-white bg-brandGradient hover:opacity-90 transition font-medium">
              Send Message
            </button>
          </div>

          {sent && (
            <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-green-500/10 text-green-600' : 'bg-green-100 text-green-800'} text-sm`}>
              ✓ Message sent successfully! Well get back to you soon.
            </div>
          )}
        </form>

        {/* Quick Info */}
        <div className="space-y-6">
          {/* Support Channels */}
          <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-6`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Quick Support</h3>
            <div className="mt-4 space-y-3">
              <a href="/bookings/tools" className={`block p-3 rounded-lg dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:hover:bg-[#222] light:hover:bg-[#E8E9EB] transition dark:text-white light:text-light-text-primary text-sm font-medium`}>
                🔍 Booking Tools - Look up PNR
              </a>
              <a href="/history" className={`block p-3 rounded-lg dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:hover:bg-[#222] light:hover:bg-[#E8E9EB] transition dark:text-white light:text-light-text-primary text-sm font-medium`}>
                📊 Dashboard - View bookings
              </a>
              <a href="/wallet" className={`block p-3 rounded-lg dark:bg-[#1a1a24] light:bg-[#f8f9fa] dark:hover:bg-[#222] light:hover:bg-[#E8E9EB] transition dark:text-white light:text-light-text-primary text-sm font-medium`}>
                💰 Wallet - Check balance
              </a>
            </div>
          </div>

          {/* Company Info */}
          <div className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-6`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>About XTechon Air</h3>
            <p className={`mt-3 text-sm ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>
              A modern flight booking platform demonstrating real-world challenges in online ticketing. Built with React, Node.js, and PostgreSQL.
            </p>
            <div className="mt-4 flex gap-2">
              <a href="/about" className="px-3 py-1 rounded-lg text-xs font-medium bg-brandGradient text-white">Learn More</a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'} mb-8`}>Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-1 gap-4">
          {faqs.map((faq, i) => (
            <details key={i} className={`dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-6 cursor-pointer group`}>
              <summary className={`font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'} flex items-center justify-between`}>
                {faq.q}
                <span className="text-lg group-open:rotate-180 transition">▼</span>
              </summary>
              <p className={`mt-4 ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'} text-sm leading-relaxed`}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className={`glass dark:border-hairline light:border-light-border rounded-xl border shadow-sm p-12 text-center`}>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Ready to book your flight?</h2>
        <p className={`mt-3 ${isDark ? 'text-textSecondary' : 'text-light-text-secondary'}`}>Search and book flights with real-time pricing and instant PDF tickets</p>
        <a href="/flights" className="mt-6 inline-block px-8 py-3 rounded-xl text-white bg-brandGradient hover:opacity-90 transition font-medium">
          Search Flights
        </a>
      </div>
    </div>
  )
}
