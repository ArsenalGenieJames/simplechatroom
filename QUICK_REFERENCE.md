# Quick Reference Guide

## Finding Things

### Want to track a specific feature?
- **Search functionality** → `src/components/SearchBar.jsx` + `SearchBar.css`
- **Conversation list** → `src/components/ConversationsList.jsx` + `ConversationsList.css`
- **Message display** → `src/components/MessagesList.jsx` + `MessagesList.css`
- **Message input** → `src/components/MessageInput.jsx` + `MessageInput.css`
- **User profile** → `src/components/UserProfile.jsx` + `UserProfile.css`
- **Chat header** → `src/components/ChatHeader.jsx` + `ChatHeader.css`
- **Main layout** → `src/pages/ChatPage.jsx` + `ChatPage.css`

## Editing Components

### To modify the search bar appearance:
1. Edit `src/components/SearchBar.css` for styling
2. Edit `src/components/SearchBar.jsx` for HTML structure

### To change conversation list style:
1. Edit `src/components/ConversationsList.css` for styling
2. Edit `src/components/ConversationsList.jsx` for logic

### To add new message features:
1. Edit `src/components/MessagesList.jsx` for display logic
2. Edit `src/components/MessagesList.css` for styling
3. Update ChatPage.jsx if adding new state

## Common Tasks

### Change search bar color
```css
/* In SearchBar.css */
.search-input:focus {
  border-color: YOUR_COLOR;
  box-shadow: 0 0 0 3px rgba(YOUR_R, YOUR_G, YOUR_B, 0.1);
}
```

### Modify message bubble style
```css
/* In MessagesList.css */
.message.sent {
  background-color: YOUR_COLOR;
}
```

### Add new component
1. Create `src/components/NewComponent.jsx`
2. Create `src/components/NewComponent.css`
3. Import in `ChatPage.jsx`: `import NewComponent from '../components/NewComponent'`
4. Add to JSX: `<NewComponent prop={value} />`

## File Locations Summary

| Feature | JSX File | CSS File |
|---------|----------|----------|
| Search Users | SearchBar.jsx | SearchBar.css |
| Conversations | ConversationsList.jsx | ConversationsList.css |
| Messages | MessagesList.jsx | MessagesList.css |
| Message Input | MessageInput.jsx | MessageInput.css |
| Chat Header | ChatHeader.jsx | ChatHeader.css |
| User Profile | UserProfile.jsx | UserProfile.css |
| Main Container | ChatPage.jsx | ChatPage.css |

## Component Props Quick Reference

```jsx
// SearchBar
<SearchBar 
  searchQuery={string}
  handleSearch={function}
  searchResults={array}
  showSearchResults={boolean}
  handleStartConversation={function}
/>

// ConversationsList
<ConversationsList
  conversations={array}
  selectedConversation={string}
  unreadCounts={object}
  onSelectConversation={function}
  getConversationTitle={function}
/>

// UserProfile
<UserProfile 
  userProfile={object}
  user={object}
/>

// ChatHeader
<ChatHeader
  selectedConversation={string}
  conversations={array}
  getConversationTitle={function}
/>

// MessagesList
<MessagesList
  messages={array}
  user={object}
  selectedConversation={string}
/>

// MessageInput
<MessageInput
  messageBody={string}
  setMessageBody={function}
  handleSendMessage={function}
  sending={boolean}
/>
```

## Responsive Design

Each component handles its own mobile responsiveness using media queries:
- **Desktop:** Full layout with 300px sidebar
- **Tablet (≤768px):** 100px narrow sidebar
- **Mobile (≤600px):** Bottom sidebar (70px height) with horizontal layout

## Performance Notes

- Components are separated to optimize re-renders
- Each component only re-renders when its props change
- Supabase real-time subscriptions are managed in ChatPage
- Search filtering happens locally in state

## Testing Changes

After editing any component:
1. CSS changes are reflected immediately
2. JSX changes need app reload
3. Check browser console for any errors
4. Verify responsive design at different screen sizes
