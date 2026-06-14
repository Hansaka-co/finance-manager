import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function Goals() {
  const [goals, setGoals] = useState([])
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
      setName('')
      setTarget('')
      setDeadline('')
      fetchGoals()
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Savings goals</h2>

      <form onSubmit={addGoal} className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Goal name (e.g. New laptop)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 min-w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Target amount"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
          className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add goal'}
        </button>
      </form>

      <div className="grid sm:grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <p className="bg-white rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-400 sm:col-span-2">
            No goals yet. Create one above.
          </p>
        ) : (
          goals.map((g) => {
            const pct = Math.min((g.saved_amount / g.target_amount) * 100, 100)
            const done = g.saved_amount >= g.target_amount
            return (
              <div key={g.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-800">{g.name}</span>
                  <span className={`text-xs font-medium ${done ? 'text-green-600' : 'text-slate-500'}`}>
                    {Math.round(pct)}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Rs {Number(g.saved_amount).toLocaleString()} of {Number(g.target_amount).toLocaleString()}
                  {g.deadline ? ` · by ${g.deadline}` : ''}
                </p>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${done ? 'bg-green-500' : 'bg-teal-500'}`}
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

export default Goals