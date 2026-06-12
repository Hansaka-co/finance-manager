import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Transactions from './Transactions'

function App() {
  const [session, setSession] = useState(null)

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
      <Transactions />
    </div>
  )
}

export default App