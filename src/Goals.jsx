import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { categoryStyle } from './categoryStyle'

function Goals() {
  const [goals, setGoals] = useState([])
  const [amounts, setAmounts] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  async function fetchGoals() {
    const { data } = await supabase
      .from('savings_goals')
      .select('*')
      .order('created_at', { ascending: true })
    setGoals(data || [])
  }

  async function addGoal(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('savings_goals').insert({
      name,
      target_amount: parseFloat(target),
      deadline: deadline || null,
    })
    if (!error) {
      setName(''); setTarget(''); setDeadline(''); setShowModal(false)
      fetchGoals()
    }
    setLoading(false)
  }

  async function addMoney(goal) {
    const extra = parseFloat(amounts[goal.id])
    if (!extra || extra <= 0) return
    const newSaved = Number(goal.saved_amount) + extra
    const { error } = await supabase
      .from('savings_goals')
      .update({ saved_amount: newSaved })
      .eq('id', goal.id)
    if (!error) {
      setAmounts({ ...amounts, [goal.id]: '' })
      fetchGoals()
    }
  }

  async function deleteGoal(id) {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (!error) fetchGoals()
  }

  function monthsLeft(deadline) {
    if (!deadline) return 'No deadline · ongoing'
    const now = new Date()
    const d = new Date(deadline)
    const months = Math.max(0, Math.round((d - now) / (1000 * 60 * 60 * 24 * 30)))
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    return `Deadline: ${label} · ${months} months left`
  }

  const totalSaved = goals.reduce((s, g) => s + Number(g.saved_amount), 0)

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Savings goals</h1>
          <p className="text-sm text-slate-500">
            Rs {totalSaved.toLocaleString()} saved across {goals.length} goal{goals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700"
        >
          + Add goal
        </button>
      </div>

      {/* Goal cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {goals.map((g) => {
          const pct = Math.min((g.saved_amount / g.target_amount) * 100, 100)
          const done = g.saved_amount >= g.target_amount
          const almost = pct >= 80 && !done
          const remaining = g.target_amount - g.saved_amount
          const s = categoryStyle(g.name)

          return (
            <div key={g.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    {s.initials}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-800">{g.name}</p>
                    <p className="text-xs text-slate-500">{monthsLeft(g.deadline)}</p>
                  </div>
                </div>
                <button onClick={() => deleteGoal(g.id)} className="text-slate-300 hover:text-rose-500 text-sm">✕</button>
              </div>

              <div className="flex items-end justify-between mb-1">
                <div>
                  <p className="text-2xl font-semibold text-slate-800">Rs {Number(g.saved_amount).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">of Rs {Number(g.target_amount).toLocaleString()} target</p>
                </div>
                <p className={`text-lg font-semibold ${done ? 'text-green-600' : 'text-teal-600'}`}>
                  {Math.round(pct)}%
                </p>
              </div>

              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div className={`h-full rounded-full ${done ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
              </div>

              {almost && (
                <p className="text-xs font-medium text-green-600 mb-3">
                  Almost there — Rs {remaining.toLocaleString()} to go!
                </p>
              )}

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={amounts[g.id] || ''}
                  onChange={(e) => setAmounts({ ...amounts, [g.id]: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  onClick={() => addMoney(g)}
                  className="bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700"
                >
                  + Add money
                </button>
              </div>
            </div>
          )
        })}

        {/* Dashed create card */}
        <button
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-teal-300 hover:text-teal-600 min-h-[200px]"
        >
          <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-xl">+</div>
          <p className="text-sm font-medium">Create a new savings goal</p>
          <p className="text-xs">Set a target and start saving</p>
        </button>
      </div>

      {/* Add goal modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Add goal</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={addGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Goal name</label>
                <input type="text" placeholder="e.g. New laptop" value={name}
                  onChange={(e) => setName(e.target.value)} required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Target amount</label>
                <input type="number" step="0.01" placeholder="0.00" value={target}
                  onChange={(e) => setTarget(e.target.value)} required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Deadline (optional)</label>
                <input type="date" value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-teal-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                {loading ? 'Saving…' : 'Save goal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Goals