# Chat Application - Component Hierarchy

## Visual Structure

```
ChatPage (Main Container)
│
├─── Sidebar (.chat-sidebar)
│    │
│    ├─ Header (.chat-sidebar-header)
│    │
│    ├─ SearchBar Component
│    │  ├─ search-bar-container
│    │  ├─ search-input
│    │  └─ search-results (conditional)
│    │     └─ search-result-item (mapped)
│    │
│    ├─ ConversationsList Component (conditional)
│    │  └─ conversation-item (mapped)
│    │     ├─ conversation-title
│    │     ├─ unread-badge (conditional)
│    │     └─ conversation-date
│    │
│    └─ UserProfile Component
│       ├─ user-avatar
│       ├─ user-details
│       └─ btn-logout
│
└─── Main Chat Area (.chat-main)
     │
     ├─ ChatHeader Component (if selected)
     │  └─ h3 (conversation title)
     │
     ├─ MessagesList Component (if selected)
     │  └─ message (mapped)
     │     ├─ message-sender
     │     ├─ message-body
     │     └─ message-time
     │
     ├─ MessageInput Component (if selected)
     │  ├─ message-input
     │  └─ message-send-btn
     │
     └─ No-selection placeholder (if not selected)
```

## Component Data Flow

```
ChatPage (State Management)
    │
    ├─ conversations → ConversationsList
    ├─ selectedConversation → all components
    ├─ messages → MessagesList
    ├─ userProfile → UserProfile
    ├─ searchQuery → SearchBar
    ├─ searchResults → SearchBar
    ├─ messageBody → MessageInput
    └─ Callbacks: setSelectedConversation, handleSendMessage, handleSearch, etc.
```

## State Variables in ChatPage

```javascript
const [conversations, setConversations]           // All user conversations
const [selectedConversation, setSelectedConversation]  // Currently active chat
const [messages, setMessages]                    // Messages in current chat
const [messageBody, setMessageBody]              // Current message being typed
const [loading, setLoading]                      // Loading state
const [sending, setSending]                      // Message sending state
const [error, setError]                          // Error messages
const [unreadCounts, setUnreadCounts]            // Unread message counts per conversation
const [userProfile, setUserProfile]              // Current user's profile
const [searchQuery, setSearchQuery]              // Search input value
const [searchResults, setSearchResults]          // Search result users
const [allUsers, setAllUsers]                    // All users for search
const [showSearchResults, setShowSearchResults]  // Toggle between conversations and search
```

## File Dependencies

```
ChatPage.jsx
├── Imports SearchBar.jsx
├── Imports ConversationsList.jsx
├── Imports UserProfile.jsx
├── Imports ChatHeader.jsx
├── Imports MessagesList.jsx
├── Imports MessageInput.jsx
└── Imports ChatPage.css

SearchBar.jsx
└── Imports SearchBar.css

ConversationsList.jsx
└── Imports ConversationsList.css

UserProfile.jsx
├── Imports supabaseClient
└── Imports UserProfile.css

ChatHeader.jsx
└── Imports ChatHeader.css

MessagesList.jsx
└── Imports MessagesList.css

MessageInput.jsx
└── Imports MessageInput.css
```

## Styling Hierarchy

```
ChatPage.css (Main Layout)
├── .chat-container
├── .chat-sidebar
├── .chat-sidebar-header
├── .btn-new-chat
├── .chat-main
└── Media queries

SearchBar.css
├── .search-bar-container
├── .search-input
├── .search-results
└── .search-result-item

ConversationsList.css
├── .conversations-list
├── .conversation-item
├── .unread-badge
└── .conversation-date

UserProfile.css
├── .chat-sidebar-footer
├── .user-avatar
└── .btn-logout

ChatHeader.css
└── .chat-header

MessagesList.css
├── .messages-container
├── .message
└── .message-time

MessageInput.css
├── .message-form
├── .message-input
└── .message-send-btn
```

## Props Flowing Down

### SearchBar
```jsx
<SearchBar
  searchQuery={searchQuery}              // string
  handleSearch={handleSearch}            // function
  searchResults={searchResults}          // array
  showSearchResults={showSearchResults}  // boolean
  handleStartConversation={...}          // function
/>
```

### ConversationsList
```jsx
<ConversationsList
  conversations={conversations}          // array
  selectedConversation={...}             // string (ID)
  unreadCounts={unreadCounts}            // object
  onSelectConversation={...}             // function
  getConversationTitle={...}             // function
/>
```

### UserProfile
```jsx
<UserProfile 
  userProfile={userProfile}              // object
  user={user}                            // object (from auth)
/>
```

### ChatHeader
```jsx
<ChatHeader
  selectedConversation={...}             // string (ID)
  conversations={conversations}          // array
  getConversationTitle={...}             // function
/>
```

### MessagesList
```jsx
<MessagesList
  messages={messages}                    // array
  user={user}                            // object (from auth)
  selectedConversation={...}             // string (ID)
/>
```

### MessageInput
```jsx
<MessageInput
  messageBody={messageBody}              // string
  setMessageBody={setMessageBody}        // function
  handleSendMessage={...}                // function
  sending={sending}                      // boolean
/>
```

## Event Handlers in ChatPage

```javascript
handleSearch(query)                      // Filter users by search query
handleStartConversation(targetUserId)   // Create new DM or retrieve existing
handleSendMessage(e)                     // Send message to conversation
setSelectedConversation(id)              // Change active conversation
setMessageBody(text)                     // Update message input
```
