import './ChatHeader.css'

export default function ChatHeader({
  selectedConversation,
  conversations,
  getConversationTitle,
}) {
  return (
    <div className="chat-header">
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
