import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const COLORS = ['#0D9488', '#F59E0B', '#E11D48', '#8B5CF6', '#3B82F6', '#16A34A', '#EC4899']

function Analytics() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    supabase.from('transactions').select('*').then(({ data }) => {
      setTransactions(data || [])
    })
  }, [])

  // Totals
  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const savings = income - expenses
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0

  // Expenses by category (donut)
  const categoryTotals = {}
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount)
  })
  const pieData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
  const topCategory = pieData[0]

  // Monthly grouping (for line + bar)
  const monthMap = {}
  transactions.forEach((t) => {
    const d = new Date(t.date)
    const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
    if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expenses: 0, sort: d }
    if (t.type === 'income') monthMap[key].income += Number(t.amount)
    else monthMap[key].expenses += Number(t.amount)
  })
  const monthly = Object.values(monthMap).sort((a, b) => a.sort - b.sort)
  const avgMonthly = monthly.length > 0 ? Math.round(expenses / monthly.length) : 0

  const cards = [
    { label: 'Total income', value: income, color: 'text-green-600', sub: `${monthly.length} months` },
    { label: 'Total expenses', value: expenses, color: 'text-rose-600', sub: `${monthly.length} months` },
    { label: 'Net savings', value: savings, color: 'text-teal-600', sub: `${savingsRate}% savings rate` },
    { label: 'Avg monthly spend', value: avgMonthly, color: 'text-slate-800', sub: 'Per active month' },
  ]

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Analytics</h1>
        <p className="text-sm text-slate-500">Overview of your finances</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-xl font-semibold ${c.color}`}>Rs {c.value.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Donut */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Expenses by category</h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No expense data yet.</p>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                      {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `Rs ${Number(v).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {pieData.map((entry, i) => {
                    const pct = Math.round((entry.value / expenses) * 100)
                    return (
                      <div key={entry.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-slate-700">{entry.name}</span>
                        </div>
                        <span className="font-medium text-slate-800">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              {topCategory && (
                <p className="text-xs font-medium text-teal-600 mt-4">
                  {topCategory.name} is your biggest spend — {Math.round((topCategory.value / expenses) * 100)}% of expenses.
                </p>
              )}
            </>
          )}
        </div>

        {/* Line chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Income vs expenses trend</h3>
          {monthly.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthly}>
                <XAxis dataKey="month" fontSize={12} stroke="#94A3B8" />
                <YAxis fontSize={12} stroke="#94A3B8" />
                <Tooltip formatter={(v) => `Rs ${Number(v).toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expenses" stroke="#E11D48" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monthly spending bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-medium text-slate-700 mb-4">Monthly spending</h3>
        {monthly.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" fontSize={12} stroke="#94A3B8" />
              <YAxis fontSize={12} stroke="#94A3B8" />
              <Tooltip formatter={(v) => `Rs ${Number(v).toLocaleString()}`} />
              <Bar dataKey="expenses" fill="#0D9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default Analytics