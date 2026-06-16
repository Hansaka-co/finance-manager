import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { categoryStyle } from './categoryStyle'

function Dashboard({ session, setView }) {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [goals, setGoals] = useState([])

  useEffect(() => {
    supabase.from('transactions').select('*').order('date', { ascending: false })
      .then(({ data }) => setTransactions(data || []))
    supabase.from('budgets').select('*')
      .then(({ data }) => setBudgets(data || []))
    supabase.from('savings_goals').select('*')
      .then(({ data }) => setGoals(data || []))
  }, [])

  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expenses

  const categoryTotals = {}
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount)
  })
  const categoryCount = Object.keys(categoryTotals).length

  const monthMap = {}
  transactions.forEach((t) => {
    const d = new Date(t.date)
    const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
    if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expenses: 0, sort: d }
    if (t.type === 'income') monthMap[key].income += Number(t.amount)
    else monthMap[key].expenses += Number(t.amount)
  })
  const monthlyData = Object.values(monthMap).sort((a, b) => a.sort - b.sort)

  const recent = transactions.slice(0, 5)

  const cards = [
    { label: 'Total balance', value: balance, color: 'text-slate-800', sub: 'Income minus expenses' },
    { label: 'Income this month', value: income, color: 'text-green-600', sub: 'All income sources' },
    { label: 'Expenses this month', value: expenses, color: 'text-rose-600', sub: `Across ${categoryCount} categories` },
  ]

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Your finance overview</p>
        </div>
        <button
          onClick={() => setView('transactions')}
          className="bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700"
        >
          + Add transaction
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-2xl font-semibold ${c.color}`}>Rs {c.value.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Income vs expenses</h3>
          {monthlyData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" fontSize={12} stroke="#94A3B8" />
                <YAxis fontSize={12} stroke="#94A3B8" />
                <Tooltip formatter={(v) => `Rs ${Number(v).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="income" fill="#16A34A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#E11D48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-700">Recent transactions</h3>
            <button onClick={() => setView('transactions')} className="text-xs font-medium text-teal-600 hover:text-teal-700">
              View all
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((t) => {
                const s = categoryStyle(t.category)
                return (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                        style={{ backgroundColor: s.bg, color: s.text }}>
                        {s.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{t.note || t.category}</p>
                        <p className="text-xs text-slate-400">{t.date} · {t.category}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'} Rs {Number(t.amount).toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {budgets.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-700">Budgets</h3>
              <button onClick={() => setView('budgets')} className="text-xs font-medium text-teal-600 hover:text-teal-700">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {budgets.slice(0, 3).map((b) => {
                const spent = categoryTotals[b.category] || 0
                const pct = Math.min((spent / b.monthly_limit) * 100, 100)
                const over = spent > b.monthly_limit
                return (
                  <div key={b.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700">{b.category}</span>
                      <span className={over ? 'text-rose-600' : 'text-slate-500'}>
                        Rs {spent.toLocaleString()} / {Number(b.monthly_limit).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${over ? 'bg-rose-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {goals.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-700">Savings goals</h3>
              <button onClick={() => setView('goals')} className="text-xs font-medium text-teal-600 hover:text-teal-700">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {goals.slice(0, 3).map((g) => {
                const pct = Math.min((g.saved_amount / g.target_amount) * 100, 100)
                const done = g.saved_amount >= g.target_amount
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700">{g.name}</span>
                      <span className={done ? 'text-green-600 font-medium' : 'text-slate-500'}>{Math.round(pct)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${done ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard