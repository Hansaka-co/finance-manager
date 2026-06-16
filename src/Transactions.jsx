import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { categoryStyle } from './categoryStyle'

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // form state
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
    if (!error) setTransactions(data)
  }

  async function addTransaction(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('transactions').insert({
      type,
      category,
      amount: parseFloat(amount),
      note,
      ...(date ? { date } : {}),
    })
    if (!error) {
      setCategory(''); setAmount(''); setNote(''); setDate('')
      setShowModal(false)
      fetchTransactions()
    }
    setLoading(false)
  }

  async function deleteTransaction(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) fetchTransactions()
  }

  // unique categories for the filter dropdown
  const categories = [...new Set(transactions.map((t) => t.category))]

  // apply filters
  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
    return true
  })

  function formatDate(d) {
    const date = new Date(d)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Transactions</h1>
          <p className="text-sm text-slate-500">{transactions.length} records</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700"
        >
          + Add transaction
        </button>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 bg-white"
        >
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex gap-1 bg-white border border-slate-300 rounded-lg p-1">
          {['all', 'income', 'expense'].map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize ${
                typeFilter === f ? 'bg-teal-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[100px_160px_1fr_140px_40px] gap-4 px-6 py-3 border-b border-slate-200 text-xs font-medium text-slate-400">
          <span>DATE</span>
          <span>CATEGORY</span>
          <span>NOTE</span>
          <span className="text-right">AMOUNT</span>
          <span></span>
        </div>

        {filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-400">No transactions match.</p>
        ) : (
          filtered.map((t) => {
            const s = categoryStyle(t.category)
            return (
              <div
                key={t.id}
                className="grid grid-cols-[100px_160px_1fr_140px_40px] gap-4 px-6 py-4 border-b border-slate-100 items-center last:border-0"
              >
                <span className="text-sm text-slate-700">{formatDate(t.date)}</span>
                <span>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    {t.category}
                  </span>
                </span>
                <span className="text-sm text-slate-500 truncate">{t.note || '—'}</span>
                <span className={`text-sm font-semibold text-right ${t.type === 'income' ? 'text-green-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'} Rs {Number(t.amount).toLocaleString()}
                </span>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="text-slate-300 hover:text-rose-500 text-sm text-center"
                >
                  ✕
                </button>
              </div>
            )
          })
        )}

        {filtered.length > 0 && (
          <p className="px-6 py-3 text-center text-xs text-slate-400">
            Showing {filtered.length} of {transactions.length}
          </p>
        )}
      </div>

      {/* Add transaction modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Add transaction</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={addTransaction} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium ${type === 'expense' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium ${type === 'income' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Amount</label>
                <input type="number" step="0.01" placeholder="0.00" value={amount}
                  onChange={(e) => setAmount(e.target.value)} required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <input type="text" placeholder="e.g. Food" value={category}
                  onChange={(e) => setCategory(e.target.value)} required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                <input type="date" value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Note (optional)</label>
                <input type="text" placeholder="Add a note" value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-teal-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                {loading ? 'Saving…' : 'Save transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions