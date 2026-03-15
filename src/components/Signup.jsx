import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Sparkles, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import './Auth.css'

function Signup({ onToggle }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup, signInWithGoogle, signInWithApple } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    try {
      setError('')
      setMessage('')
      setLoading(true)
      await signup(email, password)
      setMessage('Account created! Verification email sent. Please check your inbox.')
    } catch (error) {
      setError('Failed to create account. Email may already be in use.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setError('')
      setLoading(true)
      await signInWithGoogle()
    } catch (error) {
      setError('Failed to sign in with Google.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    try {
      setError('')
      setLoading(true)
      await signInWithApple()
    } catch (error) {
      setError('Failed to sign in with Apple.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/setlogic-logo.png" alt="SetLogic" className="auth-logo" />
          <h2>Start Your Journey</h2>
          <p className="auth-subtitle">Create your account to unlock AI-powered fitness</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="auth-success">
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <Mail size={18} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={18} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={18} />
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="social-auth">
          <button className="social-btn google" onClick={handleGoogleSignIn} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Google
          </button>
          <button className="social-btn apple" onClick={handleAppleSignIn} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M14.94 5.19A4.38 4.38 0 0 0 13 3.52a6.13 6.13 0 0 1 1.93 5.62 5.45 5.45 0 0 1-3.5 4.54A3.1 3.1 0 0 1 9 14.85a3.1 3.1 0 0 1-2.4-1.17c-.9-1.17-1.3-2.67-1.1-4.09A5.43 5.43 0 0 1 8.93 5a4.6 4.6 0 0 0 1.27-1.86 4.62 4.62 0 0 0-1.84-.39 6.67 6.67 0 0 0-5.73 3.3 8.95 8.95 0 0 0 1.23 9.47 5.43 5.43 0 0 0 4.58 1.92 5.43 5.43 0 0 0 4.58-1.92 9 9 0 0 0 1.92-9.33z"/>
              <path d="M11.06 0a4.54 4.54 0 0 0-2.91 1.53 4.52 4.52 0 0 0-1.14 3.08 4.4 4.4 0 0 0 2.9-1.53A4.47 4.47 0 0 0 11.06 0z"/>
            </svg>
            Apple
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button onClick={onToggle} className="auth-toggle">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
