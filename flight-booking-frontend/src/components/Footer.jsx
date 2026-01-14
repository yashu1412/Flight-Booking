import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-hairline bg-gradient-to-b from-[#141414] to-[#0B0B0F]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-4 gap-8 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-lg bg-brandGradient"></div>
              <span className="font-bold text-sm text-textPrimary">XTechon Air</span>
            </div>
            <p className="text-xs text-textSecondary">Flight booking made simple</p>
          </div>
          <div>
            <div className="font-semibold text-xs text-textPrimary mb-3 uppercase tracking-wide">Product</div>
            <div className="flex flex-col gap-2">
              <Link to="/flights" className="text-xs text-textSecondary hover:text-primary transition">Search Flights</Link>
              <Link to="/wallet" className="text-xs text-textSecondary hover:text-primary transition">Wallet</Link>
              <Link to="/history" className="text-xs text-textSecondary hover:text-primary transition">Booking History</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-xs text-textPrimary mb-3 uppercase tracking-wide">Company</div>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-xs text-textSecondary hover:text-primary transition">About Us</Link>
              <Link to="/contact" className="text-xs text-textSecondary hover:text-primary transition">Contact</Link>
              <a href="#" className="text-xs text-textSecondary hover:text-primary transition">Blog</a>
            </div>
          </div>
          <div>
            <div className="font-semibold text-xs text-textPrimary mb-3 uppercase tracking-wide">Follow</div>
            <div className="flex items-center gap-3">
              <a href="#" className="h-8 w-8 rounded-lg bg-surface border border-hairline flex items-center justify-center text-xs hover:bg-[#222] transition">𝕏</a>
              <a href="#" className="h-8 w-8 rounded-lg bg-surface border border-hairline flex items-center justify-center text-xs hover:bg-[#222] transition">⚙</a>
              <a href="#" className="h-8 w-8 rounded-lg bg-surface border border-hairline flex items-center justify-center text-xs hover:bg-[#222] transition">in</a>
            </div>
          </div>
        </div>
        <div className="border-t border-hairline pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-textSecondary">
          <span>© {new Date().getFullYear()} XTechon Air. All rights reserved.</span>
          <div className="flex items-center gap-4 mt-3 md:mt-0">
            <a href="#" className="hover:text-primary transition">Privacy</a>
            <a href="#" className="hover:text-primary transition">Terms</a>
            <a href="#" className="hover:text-primary transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
