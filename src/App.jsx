import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'

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
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-teal-700">You're logged in 🎉</h1>
      <p className="text-sm text-slate-500">{session.user.email}</p>
      <button
        onClick={() => supabase.auth.signOut()}
        className="bg-rose-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-rose-700"
      >
        Log out
      </button>
    </div>
  )
}

export default App