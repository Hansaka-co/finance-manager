import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [spending, setSpending] = useState({})
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    // Get all budgets
    const { data: budgetData } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: true })

    // Get all expense transactions
    const { data: txData } = await supabase
      .from('transactions')
      .select('category, amount, type')
      .eq('type', 'expense')

    // Total spending per category
    const totals = {}
    if (txData) {
      for (const tx of txData) {
        totals[tx.category] = (totals[tx.category] || 0) + Number(tx.amount)
      }
    }

    setBudgets(budgetData || [])
    setSpending(totals)
  }

  async function addBudget(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('budgets').insert({
      category,
      monthly_limit: parseFloat(limit),
    })
    if (!error) {
      setCategory('')
      setLimit('')
      fetchData()
    }
    setLoading(false)
  }

  async function deleteBudget(id) {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (!error) fetchData()
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Budgets</h2>

      <form onSubmit={addBudget} className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Category (e.g. Food)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Monthly limit"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          required
          className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add'}
        </button>
      </form>

      <div className="space-y-3">
        {budgets.length === 0 ? (
          <p className="bg-white rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-400">
            No budgets yet. Set one above.
          </p>
        ) : (
            budgets.map((b) => {
            const spent = spending[b.category] || 0
            const pct = Math.min((spent / b.monthly_limit) * 100, 100)
            const ratio = spent / b.monthly_limit
            const over = ratio > 1
            const approaching = ratio >= 0.8 && ratio <= 1

            // Pick colors based on the three states
            const barColor = over ? 'bg-rose-500' : approaching ? 'bg-amber-500' : 'bg-teal-500'
            const borderColor = over ? 'border-rose-300' : 'border-slate-200'

            return (
              <div key={b.id} className={`bg-white rounded-xl border p-4 ${borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{b.category}</span>
                    {over && (
                      <span className="text-xs font-medium text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        Over budget
                      </span>
                    )}
                    {approaching && (
                      <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Approaching limit
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${over ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>
                      Rs {spent.toLocaleString()} / {Number(b.monthly_limit).toLocaleString()}
                    </span>
                    <button onClick={() => deleteBudget(b.id)} className="text-slate-300 hover:text-rose-500 text-sm">✕</button>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Budgets