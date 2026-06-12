import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  // Load transactions when the component first shows
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
    })

    if (!error) {
      setCategory('')
      setAmount('')
      setNote('')
      fetchTransactions()
    }
    setLoading(false)
  }

  async function deleteTransaction(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) fetchTransactions()
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Transactions</h2>

      <form onSubmit={addTransaction} className="bg-white rounded-xl border border-slate-200 p-4 mb-6 space-y-3">
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

        <input
          type="text"
          placeholder="Category (e.g. Food)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add transaction'}
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {transactions.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400">No transactions yet. Add your first one above.</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-slate-800">{t.category}</p>
                <p className="text-xs text-slate-400">{t.date}{t.note ? ` · ${t.note}` : ''}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'} Rs {Number(t.amount).toLocaleString()}
                </span>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="text-slate-300 hover:text-rose-500 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Transactions