import { supabase } from '../supabaseClient'
import './UserProfile.css'

export default function UserProfile({ userProfile, user }) {
  return (
    <div className="chat-sidebar-footer">
      <div className="user-info">
        <div className="user-avatar">
          {userProfile?.avatar_url ? (
            <img src={userProfile.avatar_url} alt={userProfile?.display_name || userProfile?.username || 'User'} />
          ) : (
            <span className="avatar-placeholder">
              {(userProfile?.display_name || userProfile?.username || 'U')?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="user-details">
          <div className="user-username">{userProfile?.display_name ? userProfile.display_name : (userProfile?.username || userProfile?.email || 'User')}</div>
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
