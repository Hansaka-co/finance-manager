import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Transactions from './Transactions'
import Budgets from './Budgets'
import Goals from './Goals'
import Analytics from './Analytics'


function App() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState('transactions')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Auth />
  }

return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-teal-700">Finance Manager</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{session.user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-rose-600 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-rose-700"
          >
            Log out
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 px-6 flex gap-1">
        <button
          onClick={() => setView('transactions')}
          className={`px-4 py-3 text-sm font-medium border-b-2 ${view === 'transactions' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500'}`}
        >
          Transactions
        </button>
        <button
          onClick={() => setView('budgets')}
          className={`px-4 py-3 text-sm font-medium border-b-2 ${view === 'budgets' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500'}`}
        >
          Budgets
        </button>
        <button
          onClick={() => setView('goals')}
          className={`px-4 py-3 text-sm font-medium border-b-2 ${view === 'goals' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500'}`}
        >
          Goals
        </button>

        <button
          onClick={() => setView('analytics')}
          className={`px-4 py-3 text-sm font-medium border-b-2 ${view === 'analytics' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500'}`}
        >
          Analytics
        </button>
        
      </nav>

      {view === 'transactions' && <Transactions />}
      {view === 'budgets' && <Budgets />}
      {view === 'goals' && <Goals />}
      {view === 'analytics' && <Analytics />}

    </div>
  )
}

export default App