import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ChatPage from './pages/ChatPage'
import InstallPrompt from './components/InstallPrompt'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('login') // 'login', 'signup', or 'chat'

  useEffect(() => {
    // Check if supabase is properly initialized
    if (!supabase) {
      console.error('Supabase not initialized')
      setLoading(false)
      return
    }

    // Check if user is logged in
    const { data } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user)
          setCurrentPage('chat')
        } else {
          setUser(null)
          setCurrentPage('login')
        }
        setLoading(false)
      }
    )

    return () => {
      data?.subscription?.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="app-loading">
        <p>Loading...</p>
      </div>
    )
  }

  if (user) {
    return (
      <div>
        <ChatPage user={user} />
        <InstallPrompt />
      </div>
    )
  }

  return (
    <>
      {currentPage === 'login' ? (
        <Login onSwitchToSignUp={() => setCurrentPage('signup')} />
      ) : (
        <SignUp onSwitchToLogin={() => setCurrentPage('login')} />
      )}
      <InstallPrompt />
    </>
  )
}

export default App
