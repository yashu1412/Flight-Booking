import { useEffect, useState } from "react"
import api from "../lib/api.js"
import { useTheme } from "../context/ThemeContext.jsx"

export default function Wallet() {
  const { isDark } = useTheme()
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkAmount, setCheckAmount] = useState("")
  const [checkResult, setCheckResult] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [addAmount, setAddAmount] = useState("")
  const [addStatus, setAddStatus] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/wallet/balance")
      setBalance(data.data.wallet_balance)
      setTransactions([
        { id: 1, type: "credit", amount: 50000, desc: "Initial wallet credit", date: "2024-01-01" },
        { id: 2, type: "debit", amount: 5999, desc: "Flight booking MUM→DEL", date: "2024-01-05" },
        { id: 3, type: "credit", amount: 1000, desc: "Loyalty bonus", date: "2024-01-10" },
        { id: 4, type: "debit", amount: 8499, desc: "Flight booking BLR→GOA", date: "2024-01-12" }
      ])
    } catch {
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }

  const addFunds = async () => {
    const amount = Number(addAmount)
    if (amount <= 0) {
      setAddStatus({ ok: false, msg: "Amount must be greater than 0" })
      return
    }
    setAddStatus("pending")
    try {
      const newBalance = (balance || 0) + amount
      setBalance(newBalance)
      setTransactions([
        { id: Date.now(), type: "credit", amount, desc: `Added funds`, date: new Date().toISOString().split('T')[0] },
        ...transactions
      ])
      setAddAmount("")
      setAddStatus({ ok: true })
      setTimeout(() => setAddStatus(null), 3000)
    } catch (e) {
      setAddStatus({ ok: false, msg: e.response?.data?.message || "Failed to add funds" })
    }
  }

  useEffect(() => {
    load()
  }, [])

  const reset = async () => {
    await api.post("/wallet/reset")
    load()
  }

  const check = async () => {
    setCheckResult("pending")
    try {
      const { data } = await api.post("/wallet/check", { amount: Number(checkAmount || 0) })
      setCheckResult({ ok: true, sufficient: data.data.sufficient, available: data.data.available, required: data.data.required })
    } catch (e) {
      setCheckResult({ ok: false, msg: e.response?.data?.message || "Check failed" })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-8">
        <h1 className={`text-4xl font-bold ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Wallet</h1>
        <p className={`mt-2 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Manage your wallet balance and track transactions</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className={`rounded-xl border p-8 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className={`text-lg font-semibold ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Current Balance</div>
            <div className={`mt-4 text-5xl font-bold ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>
              {loading ? "—" : `₹${Number(balance || 0).toLocaleString("en-IN")}`}
            </div>
            <div className={`mt-4 flex flex-col gap-3`}>
              <button onClick={reset} className="px-4 py-2 rounded-xl text-white bg-brandGradient">Reset to ₹50,000</button>
              <button onClick={() => {}} className={`px-4 py-2 rounded-xl border ${isDark ? 'dark:border-hairline dark:bg-surface dark:text-white' : 'light:border-light-border light:bg-light-surface light:text-light-text-primary'}`}>View History</button>
            </div>
          </div>

          <div className={`mt-6 rounded-xl border p-6 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className={`font-semibold mb-4 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Quick Stats</div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className={isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}>Total Spent</span>
                <span className={`font-semibold ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>₹14,498</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}>Bookings</span>
                <span className={`font-semibold ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>2</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}>Bonus Credits</span>
                <span className={`font-semibold ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>₹1,000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className={`rounded-xl border p-8 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'} mb-8`}>
            <div className={`text-2xl font-semibold mb-6 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Add Funds</div>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <label className={`block text-sm mb-2 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Amount</label>
                <div className="relative">
                  <span className={`absolute left-3 top-3 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>₹</span>
                  <input type="number" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="Enter amount" className={`pl-8 pr-4 py-3 w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary ${isDark ? 'dark:border-hairline dark:bg-[#1a1a1f] dark:text-white' : 'light:border-light-border light:bg-[#f8f8f9] light:text-light-text-primary'}`} />
                </div>
              </div>
              <div className="flex items-end">
                <button onClick={addFunds} disabled={addStatus === "pending"} className="w-full px-4 py-3 rounded-xl text-white bg-brandGradient">Add Funds</button>
              </div>
            </div>
            {addStatus && addStatus !== "pending" && (
              <div className={`p-3 rounded-lg text-sm ${addStatus.ok ? 'dark:bg-green-900 dark:text-green-200 light:bg-green-100 light:text-green-800' : 'dark:bg-red-900 dark:text-red-200 light:bg-red-100 light:text-red-800'}`}>
                {addStatus.ok ? "✓ Funds added successfully!" : addStatus.msg}
              </div>
            )}
            <div className="mt-6 pt-6 border-t dark:border-hairline light:border-light-border">
              <div className={`font-semibold mb-4 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Quick Add</div>
              <div className="grid grid-cols-4 gap-2">
                {[1000, 5000, 10000, 25000].map(amt => (
                  <button key={amt} onClick={() => { setAddAmount(String(amt)); }} className={`px-3 py-2 rounded-lg text-sm border transition ${isDark ? 'dark:border-hairline dark:bg-[#1a1a1f] dark:text-textSecondary dark:hover:bg-[#222] dark:hover:text-white' : 'light:border-light-border light:bg-[#f8f8f9] light:text-light-text-secondary light:hover:bg-[#E8E9EB] light:hover:text-light-text-primary'}`}>
                    +₹{amt.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-8 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
            <div className={`text-2xl font-semibold mb-6 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Check Balance Sufficiency</div>
            <div className="flex gap-3 mb-6">
              <input type="number" value={checkAmount} onChange={(e) => setCheckAmount(e.target.value)} placeholder="Amount" className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary ${isDark ? 'dark:border-hairline dark:bg-[#1a1a1f] dark:text-white' : 'light:border-light-border light:bg-[#f8f8f9] light:text-light-text-primary'}`} />
              <button onClick={check} className="px-6 py-3 rounded-xl text-white bg-brandGradient">Check</button>
            </div>
            {checkResult && checkResult !== "pending" && (
              <div className={`p-4 rounded-lg ${checkResult.ok ? (checkResult.sufficient ? 'dark:bg-green-900 dark:text-green-200 light:bg-green-100 light:text-green-800' : 'dark:bg-yellow-900 dark:text-yellow-200 light:bg-yellow-100 light:text-yellow-800') : 'dark:bg-red-900 dark:text-red-200 light:bg-red-100 light:text-red-800'}`}>
                {checkResult.ok ? (
                  <div className="space-y-2">
                    <div className="font-semibold">{checkResult.sufficient ? "✓ Sufficient Balance" : "⚠ Insufficient Balance"}</div>
                    <div className="text-sm">Available: ₹{Number(checkResult.available).toLocaleString("en-IN")}</div>
                    <div className="text-sm">Required: ₹{Number(checkResult.required).toLocaleString("en-IN")}</div>
                  </div>
                ) : (
                  <div>{checkResult.msg}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className={`rounded-xl border p-8 ${isDark ? 'dark:bg-surface dark:border-hairline' : 'light:bg-light-surface light:border-light-border'}`}>
          <div className={`text-2xl font-semibold mb-6 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>Recent Transactions</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'dark:border-hairline' : 'light:border-light-border'}`}>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Description</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Type</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Amount</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.id} className={`border-b ${isDark ? 'dark:border-hairline hover:dark:bg-[#1a1a1f]' : 'light:border-light-border hover:light:bg-[#f8f8f9]'}`}>
                    <td className={`py-4 px-4 ${isDark ? 'dark:text-white' : 'light:text-light-text-primary'}`}>{txn.desc}</td>
                    <td className={`py-4 px-4`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${txn.type === 'credit' ? 'dark:bg-green-900 dark:text-green-200 light:bg-green-100 light:text-green-800' : 'dark:bg-red-900 dark:text-red-200 light:bg-red-100 light:text-red-800'}`}>
                        {txn.type === 'credit' ? '+ Credit' : '- Debit'}
                      </span>
                    </td>
                    <td className={`py-4 px-4 font-semibold ${txn.type === 'credit' ? 'dark:text-green-400 light:text-green-600' : 'dark:text-red-400 light:text-red-600'}`}>₹{Number(txn.amount).toLocaleString("en-IN")}</td>
                    <td className={`py-4 px-4 ${isDark ? 'dark:text-textSecondary' : 'light:text-light-text-secondary'}`}>{txn.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
