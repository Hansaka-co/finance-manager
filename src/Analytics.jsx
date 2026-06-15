import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const COLORS = ['#0D9488', '#F59E0B', '#E11D48', '#8B5CF6', '#3B82F6', '#16A34A']

function Analytics() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    supabase.from('transactions').select('*').then(({ data }) => {
      setTransactions(data || [])
    })
  }, [])

  // Totals
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const savings = income - expenses

  // Expenses by category (for pie)
  const categoryTotals = {}
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount)
    })
  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))

  // Income vs expenses (for bar)
  const barData = [
    { name: 'Income', amount: income },
    { name: 'Expenses', amount: expenses },
  ]

  const cards = [
    { label: 'Total income', value: income, color: 'text-green-600' },
    { label: 'Total expenses', value: expenses, color: 'text-rose-600' },
    { label: 'Net savings', value: savings, color: 'text-teal-600' },
  ]

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Analytics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-2xl font-semibold ${c.color}`}>
              Rs {c.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Expenses by category</h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No expense data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `Rs ${Number(v).toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Income vs expenses</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v) => `Rs ${Number(v).toLocaleString()}`} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={i === 0 ? '#16A34A' : '#E11D48'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Analytics