import { useEffect, useState, useSyncExternalStore } from 'react'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Signup from './components/Signup'

const subscribe = callback => {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}
const getHash = () => window.location.hash.slice(1)
const replaceRoute = path => window.location.replace(`#${path}`)

function Redirect({ to }) {
  useEffect(() => { replaceRoute(to) }, [to])
  return null
}

function AuthScreen({ children }) {
  return <div className="auth-container"><div className="auth-card">{children}</div></div>
}

function PasswordRecovery() {
  const { currentUser, updatePassword, finishRecovery } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await updatePassword(password)
      finishRecovery()
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthScreen>
      <h2>Reset password</h2>
      {currentUser ? (
        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="new-password">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" minLength={6}
              required value={password} onChange={event => setPassword(event.target.value)} />
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" disabled={saving}>Save password</button>
        </form>
      ) : (
        <>
          <p>Open the reset link in the browser where you requested it, or request a new link.</p>
          <button className="auth-back-btn" onClick={finishRecovery}>Back to sign in</button>
        </>
      )}
    </AuthScreen>
  )
}

export function AppRoutes({ routes, renderProtected }) {
  const defaultRoute = routes[0]
  const hash = useSyncExternalStore(subscribe, getHash)
  const [path, query] = hash.split('?')
  const { currentUser, configured, loading, recovering } = useAuth()
  const requested = new URLSearchParams(query).get('next')
  const next = routes.includes(requested) ? requested : defaultRoute
  const authQuery = `?next=${encodeURIComponent(next)}`
  const authRoute = path === '/login' || path === '/signup'

  if (!configured) return <AuthScreen><p>SetLogic sign-in is unavailable. Check the Supabase URL and publishable key.</p></AuthScreen>
  if (loading) return <AuthScreen><p role="status">Checking your session…</p></AuthScreen>
  if (recovering) return <PasswordRecovery />

  if (!currentUser) {
    if (path === '/signup') return <Signup onToggle={() => replaceRoute('/login' + authQuery)} />
    if (path === '/login') return <Login onToggle={() => replaceRoute('/signup' + authQuery)} />
    const target = routes.includes(path) ? path : defaultRoute
    return <Redirect to={`/login?next=${encodeURIComponent(target)}`} />
  }

  if (authRoute) return <Redirect to={next} />
  if (!routes.includes(path)) return <Redirect to={defaultRoute} />
  return renderProtected(path, currentUser.uid)
}
