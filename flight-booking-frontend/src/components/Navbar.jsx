import { Link, NavLink, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useTheme } from "../context/ThemeContext.jsx"
import api from "../lib/api.js"

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme()
  const [balance, setBalance] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [signupForm, setSignupForm] = useState({ first_name: "", last_name: "", email: "", password: "", phone: "" })
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    const load = async () => {
      try {
        if (localStorage.getItem("token")) {
          const [{ data: bal }, { data: prof }] = await Promise.all([
            api.get("/wallet/balance"),
            api.get("/auth/profile")
          ])
          setProfile(prof?.data?.user || null)
          const { data } = { data: bal }
          setBalance(data.data.wallet_balance)
        } else {
          setBalance(null)
          setProfile(null)
        }
      } catch {
        setBalance(null)
        setProfile(null)
      }
    }
    load()
  }, [token])

  const login = async () => {
    setAuthLoading(true)
    try {
      const { data } = await api.post("/auth/login", {
        email: loginForm.email,
        password: loginForm.password
      })
      const t = data?.data?.token
      if (t) {
        localStorage.setItem("token", t)
        setShowLogin(false)
        navigate(0)
      }
    } catch (e) {
      console.error(e)
      alert("Login failed")
    } finally {
      setAuthLoading(false)
    }
  }

  const signup = async () => {
    setAuthLoading(true)
    try {
      const { data } = await api.post("/auth/register", {
        first_name: signupForm.first_name,
        last_name: signupForm.last_name,
        email: signupForm.email,
        password: signupForm.password,
        phone: signupForm.phone || undefined
      })
      const t = data?.data?.token
      if (t) {
        localStorage.setItem("token", t)
        setShowSignup(false)
        navigate(0)
      }
    } catch (e) {
      console.error(e)
      alert("Signup failed")
    } finally {
      setAuthLoading(false)
    }
  }

  const clearToken = () => {
    localStorage.removeItem("token")
    navigate(0)
  }

  const [toast, setToast] = useState(null)
  useEffect(() => {
    let t
    if (toast) {
      t = setTimeout(() => setToast(null), 2500)
    }
    return () => t && clearTimeout(t)
  }, [toast])

  const showToast = (msg) => setToast(msg)

  return (
    <header className={`fixed top-0 inset-x-0 z-50 on-dark ${isDark ? "bg-black" : "bg-white border-b border-light-border"}`}>
      <div className="mx-auto max-w-7xl px-6 py-3 rounded-xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brandGradient"></div>
            <span className={`font-semibold tracking-tight ${isDark ? "text-clear" : "text-light-text-primary"}`}>XTechon Air</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {["/", "/flights", "/bookings/tools", "/flights/meta", "/about", "/contact"].map((p, i) => {
              const labels = ["Home", "Search Flights", "Booking Tools", "Flights Meta", "About", "Contact"]
              return (
                <NavLink key={p} to={p} className={({ isActive }) => `text-sm ${isActive ? "underline decoration-4 decoration-primary" : "hover:text-primary"}`}>
                  {labels[i]}
                </NavLink>
              )
            })}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="px-4 py-2 rounded-full border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:hover:bg-panelHover light:hover:bg-[#E8E9EB] transition-colors flex items-center gap-2 text-sm font-medium" title={isDark ? "Light mode" : "Dark mode"}>
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
            {!token && (
              <>
                <button onClick={() => setShowLogin(true)} className="px-4 py-2 rounded-full border border-hairline bg-transparent text-sm">Login</button>
                <button onClick={() => setShowSignup(true)} className="px-4 py-2 rounded-full text-white bg-brandGradient text-sm">Sign up</button>
              </>
            )}
            {token && (
              <>
                {balance !== null && (
                  <div className="glass px-3 py-1 rounded-full border border-hairline">
                    <span className="text-sm">₹{Number(balance).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="relative group">
                  <Link to="/history" className="flex items-center gap-2 px-3 py-1 rounded-full border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface text-sm dark:text-white light:text-light-text-primary hover:opacity-80 transition">
                    <div className="h-6 w-6 rounded-full bg-brandGradient"></div>
                    <span>{profile ? `${profile.first_name || "User"}` : "Account"}</span>
                  </Link>
                  <div className={`absolute right-0 mt-2 w-44 glass border dark:border-hairline light:border-light-border rounded-xl shadow-glass opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition ${isDark ? 'dark:hover:bg-[#222]' : 'light:hover:bg-[#E8E9EB]'}`}>
                    <Link to="/history" className={`block px-3 py-2 text-sm ${isDark ? 'hover:bg-[#222]' : 'light:hover:bg-[#E8E9EB]'} dark:text-white light:text-light-text-primary`}>Dashboard</Link>
                    <Link to="/wallet" className={`block px-3 py-2 text-sm ${isDark ? 'hover:bg-[#222]' : 'light:hover:bg-[#E8E9EB]'} dark:text-white light:text-light-text-primary`}>Wallet</Link>
                    <button onClick={clearToken} className={`block w-full text-left px-3 py-2 text-sm ${isDark ? 'hover:bg-[#222]' : 'light:hover:bg-[#E8E9EB]'} dark:text-white light:text-light-text-primary`}>Logout</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {showLogin && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/55">
          <div className={`w-full max-w-md rounded-2xl border dark:border-hairline light:border-light-border p-6 ${isDark ? 'bg-[#111118]' : 'bg-white'}`}>
            <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Welcome back</div>
            <div className="mt-4 space-y-3">
              <input value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="Email" className={`w-full px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:text-white light:text-light-text-primary dark:placeholder-textSecondary light:placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-primary`} />
              <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Password" className={`w-full px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:text-white light:text-light-text-primary dark:placeholder-textSecondary light:placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-primary`} />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button onClick={async () => { await login(); showToast("Logged in successfully") }} disabled={authLoading} className="px-5 py-3 rounded-xl text-white bg-brandGradient">{authLoading ? "Logging in..." : "Login"}</button>
              <button onClick={() => { setShowLogin(false); setShowSignup(true) }} className={`text-sm hover:underline ${isDark ? 'text-white' : 'text-light-text-primary'}`}> Dont have an account? Sign up</button>
            </div>
            <button onClick={() => setShowLogin(false)} className={`absolute top-4 right-4 px-3 py-1 rounded-full border dark:border-hairline light:border-light-border text-sm ${isDark ? 'hover:bg-[#222]' : 'light:hover:bg-[#E8E9EB]'} dark:text-white light:text-light-text-primary`}>Close</button>
          </div>
        </div>
      )}
      {showSignup && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/55">
          <div className={`w-full max-w-md rounded-2xl border dark:border-hairline light:border-light-border p-6 ${isDark ? 'bg-[#111118]' : 'bg-white'}`}>
            <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-light-text-primary'}`}>Create your account</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <input value={signupForm.first_name} onChange={(e) => setSignupForm({ ...signupForm, first_name: e.target.value })} placeholder="First name" className={`px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:text-white light:text-light-text-primary dark:placeholder-textSecondary light:placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-primary`} />
              <input value={signupForm.last_name} onChange={(e) => setSignupForm({ ...signupForm, last_name: e.target.value })} placeholder="Last name" className={`px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:text-white light:text-light-text-primary dark:placeholder-textSecondary light:placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-primary`} />
              <input value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} placeholder="Email" className={`col-span-2 px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:text-white light:text-light-text-primary dark:placeholder-textSecondary light:placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-primary`} />
              <input type="password" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} placeholder="Password" className={`col-span-2 px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:text-white light:text-light-text-primary dark:placeholder-textSecondary light:placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-primary`} />
              <input value={signupForm.phone} onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })} placeholder="Phone (optional)" className={`col-span-2 px-4 py-3 rounded-xl border dark:border-hairline light:border-light-border dark:bg-surface light:bg-light-surface dark:text-white light:text-light-text-primary dark:placeholder-textSecondary light:placeholder-light-text-secondary focus:outline-none focus:ring-2 focus:ring-primary`} />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button onClick={async () => { await signup(); showToast("Signed up successfully") }} disabled={authLoading} className="px-5 py-3 rounded-xl text-white bg-brandGradient">{authLoading ? "Signing up..." : "Sign up"}</button>
              <button onClick={() => { setShowSignup(false); setShowLogin(true) }} className="text-sm hover:underline dark:text-white light:text-light-text-primary">Already have an account? Login</button>
            </div>
            <button onClick={() => setShowSignup(false)} className={`absolute top-4 right-4 px-3 py-1 rounded-full border dark:border-hairline light:border-light-border text-sm ${isDark ? 'hover:bg-[#222]' : 'light:hover:bg-[#E8E9EB]'} dark:text-white light:text-light-text-primary`}>Close</button>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70]">
          <div className="toast glass border border-hairline px-4 py-2 rounded-xl shadow-glass">{toast}</div>
        </div>
      )}
    </header>
  )
}
