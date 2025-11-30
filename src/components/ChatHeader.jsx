import './ChatHeader.css'

export default function ChatHeader({
  selectedConversation,
  conversations,
  getConversationTitle,
  onBackClick,
}) {
  return (
    <div className="chat-header">
      {onBackClick && (
        <button className="back-button" onClick={onBackClick} title="Back to conversations">
          ← Back
        </button>
      )}
      <h3>
        {conversations.find((c) => c.id === selectedConversation)
          ? getConversationTitle(
              conversations.find((c) => c.id === selectedConversation)
            )
          : 'Chat'}
      </h3>
    </div>
  )
}
