import { useState, useEffect } from 'react'
import './InstallPrompt.css'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if app was previously installed (iOS)
    if (window.navigator.standalone === true) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Show our custom install prompt
      setShowPrompt(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if prompt was dismissed before (stored in localStorage)
    const promptDismissed = localStorage.getItem('installPromptDismissed')
    if (promptDismissed) {
      const dismissedTime = parseInt(promptDismissed, 10)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setShowPrompt(false)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptDismissed', Date.now().toString())
  }

  // Don't show if already installed or prompt not available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-icon">
          <span>💬</span>
        </div>
        <div className="install-prompt-text">
          <h3>Install Chat Room</h3>
          <p>Install our app for a better experience and quick access!</p>
        </div>
        <div className="install-prompt-actions">
          <button
            className="install-btn-primary"
            onClick={handleInstallClick}
          >
            Install
          </button>
          <button
            className="install-btn-secondary"
            onClick={handleDismiss}
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  )
}

