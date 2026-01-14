export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Project Overview */}
      <div className="glass rounded-xl dark:border-hairline light:border-light-border p-8 shadow-glass dark:bg-surface/50 light:bg-light-surface/50 mb-12">
        <h1 className="text-4xl font-bold dark:text-white light:text-light-text-primary">XTechon Air - Flight Booking Platform</h1>
        <p className="mt-4 text-lg dark:text-textSecondary light:text-light-text-secondary">
          A modern, full-stack flight booking system demonstrating real-world challenges in online ticketing. Book flights with dynamic surge pricing, instant PDF tickets, and wallet-based payments.
        </p>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">✈️</div>
            <div>
              <div className="font-semibold dark:text-white light:text-light-text-primary">100+ Flights</div>
              <div className="text-sm dark:text-textSecondary light:text-light-text-secondary">Real database of routes</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-3xl">💰</div>
            <div>
              <div className="font-semibold dark:text-white light:text-light-text-primary">Dynamic Pricing</div>
              <div className="text-sm dark:text-textSecondary light:text-light-text-secondary">Surge pricing on demand</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-3xl">📄</div>
            <div>
              <div className="font-semibold dark:text-white light:text-light-text-primary">Instant Tickets</div>
              <div className="text-sm dark:text-textSecondary light:text-light-text-secondary">PDF downloads anytime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="glass rounded-xl dark:border-hairline light:border-light-border p-8 shadow-glass dark:bg-surface/50 light:bg-light-surface/50">
        <div className="text-3xl font-bold dark:text-white light:text-light-text-primary">Built to demonstrate end‑to‑end booking.</div>
        <div className="mt-4 dark:text-textSecondary light:text-light-text-secondary">Database search, surge engine, wallet, PDF tickets, and real-time pricing.</div>
      </div>

      {/* Core Features */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold dark:text-white light:text-light-text-primary mb-6">Core Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl shadow-sm p-6 border">
            <div className="font-semibold dark:text-white light:text-light-text-primary">Real-Time Pricing Engine</div>
            <div className="mt-2 dark:text-textSecondary light:text-light-text-secondary text-sm">Dynamic surge pricing that triggers on repeated booking attempts within 5 minutes. Up to 2x price multiplier for high-demand routes.</div>
          </div>
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl shadow-sm p-6 border">
            <div className="font-semibold dark:text-white light:text-light-text-primary">Wallet System</div>
            <div className="mt-2 dark:text-textSecondary light:text-light-text-secondary text-sm">Secure wallet checkout with balance validation. Users start with ₹50,000 and can view transaction history.</div>
          </div>
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl shadow-sm p-6 border">
            <div className="font-semibold dark:text-white light:text-light-text-primary">Instant PDF Tickets</div>
            <div className="mt-2 dark:text-textSecondary light:text-light-text-secondary text-sm">Auto-generated PDF tickets with PNR, flight details, and QR code. Download anytime from booking history.</div>
          </div>
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl shadow-sm p-6 border">
            <div className="font-semibold dark:text-white light:text-light-text-primary">Booking History</div>
            <div className="mt-2 dark:text-textSecondary light:text-light-text-secondary text-sm">Complete booking records with PNR, amount paid, booking date, and PDF download option.</div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold dark:text-white light:text-light-text-primary mb-6">Tech Stack</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl shadow-sm p-6 border">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-brandGradient"></div>
              <div className="font-semibold dark:text-white light:text-light-text-primary">Frontend</div>
            </div>
            <div className="space-y-2 text-sm dark:text-textSecondary light:text-light-text-secondary">
              <div>• React 18 with React Router v7</div>
              <div>• Tailwind CSS with custom themes</div>
              <div>• Framer Motion for animations</div>
              <div>• Vite build tool</div>
              <div>• Axios for API calls</div>
            </div>
          </div>
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl shadow-sm p-6 border">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-brandGradient"></div>
              <div className="font-semibold dark:text-white light:text-light-text-primary">Backend</div>
            </div>
            <div className="space-y-2 text-sm dark:text-textSecondary light:text-light-text-secondary">
              <div>• Node.js with Express</div>
              <div>• JWT authentication</div>
              <div>• jsPDF for ticket generation</div>
              <div>• Rate limiting & validation</div>
              <div>• Error handling middleware</div>
            </div>
          </div>
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl shadow-sm p-6 border">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-brandGradient"></div>
              <div className="font-semibold dark:text-white light:text-light-text-primary">Database</div>
            </div>
            <div className="space-y-2 text-sm dark:text-textSecondary light:text-light-text-secondary">
              <div>• PostgreSQL</div>
              <div>• Flight data & pricing</div>
              <div>• User accounts & wallets</div>
              <div>• Booking records</div>
              <div>• Surge attempt tracking</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold dark:text-white light:text-light-text-primary mb-6">How It Works</h2>
        <div className="space-y-4">
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl shadow-sm p-6 border flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brandGradient flex items-center justify-center text-white font-semibold">1</div>
            <div>
              <div className="font-semibold dark:text-white light:text-light-text-primary">Search Flights</div>
              <div className="mt-1 dark:text-textSecondary light:text-light-text-secondary text-sm">Browse flights by departure/arrival cities. Database-backed search returns real results with base pricing.</div>
            </div>
          </div>
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl shadow-sm p-6 border flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brandGradient flex items-center justify-center text-white font-semibold">2</div>
            <div>
              <div className="font-semibold dark:text-white light:text-light-text-primary">View Real-Time Pricing</div>
              <div className="mt-1 dark:text-textSecondary light:text-light-text-secondary text-sm">Pricing updates based on surge detection. Multiple booking attempts trigger up to 2x surge multiplier.</div>
            </div>
          </div>
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl shadow-sm p-6 border flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brandGradient flex items-center justify-center text-white font-semibold">3</div>
            <div>
              <div className="font-semibold dark:text-white light:text-light-text-primary">Checkout with Wallet</div>
              <div className="mt-1 dark:text-textSecondary light:text-light-text-secondary text-sm">Seamless wallet payment with balance validation. Insufficient balance is prevented before booking.</div>
            </div>
          </div>
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl shadow-sm p-6 border flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brandGradient flex items-center justify-center text-white font-semibold">4</div>
            <div>
              <div className="font-semibold dark:text-white light:text-light-text-primary">Receive Instant Ticket</div>
              <div className="mt-1 dark:text-textSecondary light:text-light-text-secondary text-sm">PDF ticket generated with PNR, flight details, and QR code. Download from history anytime.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Technologies Used */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold dark:text-white light:text-light-text-primary mb-6">Technologies Used</h2>
        <div className="flex flex-wrap gap-3">
          {[
            "React", "React Router", "Tailwind CSS", "Framer Motion", 
            "Vite", "Node.js", "Express", "PostgreSQL", "JWT",
            "jsPDF", "Axios", "Middleware", "REST API"
          ].map(x => (
            <div key={x} className="px-4 py-2 rounded-full dark:border-hairline light:border-light-border text-sm dark:bg-surface light:bg-light-surface dark:text-textPrimary light:text-light-text-primary border">
              {x}
            </div>
          ))}
        </div>
      </div>

      {/* Key Highlights */}
      <div className="mt-12 mb-12">
        <h2 className="text-2xl font-bold dark:text-white light:text-light-text-primary mb-6">Key Highlights</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl p-4 border">
            <div className="font-semibold dark:text-white light:text-light-text-primary">✓ Fully Responsive</div>
            <div className="mt-1 text-sm dark:text-textSecondary light:text-light-text-secondary">Works seamlessly on desktop, tablet, and mobile devices</div>
          </div>
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl p-4 border">
            <div className="font-semibold dark:text-white light:text-light-text-primary">✓ Dark & Light Mode</div>
            <div className="mt-1 text-sm dark:text-textSecondary light:text-light-text-secondary">Complete theme support with localStorage persistence</div>
          </div>
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl p-4 border">
            <div className="font-semibold dark:text-white light:text-light-text-primary">✓ Animated UI</div>
            <div className="mt-1 text-sm dark:text-textSecondary light:text-light-text-secondary">Smooth page transitions and interactive element animations</div>
          </div>
          <div className="dark:bg-surface light:bg-light-surface dark:border-hairline light:border-light-border rounded-xl p-4 border">
            <div className="font-semibold dark:text-white light:text-light-text-primary">✓ Production Ready</div>
            <div className="mt-1 text-sm dark:text-textSecondary light:text-light-text-secondary">Error handling, rate limiting, and security best practices</div>
          </div>
        </div>
      </div>
    </div>
  )
}
