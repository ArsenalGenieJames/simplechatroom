import './MessageInput.css'

export default function MessageInput({
  messageBody,
  setMessageBody,
  handleSendMessage,
  handleMessageChange,
  sending,
  typingUsers,
}) {
  return (
    <>
      {/* Typing Indicator */}
      {typingUsers && typingUsers.length > 0 && (
        <div className="typing-indicator">
          <span>
            {typingUsers.map((u) => u.username || u.user_id).join(', ')}{' '}
            {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={messageBody}
          onChange={handleMessageChange}
          placeholder="Type a message..."
          className="message-input"
          disabled={sending}
        />
        <button
          type="submit"
          className="message-send-btn"
          disabled={sending || !messageBody.trim()}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </>
  )
}
