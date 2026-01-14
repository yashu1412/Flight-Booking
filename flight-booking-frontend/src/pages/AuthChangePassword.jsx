import { useState } from "react"
import api from "../lib/api.js"

export default function AuthChangePassword() {
  const [form, setForm] = useState({ current_password: "", new_password: "" })
  const [status, setStatus] = useState(null)
  const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setStatus("pending")
    try {
      const { data } = await api.put("/auth/change-password", form)
      setStatus({ ok: true, msg: data.message || "Password changed" })
    } catch (e) {
      setStatus({ ok: false, msg: e.response?.data?.message || "Failed to change password" })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="glass rounded-xl border border-hairline p-8 shadow-glass max-w-xl">
        <div className="text-2xl font-semibold">Change Password</div>
        <div className="mt-6 grid gap-4">
          <input type="password" value={form.current_password} onChange={(e) => onChange("current_password", e.target.value)} placeholder="Current password" className="px-4 py-3 rounded-xl border border-hairline bg-surface" />
          <input type="password" value={form.new_password} onChange={(e) => onChange("new_password", e.target.value)} placeholder="New password" className="px-4 py-3 rounded-xl border border-hairline bg-surface" />
        </div>
        <div className="mt-6">
          <button disabled={status === "pending"} onClick={submit} className="px-6 py-3 rounded-xl text-white bg-brandGradient">Update</button>
        </div>
        {status && status !== "pending" && <div className={`mt-3 text-sm ${status.ok ? "text-textSecondary" : "text-error"}`}>{status.msg}</div>}
      </div>
    </div>
  )
}
