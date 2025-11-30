import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import './CreateGroupModal.css'

export default function CreateGroupModal({ user, allUsers, onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [users, setUsers] = useState([])

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: allUsersData, error: usersError } = await supabase
          .from('users')
          .select('id, username, display_name, avatar_url')
          .neq('id', user.id)

        if (usersError) throw usersError
        setUsers(allUsersData || [])
      } catch (error) {
        console.error('Error fetching users:', error)
        setError('Failed to load users')
      }
    }

    if (user) {
      fetchUsers()
    }
  }, [user])

  // Filter users based on search
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.display_name && u.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Toggle user selection
  const toggleUserSelection = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  // Handle group creation
  const handleCreateGroup = async (e) => {
    e.preventDefault()

    if (!groupName.trim()) {
      setError('Group name is required')
      return
    }

    if (selectedMembers.length === 0) {
      setError('Please select at least one member')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Create group conversation
      const { data: groupConversation, error: convError } = await supabase
        .from('conversations')
        .insert([
          {
            title: groupName,
            is_group: true,
            created_by: user.id,
          },
        ])
        .select()

      if (convError) throw convError

      const conversationId = groupConversation[0].id

      // Add creator as participant
      const participantsList = [
        { conversation_id: conversationId, user_id: user.id },
        ...selectedMembers.map((userId) => ({
          conversation_id: conversationId,
          user_id: userId,
        })),
      ]

      // Add all selected members
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert(participantsList)

      if (participantError) throw participantError

      // Call callback to refresh conversations
      if (onGroupCreated) {
        onGroupCreated(groupConversation[0])
      }

      onClose()
    } catch (error) {
      console.error('Error creating group:', error)
      setError(error.message || 'Failed to create group chat')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Group Chat</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateGroup}>
          {/* Error Message */}
          {error && <div className="modal-error">{error}</div>}

          {/* Group Name Input */}
          <div className="modal-form-group">
            <label htmlFor="group_name">Group Name *</label>
            <input
              id="group_name"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name (e.g., Project Team, Friends)"
              maxLength="50"
              disabled={loading}
            />
            <small>{groupName.length}/50</small>
          </div>

          {/* Members Search */}
          <div className="modal-form-group">
            <label htmlFor="search_members">Search Members</label>
            <input
              id="search_members"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or display name..."
              disabled={loading}
            />
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div className="selected-members">
              <h3>Selected Members ({selectedMembers.length})</h3>
              <div className="members-list">
                {selectedMembers.map((memberId) => {
                  const member = users.find((u) => u.id === memberId)
                  return (
                    <div key={memberId} className="member-chip">
                      <span>
                        {member?.display_name || member?.username}
                      </span>
                      <button
                        type="button"
                        className="chip-remove"
                        onClick={() => toggleUserSelection(memberId)}
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Available Members */}
          <div className="modal-form-group">
            <label>Add Members *</label>
            <div className="users-list">
              {filteredUsers.length === 0 ? (
                <div className="empty-users">
                  {searchQuery ? 'No users found' : 'No available users'}
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <label key={u.id} className="user-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(u.id)}
                      onChange={() => toggleUserSelection(u.id)}
                      disabled={loading}
                    />
                    <div className="user-info">
                      <span className="user-name">
                        {u.display_name || u.username}
                      </span>
                      <span className="user-username">@{u.username}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-create"
              disabled={loading || !groupName.trim() || selectedMembers.length === 0}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
