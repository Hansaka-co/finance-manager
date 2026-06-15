import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Transactions from './Transactions'
import Budgets from './Budgets'
import Goals from './Goals'
import Analytics from './Analytics'
import Dashboard from './Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState('dashboard')

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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'goals', label: 'Goals' },
    { id: 'analytics', label: 'Analytics' },
  ]

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col fixed h-screen">
        <div className="px-6 py-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-semibold">F</div>
          <span className="font-semibold text-slate-800">Finance Manager</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                view === item.id
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-100">
          <p className="px-3 text-xs text-slate-400 mb-2 truncate">{session.user.email}</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60">
        {view === 'dashboard' && <Dashboard session={session} setView={setView} />}
        {view === 'transactions' && <Transactions />}
        {view === 'budgets' && <Budgets />}
        {view === 'goals' && <Goals />}
        {view === 'analytics' && <Analytics />}
      </main>
    </div>
  )
}

export default App