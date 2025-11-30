import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import './Auth.css'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Load and apply midnight mode on mount
  useEffect(() => {
    const savedMidnightMode = localStorage.getItem('midnight_mode')
    if (savedMidnightMode === 'true') {
      document.body.classList.add('midnight-mode')
    } else {
      document.body.classList.remove('midnight-mode')
    }
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setSuccess('Login successful!')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm.')
      }
      setEmail('')
      setPassword('')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          {/* Header */}
          <h1 className="auth-title">Chat Room</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Welcome back!' : 'Join our community!'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="auth-alert auth-alert-error">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="auth-alert auth-alert-success">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                placeholder="your@email.com"
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          {/* Toggle */}
          <div className="auth-toggle">
            <p>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                  setSuccess(null)
                  setEmail('')
                  setPassword('')
                }}
                className="auth-link"
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="auth-footer">
          © 2025 Chat Room. All rights reserved.
        </p>
      </div>
    </div>
  )
}
