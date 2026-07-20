import { useState } from 'react'
import { useAuth } from '../auth/useAuth'

function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)

    const { data, error: authError } =
      mode === 'sign-in' ? await signIn(email, password) : await signUp(email, password)

    setSubmitting(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (mode === 'sign-up' && !data.session) {
      setInfo('Check your email to confirm your account, then sign in.')
    }
  }

  const toggleMode = () => {
    setMode((current) => (current === 'sign-in' ? 'sign-up' : 'sign-in'))
    setError('')
    setInfo('')
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <h1>{mode === 'sign-in' ? 'Sign in to your account' : 'Create an account'}</h1>
      </section>

      <section className="panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="task-detail-field">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="task-detail-field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}

          <button type="submit" className="cta-button" disabled={submitting}>
            {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <button type="button" className="back-link" onClick={toggleMode}>
          {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </section>
    </main>
  )
}

export default LoginPage
