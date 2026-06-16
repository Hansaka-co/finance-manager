import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { categoryStyle } from './categoryStyle'

function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [spending, setSpending] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: budgetData } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: true })

    const { data: txData } = await supabase
      .from('transactions')
      .select('category, amount, type')
      .eq('type', 'expense')

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
      setCategory(''); setLimit(''); setShowModal(false)
      fetchData()
    }
    setLoading(false)
  }

  async function deleteBudget(id) {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (!error) fetchData()
  }

  // header totals
  const totalSpent = budgets.reduce((s, b) => s + (spending[b.category] || 0), 0)
  const totalLimit = budgets.reduce((s, b) => s + Number(b.monthly_limit), 0)

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Budgets</h1>
          <p className="text-sm text-slate-500">
            Rs {totalSpent.toLocaleString()} of Rs {totalLimit.toLocaleString()} used
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700"
        >
          + Add budget
        </button>
      </div>

      {/* Budget cards */}
      <div className="space-y-4">
        {budgets.map((b) => {
          const spent = spending[b.category] || 0
          const pct = Math.min((spent / b.monthly_limit) * 100, 100)
          const ratio = spent / b.monthly_limit
          const over = ratio > 1
          const approaching = ratio >= 0.8 && ratio <= 1
          const left = b.monthly_limit - spent
          const s = categoryStyle(b.category)

          const barColor = over ? 'bg-rose-500' : approaching ? 'bg-amber-500' : 'bg-teal-500'
          const borderColor = over ? 'border-rose-300' : 'border-slate-200'

          return (
            <div key={b.id} className={`bg-white rounded-xl border ${borderColor} p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    {s.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{b.category}</p>
                    <p className="text-xs text-slate-500">
                      Rs {spent.toLocaleString()} of Rs {Number(b.monthly_limit).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-start gap-3">
                  <div>
                    {over ? (
                      <span className="inline-block text-xs font-medium text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full mb-1">
                        Over budget
                      </span>
                    ) : (
                      <p className="text-xl font-semibold text-slate-800">{Math.round(ratio * 100)}%</p>
                    )}
                    <p className={`text-xs ${over ? 'text-rose-600' : approaching ? 'text-amber-600' : 'text-green-600'}`}>
                      {over
                        ? `Rs ${Math.abs(left).toLocaleString()} over`
                        : `Rs ${left.toLocaleString()} left`}
                    </p>
                  </div>
                  <button onClick={() => deleteBudget(b.id)} className="text-slate-300 hover:text-rose-500 text-sm">✕</button>
                </div>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}

        {/* Dashed add card */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-sm text-slate-400 hover:border-teal-300 hover:text-teal-600"
        >
          + Set a budget for another category
        </button>
      </div>

      {/* Add budget modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Add budget</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={addBudget} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <input type="text" placeholder="e.g. Food" value={category}
                  onChange={(e) => setCategory(e.target.value)} required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Monthly limit</label>
                <input type="number" step="0.01" placeholder="0.00" value={limit}
                  onChange={(e) => setLimit(e.target.value)} required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-teal-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                {loading ? 'Saving…' : 'Save budget'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Budgets