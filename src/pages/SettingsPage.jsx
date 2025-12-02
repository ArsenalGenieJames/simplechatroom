import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import './SettingsPage.css'

export default function SettingsPage({ user, onBack }) {
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Settings state
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [typingIndicators, setTypingIndicators] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [midnightMode, setMidnightMode] = useState(false)

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        
        setUserProfile(profile)
        setDisplayName(profile.display_name || '')
        setUsername(profile.username || '')
        
        // Load settings from localStorage
        const savedTyping = localStorage.getItem('typing_indicators_enabled')
        const savedSound = localStorage.getItem('sound_enabled')
        const savedMidnightMode = localStorage.getItem('midnight_mode')
        
        if (savedTyping !== null) setTypingIndicators(savedTyping === 'true')
        if (savedSound !== null) setSoundEnabled(savedSound === 'true')
        if (savedMidnightMode !== null) setMidnightMode(savedMidnightMode === 'true')
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchUserProfile()
    }
  }, [user])

  // Handle profile update
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          display_name: displayName,
        })
        .eq('id', user.id)

      if (updateError) throw updateError
      
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      console.error('Full error details:', error.message)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Handle settings toggle
  const handleToggleTypingIndicators = (enabled) => {
    setTypingIndicators(enabled)
    localStorage.setItem('typing_indicators_enabled', enabled)
  }

  const handleToggleSound = (enabled) => {
    setSoundEnabled(enabled)
    localStorage.setItem('sound_enabled', enabled)
  }

  const handleToggleMidnightMode = (enabled) => {
    setMidnightMode(enabled)
    localStorage.setItem('midnight_mode', enabled)
    // Apply midnight mode with brand color gradient
    if (enabled) {
      document.body.classList.add('midnight-mode')
    } else {
      document.body.classList.remove('midnight-mode')
    }
  }

  // Handle logout
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await supabase.auth.signOut()
        window.location.href = '/login'
      } catch (error) {
        console.error('Error logging out:', error)
        setError('Failed to logout')
      }
    }
  }

  if (loading) {
    return (
      <div className="settings-loading">
        <p>Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="settings-container">
      {/* Settings Header */}
      <div className="settings-header">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <h1>Settings</h1>
      </div>

      {/* Error & Success Messages */}
      {error && <div className="settings-error">{error}</div>}
      {success && <div className="settings-success">{success}</div>}

      {/* Settings Content */}
      <div className="settings-content">
        {/* User Profile Card */}
        <section className="settings-section user-profile-card">
          <div className="user-card-container">
            <div className="user-card-avatar-wrapper">
              <div className="user-card-avatar">
                <span className="avatar-placeholder">
                  {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="user-card-info">
              <div className="user-card-name">{userProfile?.display_name || userProfile?.username || 'User'}</div>
              <div className="user-card-username">@{userProfile?.username || 'username'}</div>
              <div className="user-card-email">{user?.email}</div>
            </div>
          </div>
        </section>

        {/* Profile Section */}
        <section className="settings-section">
          <h2>Profile Settings</h2>
          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="form-group">
              <label htmlFor="display_name">Display Name</label>
              <input
                id="display_name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                disabled
              />
              <small>Username cannot be changed</small>
            </div>

            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>

        {/* Chat Settings */}
        <section className="settings-section">
          <h2>Chat Settings</h2>
          <div className="settings-toggle">
            <div className="toggle-item">
              <div className="toggle-info">
                <h3>Typing Indicators</h3>
                <p>Show when you're typing</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={typingIndicators}
                  onChange={(e) => handleToggleTypingIndicators(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* Appearance Settings */}
        <section className="settings-section">
          <h2>Appearance</h2>
          <div className="settings-toggle">
            <div className="toggle-item">
              <div className="toggle-info">
                <h3>Midnight Mode</h3>
                <p>Beautiful dark theme with brand gradient</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={midnightMode}
                  onChange={(e) => handleToggleMidnightMode(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="settings-section account-section">
          <h2>Account</h2>
          <div className="account-info">
            <p>
              <strong>Joined:</strong>{' '}
              {new Date(userProfile?.created_at).toLocaleDateString()}
            </p>
            <p>
              <strong>User ID:</strong> {user?.id}
            </p>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </section>
      </div>
    </div>
  )
}
