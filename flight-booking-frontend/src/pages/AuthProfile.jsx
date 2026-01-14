import { useEffect, useState } from "react"
import api from "../lib/api.js"
import { useTheme } from "../context/ThemeContext.jsx"

export default function AuthProfile() {
  const { isDark } = useTheme()
  const [user, setUser] = useState(null)
  const [edit, setEdit] = useState(null)
  const [status, setStatus] = useState(null)
  const [errors, setErrors] = useState({})

  const load = async () => {
    try {
      const { data } = await api.get("/auth/profile")
      setUser(data.data.user)
      setEdit({ first_name: data.data.user.first_name, last_name: data.data.user.last_name, email: data.data.user.email, phone: data.data.user.phone })
    } catch {}
  }

  useEffect(() => { 
    load() 
  }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const save = async () => {
    const newErrors = {}
    if (!edit.first_name.trim()) newErrors.first_name = "First name is required"
    if (!edit.last_name.trim()) newErrors.last_name = "Last name is required"
    if (!edit.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(edit.email)) newErrors.email = "Invalid email"
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setStatus("pending")
    try {
      const { data } = await api.put("/auth/profile", edit)
      setUser(data.data.user)
      setStatus({ ok: true })
      setTimeout(() => setStatus(null), 3000)
    } catch (e) {
      setStatus({ ok: false, msg: e.response?.data?.message || "Update failed" })
    }
  }

  return (
    <div className={`max-w-7xl mx-auto px-6 py-6`}>
      <div className="mb-8">
        <h1 className={`text-4xl font-bold ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>My Profile</h1>
        <p className={`mt-2 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Manage your account information and preferences</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className={`rounded-xl border p-8 mb-8 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className={`text-2xl font-semibold mb-6 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Personal Information</div>
            {user ? (
              <>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className={`block text-sm mb-2 font-semibold ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>First Name *</label>
                    <input 
                      value={edit.first_name} 
                      onChange={(e) => { setEdit(s => ({ ...s, first_name: e.target.value })); if (errors.first_name) setErrors({...errors, first_name: ''}) }} 
                      className={`px-4 py-3 rounded-xl border w-full focus:outline-none focus:ring-2 focus:ring-primary ${isDark ? 'dark:border-hairline dark:bg-[#1a1a1f] dark:text-white' : 'light:border-light-border light:bg-[#f8f8f9] light:text-light-text-primary'}`} 
                    />
                    {errors.first_name && <div className={`text-xs mt-1 ${isDark ? 'dark:text-error' : 'light:text-error'}`}>{errors.first_name}</div>}
                  </div>
                  <div>
                    <label className={`block text-sm mb-2 font-semibold ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Last Name *</label>
                    <input 
                      value={edit.last_name} 
                      onChange={(e) => { setEdit(s => ({ ...s, last_name: e.target.value })); if (errors.last_name) setErrors({...errors, last_name: ''}) }} 
                      className={`px-4 py-3 rounded-xl border w-full focus:outline-none focus:ring-2 focus:ring-primary ${isDark ? 'dark:border-hairline dark:bg-[#1a1a1f] dark:text-white' : 'light:border-light-border light:bg-[#f8f8f9] light:text-light-text-primary'}`} 
                    />
                    {errors.last_name && <div className={`text-xs mt-1 ${isDark ? 'dark:text-error' : 'light:text-error'}`}>{errors.last_name}</div>}
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm mb-2 font-semibold ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Email *</label>
                    <input 
                      value={edit.email} 
                      onChange={(e) => { setEdit(s => ({ ...s, email: e.target.value })); if (errors.email) setErrors({...errors, email: ''}) }} 
                      className={`px-4 py-3 rounded-xl border w-full focus:outline-none focus:ring-2 focus:ring-primary ${isDark ? 'dark:border-hairline dark:bg-[#1a1a1f] dark:text-white' : 'light:border-light-border light:bg-[#f8f8f9] light:text-light-text-primary'}`} 
                    />
                    {errors.email && <div className={`text-xs mt-1 ${isDark ? 'dark:text-error' : 'light:text-error'}`}>{errors.email}</div>}
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm mb-2 font-semibold ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Phone</label>
                    <input 
                      value={edit.phone || ""} 
                      onChange={(e) => setEdit(s => ({ ...s, phone: e.target.value }))} 
                      className={`px-4 py-3 rounded-xl border w-full focus:outline-none focus:ring-2 focus:ring-primary ${isDark ? 'dark:border-hairline dark:bg-[#1a1a1f] dark:text-white' : 'light:border-light-border light:bg-[#f8f8f9] light:text-light-text-primary'}`} 
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button disabled={status === "pending"} onClick={save} className="px-6 py-3 rounded-xl text-white bg-brandGradient">Save Changes</button>
                  <button className={`px-6 py-3 rounded-xl border ${isDark ? 'dark:border-hairline dark:bg-surface dark:text-white' : 'light:border-light-border light:bg-light-surface light:text-light-text-primary'}`}>Cancel</button>
                </div>
                {status && status !== "pending" && status.ok && <div className={`mt-4 p-3 rounded-lg text-sm dark:bg-green-900 dark:text-green-200 light:bg-green-100 light:text-green-800`}>✓ Profile updated successfully</div>}
                {status && status !== "pending" && !status.ok && <div className={`mt-4 p-3 rounded-lg text-sm dark:bg-red-900 dark:text-red-200 light:bg-red-100 light:text-red-800`}>{status.msg}</div>}
              </>
            ) : (
              <div className={`${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Load profile after login</div>
            )}
          </div>

          <div className={`rounded-xl border p-8 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className={`text-2xl font-semibold mb-6 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Security</div>
            <div className={`mb-6 p-4 rounded-lg ${isDark ? 'dark:bg-[#1a1a1f]' : 'light:bg-[#f8f8f9]'}`}>
              <div className={`font-semibold mb-2 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Change Password</div>
              <p className={`text-sm mb-4 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Update your password regularly to keep your account secure.</p>
              <a href="/auth/change-password" className="inline-flex px-4 py-2 rounded-lg text-white bg-brandGradient">Change Password</a>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'dark:bg-[#1a1a1f]' : 'light:bg-[#f8f8f9]'}`}>
              <div className={`font-semibold mb-2 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Two-Factor Authentication</div>
              <p className={`text-sm ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Add an extra layer of security to your account (Coming Soon)</p>
            </div>
          </div>
        </div>

        <div>
          <div className={`rounded-xl border p-6 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className={`text-lg font-semibold mb-4 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Account Overview</div>
            <div className="space-y-4">
              <div>
                <div className={`text-xs font-semibold mb-1 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>ROLE</div>
                <div className={`text-sm ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>{user?.role || "—"}</div>
              </div>
              <div>
                <div className={`text-xs font-semibold mb-1 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>WALLET BALANCE</div>
                <div className={`text-sm font-semibold ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>₹{user?.wallet_balance ?? "—"}</div>
              </div>
              <div className={`pt-4 border-t ${isDark ? 'dark:border-hairline' : 'light:border-light-border'}`}>
                <div className={`text-xs font-semibold mb-1 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>MEMBER SINCE</div>
                <div className={`text-sm ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>January 2024</div>
              </div>
              <div>
                <div className={`text-xs font-semibold mb-1 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>TOTAL BOOKINGS</div>
                <div className={`text-sm ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>12 bookings</div>
              </div>
            </div>
          </div>

          <div className={`mt-6 rounded-xl border p-6 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className={`text-lg font-semibold mb-4 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Quick Actions</div>
            <div className="space-y-2">
              <button className={`w-full px-4 py-2 rounded-lg text-sm border transition ${isDark ? 'dark:border-hairline dark:bg-[#1a1a1f] dark:text-white dark:hover:bg-[#222]' : 'light:border-light-border light:bg-[#f8f8f9] light:text-light-text-primary light:hover:bg-[#E8E9EB]'}`}>
                View Bookings
              </button>
              <button className={`w-full px-4 py-2 rounded-lg text-sm border transition ${isDark ? 'dark:border-hairline dark:bg-[#1a1a1f] dark:text-white dark:hover:bg-[#222]' : 'light:border-light-border light:bg-[#f8f8f9] light:text-light-text-primary light:hover:bg-[#E8E9EB]'}`}>
                Check Wallet
              </button>
              <button className={`w-full px-4 py-2 rounded-lg text-sm border transition ${isDark ? 'dark:border-hairline dark:bg-[#1a1a1f] dark:text-white dark:hover:bg-[#222]' : 'light:border-light-border light:bg-[#f8f8f9] light:text-light-text-primary light:hover:bg-[#E8E9EB]'}`}>
                Download History
              </button>
            </div>
          </div>

          <div className={`mt-6 rounded-xl border p-6 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className={`text-lg font-semibold mb-3 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Preferences</div>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 cursor-pointer`}>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className={`text-sm ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Email notifications</span>
              </label>
              <label className={`flex items-center gap-3 cursor-pointer`}>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className={`text-sm ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Booking alerts</span>
              </label>
              <label className={`flex items-center gap-3 cursor-pointer`}>
                <input type="checkbox" className="w-4 h-4" />
                <span className={`text-sm ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Marketing emails</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

