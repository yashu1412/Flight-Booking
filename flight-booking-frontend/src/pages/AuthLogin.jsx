import { useState } from "react"
import api from "../lib/api.js"
import { useNavigate } from "react-router-dom"

export default function AuthLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "" })
  const [status, setStatus] = useState(null)

  const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setStatus("pending")
    try {
      const { data } = await api.post("/auth/login", form)
      localStorage.setItem("token", data.data.token)
      setStatus({ ok: true })
      navigate("/auth/profile")
    } catch (e) {
      setStatus({ ok: false, msg: e.response?.data?.message || "Login failed" })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="glass rounded-xl border border-hairline p-8 shadow-glass max-w-xl">
        <div className="text-2xl font-semibold">Login</div>
        <div className="mt-6 grid gap-4">
          <input value={form.email} onChange={(e) => onChange("email", e.target.value)} placeholder="Email" className="px-4 py-3 rounded-xl border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="password" value={form.password} onChange={(e) => onChange("password", e.target.value)} placeholder="Password" className="px-4 py-3 rounded-xl border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button disabled={status === "pending"} onClick={submit} className="px-6 py-3 rounded-xl text-white bg-brandGradient">Login</button>
          <a href="/auth/register" className="px-6 py-3 rounded-xl border border-hairline bg-surface">Register</a>
        </div>
        {status && status !== "pending" && !status.ok && <div className="mt-3 text-error text-sm">{status.msg}</div>}
      </div>
    </div>
  )
}
