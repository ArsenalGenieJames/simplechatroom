import { supabase } from '../supabaseClient'
import './UserProfile.css'

export default function UserProfile({ userProfile, user }) {
  return (
    <div className="chat-sidebar-footer">
      <div className="user-info">
        <div className="user-avatar">
          {userProfile?.avatar_url ? (
            <img src={userProfile.avatar_url} alt={userProfile.username} />
          ) : (
            <span className="avatar-placeholder">
              {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>
        <div className="user-details">
          <div className="user-username">{userProfile?.username || 'User'}</div>
          <div className="user-email">{user?.email}</div>
        </div>
      </div>
      <button
        onClick={() => supabase.auth.signOut()}
        className="btn-logout"
      >
        Logout
      </button>
    </div>
  )
}
