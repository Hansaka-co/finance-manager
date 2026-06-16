import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { categoryStyle } from './categoryStyle'

const COLORS = ['#0D9488', '#F59E0B', '#E11D48', '#8B5CF6', '#3B82F6', '#16A34A']

function Dashboard({ session, setView }) {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])

  useEffect(() => {
    supabase.from('transactions').select('*').order('date', { ascending: false })
      .then(({ data }) => setTransactions(data || []))
    supabase.from('budgets').select('*')
      .then(({ data }) => setBudgets(data || []))
  }, [])

  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expenses

  const categoryTotals = {}
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount)
  })
  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))

  const recent = transactions.slice(0, 5)

  const cards = [
    { label: 'Current balance', value: balance, color: 'text-slate-800', bg: 'bg-white' },
    { label: 'Income', value: income, color: 'text-green-600', bg: 'bg-white' },
    { label: 'Expenses', value: expenses, color: 'text-rose-600', bg: 'bg-white' },
  ]

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back</p>
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
          <div key={c.label} className={`${c.bg} rounded-xl border border-slate-200 p-5`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-2xl font-semibold ${c.color}`}>Rs {c.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Expenses by category</h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No expenses yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                  {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Recent transactions</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const s = categoryStyle(t.category)
                      return (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                          style={{ backgroundColor: s.bg, color: s.text }}
                        >
                          {s.initials}
                        </div>
                      )
                    })()}
                    <div>
                      <p className="text-sm font-medium text-slate-800">{t.category}</p>
                      <p className="text-xs text-slate-400">{t.date}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-rose-600'}`}>
                    {t.type === 'income' ? '+' : '-'} Rs {Number(t.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {budgets.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mt-4">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Budgets</h3>
          <div className="space-y-3">
            {budgets.map((b) => {
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
    </div>
  )
}

export default Dashboard