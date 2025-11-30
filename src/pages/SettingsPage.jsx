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
  const [bio, setBio] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [typingIndicators, setTypingIndicators] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

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
        setBio(profile.bio || '')
        
        // Load settings from localStorage
        const savedNotifications = localStorage.getItem('notifications_enabled')
        const savedTyping = localStorage.getItem('typing_indicators_enabled')
        const savedSound = localStorage.getItem('sound_enabled')
        const savedDarkMode = localStorage.getItem('dark_mode')
        
        if (savedNotifications !== null) setNotifications(savedNotifications === 'true')
        if (savedTyping !== null) setTypingIndicators(savedTyping === 'true')
        if (savedSound !== null) setSoundEnabled(savedSound === 'true')
        if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true')
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
          username: username,
          bio: bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError
      
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Handle settings toggle
  const handleToggleNotifications = (enabled) => {
    setNotifications(enabled)
    localStorage.setItem('notifications_enabled', enabled)
  }

  const handleToggleTypingIndicators = (enabled) => {
    setTypingIndicators(enabled)
    localStorage.setItem('typing_indicators_enabled', enabled)
  }

  const handleToggleSound = (enabled) => {
    setSoundEnabled(enabled)
    localStorage.setItem('sound_enabled', enabled)
  }

  const handleToggleDarkMode = (enabled) => {
    setDarkMode(enabled)
    localStorage.setItem('dark_mode', enabled)
    // Apply dark mode (would need global theme implementation)
    if (enabled) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
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

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows="4"
              />
            </div>

            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>

        {/* Notification Settings */}
        <section className="settings-section">
          <h2>Notifications</h2>
          <div className="settings-toggle">
            <div className="toggle-item">
              <div className="toggle-info">
                <h3>Message Notifications</h3>
                <p>Get notified when you receive new messages</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => handleToggleNotifications(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h3>Sound Notifications</h3>
                <p>Play sound when messages arrive</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => handleToggleSound(e.target.checked)}
                  disabled={!notifications}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
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
                <h3>Dark Mode</h3>
                <p>Use dark theme for the app</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => handleToggleDarkMode(e.target.checked)}
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
              <strong>Email:</strong> {userProfile?.email || user?.email}
            </p>
            <p>
              <strong>User ID:</strong> {user?.id}
            </p>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </section>

        {/* App Info */}
        <section className="settings-section info-section">
          <h2>About</h2>
          <div className="info-content">
            <p>
              <strong>App Name:</strong> Simple Chat Room
            </p>
            <p>
              <strong>Version:</strong> 1.0.0
            </p>
            <p>
              <strong>Joined:</strong>{' '}
              {new Date(userProfile?.created_at).toLocaleDateString()}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
