import { useState } from 'react'
import { supabase } from '../supabaseClient'
import './Auth.css'

export default function Login({ onSwitchToSignUp }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })

      if (signInError) {
        throw signInError
      }

      if (!authData.user) {
        throw new Error('Login failed. Please try again.')
      }

      // Fetch user profile from users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.warn('Could not fetch user profile:', profileError)
        // User auth exists but profile doesn't - this shouldn't happen normally
        // but we'll allow login anyway
      }

      setEmail('')
      setPassword('')
      // Auth state change will trigger redirect to chat
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message || 'Failed to login. Please check your credentials and try again.')
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
          <p className="auth-subtitle">Welcome back!</p>

          {/* Error Message */}
          {error && (
            <div className="auth-alert auth-alert-error">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                placeholder="your@email.com"
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Toggle */}
          <div className="auth-toggle">
            <p>
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="auth-link"
              >
                Sign up
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
