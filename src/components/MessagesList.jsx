import { useState } from 'react'
import ReplySection from './ReplySection'
import './MessagesList.css'

export default function MessagesList({
  messages,
  user,
  selectedConversation,
  replies = {},
  onSendReply,
  onExpandReplies,
  repliesLoading = {},
}) {
  const [expandedReplies, setExpandedReplies] = useState({})

  const toggleRepliesExpanded = (messageId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }))
  }

  return (
    <div className="messages-container">
      {messages.length === 0 ? (
        <div className="empty-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`message ${
              message.sender_id === user.id ? 'sent' : 'received'
            }`}
          >
            <div className="message-sender">
              {message.users?.display_name ? message.users.display_name : (message.users?.username || 'Unknown')}
            </div>
            <div className="message-body">{message.body}</div>
            <div className="message-time">
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>

            {/* Reply Section */}
            <ReplySection
              messageId={message.id}
              replies={replies[message.id] || []}
              user={user}
              onSendReply={onSendReply}
              onExpandReplies={() => {
                onExpandReplies(message.id)
                toggleRepliesExpanded(message.id)
              }}
              repliesLoading={repliesLoading[message.id]}
              isExpanded={expandedReplies[message.id] || false}
            />
          </div>
        ))
      )}
    </div>
  )
}
