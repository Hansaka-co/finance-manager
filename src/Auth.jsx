import { useState } from 'react'
import { supabase } from './supabaseClient'

function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account, then log in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-teal-700 mb-1">Finance Manager</h1>
        <p className="text-sm text-slate-500 mb-6">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Please wait…' : isSignUp ? 'Sign up' : 'Log in'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-rose-600">{message}</p>
        )}

        <button
          onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
          className="mt-6 text-sm text-slate-500 hover:text-teal-600"
        >
          {isSignUp ? 'Already have an account? Log in' : "No account? Sign up"}
        </button>
      </div>
    </div>
  )
}

export default Auth