import './ConversationsList.css'

export default function ConversationsList({
  conversations,
  selectedConversation,
  unreadCounts,
  onSelectConversation,
  getConversationTitle,
}) {
  return (
    <div className="conversations-list">
      {conversations.length === 0 ? (
        <div className="empty-state">
          <p>No conversations yet</p>
        </div>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`conversation-item ${
              selectedConversation === conversation.id ? 'active' : ''
            } ${unreadCounts[conversation.id] > 0 ? 'unread' : ''}`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="conversation-content">
              <div className="conversation-title">
                {getConversationTitle(conversation)}
              </div>
              <div className="conversation-meta">
                {unreadCounts[conversation.id] > 0 && (
                  <span className="unread-badge">
                    {unreadCounts[conversation.id]} new
                  </span>
                )}
                <span className="conversation-date">
                  {new Date(conversation.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
