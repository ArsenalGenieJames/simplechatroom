import { useState } from 'react'
import { supabase } from '../supabaseClient'
import './Auth.css'

export default function SignUp({ onSwitchToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate username length only
      if (username.length < 3 || username.length > 50) {
        throw new Error('Username must be between 3 and 50 characters')
      }

      // Check if username already exists
      const { data: existingUsername } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase().trim())
        .single()

      if (existingUsername) {
        throw new Error('Username already taken. Please choose another one.')
      }

      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (existingEmail) {
        throw new Error('Email already registered. Please login or use a different email.')
      }

      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
      })

      if (signUpError) {
        throw signUpError
      }

      if (!authData.user) {
        throw new Error('Failed to create account. Please try again.')
      }

      // Create user profile in the users table
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          username: username.toLowerCase().trim(),
          display_name: displayName.trim() || username.trim(),
          email: email.toLowerCase().trim(),
        },
      ])

      if (dbError) {
        console.error('Database error:', dbError)
        // Attempt to delete auth user if profile creation fails
        try {
          await supabase.auth.admin.deleteUser(authData.user.id)
        } catch (deleteError) {
          console.error('Could not delete auth user:', deleteError)
        }
        throw new Error(`Failed to create user profile: ${dbError.message}`)
      }

      setSuccess('Account created successfully! Redirecting to chat...')
      setEmail('')
      setPassword('')
      setUsername('')
      setDisplayName('')
      
      setTimeout(() => {
        // Auto-login the user after account creation
        supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        }).then(({ error }) => {
          if (error) {
            // If auto-login fails, redirect to login page
            onSwitchToLogin()
          }
          // If successful, auth state change will trigger redirect to chat automatically
        })
      }, 1500)
    } catch (error) {
      console.error('SignUp error:', error)
      setError(error.message || 'An error occurred during sign up. Please try again.')
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
          <p className="auth-subtitle">Join our community!</p>

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
          <form onSubmit={handleSignUp} className="auth-form">
            <div className="auth-form-row">
              <div className="auth-form-group">
                <label className="auth-label">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="auth-input"
                  placeholder="Choose a username"
                  minLength="3"
                  maxLength="50"
                />
                <small className="auth-hint">3-50 characters</small>
              </div>

              <div className="auth-form-group">
                <label className="auth-label">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="auth-input"
                  placeholder="Your display name"
                  maxLength="100"
                />
                <small className="auth-hint">Optional (max 100 characters)</small>
              </div>
            </div>

            <div className="auth-form-row">
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
                <small className="auth-hint">Enter your password</small>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Toggle */}
          <div className="auth-toggle">
            <p>
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="auth-link"
              >
                Login
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
