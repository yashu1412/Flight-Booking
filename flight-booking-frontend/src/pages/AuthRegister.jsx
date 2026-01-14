import { useState } from "react"
import api from "../lib/api.js"
import { useNavigate } from "react-router-dom"

export default function AuthRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", phone: "" })
  const [status, setStatus] = useState(null)

  const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setStatus("pending")
    try {
      const { data } = await api.post("/auth/register", form)
      localStorage.setItem("token", data.data.token)
      setStatus({ ok: true })
      navigate("/auth/profile")
    } catch (e) {
      setStatus({ ok: false, msg: e.response?.data?.message || "Registration failed" })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="glass rounded-xl border border-hairline p-8 shadow-glass max-w-xl">
        <div className="text-2xl font-semibold">Register</div>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <input value={form.first_name} onChange={(e) => onChange("first_name", e.target.value)} placeholder="First name" className="px-4 py-3 rounded-xl border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-primary" />
          <input value={form.last_name} onChange={(e) => onChange("last_name", e.target.value)} placeholder="Last name" className="px-4 py-3 rounded-xl border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-primary" />
          <input value={form.email} onChange={(e) => onChange("email", e.target.value)} placeholder="Email" className="px-4 py-3 rounded-xl border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-primary md:col-span-2" />
          <input type="password" value={form.password} onChange={(e) => onChange("password", e.target.value)} placeholder="Password" className="px-4 py-3 rounded-xl border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-primary md:col-span-2" />
          <input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="Phone (optional)" className="px-4 py-3 rounded-xl border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-primary md:col-span-2" />
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button disabled={status === "pending"} onClick={submit} className="px-6 py-3 rounded-xl text-white bg-brandGradient">Register</button>
          <a href="/auth/login" className="px-6 py-3 rounded-xl border border-hairline bg-surface">Login</a>
        </div>
        {status && status !== "pending" && !status.ok && <div className="mt-3 text-error text-sm">{status.msg}</div>}
      </div>
    </div>
  )
}
