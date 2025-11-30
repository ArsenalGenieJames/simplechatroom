import { useState } from 'react'
import './ReplySection.css'

export default function ReplySection({
  messageId,
  replies = [],
  user,
  onSendReply,
  onExpandReplies,
  repliesLoading = false,
  isExpanded = false,
}) {
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return

    try {
      setIsSending(true)
      await onSendReply(messageId, replyText)
      setReplyText('')
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleToggleReplies = async () => {
    if (!isExpanded && replies.length === 0 && !repliesLoading) {
      await onExpandReplies(messageId)
    }
  }

  return (
    <div className="reply-section">
      {/* Reply Count */}
      {replies.length > 0 && (
        <button className="reply-count-btn" onClick={handleToggleReplies}>
          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
        </button>
      )}

      {/* Show Replies */}
      {isExpanded && (
        <div className="replies-list">
          {repliesLoading ? (
            <div className="replies-loading">Loading replies...</div>
          ) : replies.length === 0 ? (
            <div className="no-replies">No replies yet</div>
          ) : (
            replies.map((reply) => (
              <div
                key={reply.id}
                className={`reply ${
                  reply.sender_id === user?.id ? 'reply-sent' : 'reply-received'
                }`}
              >
                <div className="reply-sender">
                  {reply.users?.display_name || reply.users?.username || 'Unknown'}
                </div>
                <div className="reply-body">{reply.body}</div>
                <div className="reply-time">
                  {new Date(reply.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
