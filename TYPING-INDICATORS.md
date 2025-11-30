# Typing Indicators Implementation Guide

## Overview
Typing indicators show real-time feedback when other users are actively typing in a conversation. This feature uses Supabase broadcast channels for instant communication between users without database writes.

## How It Works

### 1. **Typing Detection**
When a user types in the message input field, the `handleMessageChange` function:
- Detects input changes
- Broadcasts a "user_typing" event if message length > 0
- Sets a 3-second timeout to broadcast "user_stopped_typing"

### 2. **Broadcasting**
Supabase broadcast channels are used for real-time typing events:
- **Channel**: `typing:{conversationId}`
- **Events**:
  - `user_typing` - User is actively typing
  - `user_stopped_typing` - User stopped typing or sent message

### 3. **Receiving & Display**
When typing events are received:
- Other users' typing status is stored in `typingUsers` state array
- UI displays animated typing indicator with user names
- Indicator disappears when user sends message or stops typing (3-second timeout)

### 4. **Clearing on Send**
When a message is sent:
- Typing indicator is cleared immediately
- `user_stopped_typing` broadcast is sent
- All typing state is reset

## Code Structure

### State Variables (ChatPage.jsx)
```javascript
const [typingUsers, setTypingUsers] = useState([])        // Array of users currently typing
const [typingTimeout, setTypingTimeout] = useState(null)  // Timeout ID for auto-stop
```

### Key Functions

#### handleMessageChange (ChatPage.jsx)
Detects input changes and broadcasts typing events:
```javascript
const handleMessageChange = (e) => {
  const value = e.target.value
  setMessageBody(value)
  
  if (selectedConversation && user && value.trim().length > 0) {
    // Broadcast typing event
    supabase
      .channel(`typing:${selectedConversation}`)
      .send({
        type: 'broadcast',
        event: 'user_typing',
        payload: {
          user_id: user.id,
          username: userProfile?.username,
          conversation_id: selectedConversation,
        },
      })
      .catch((err) => console.error('Failed to send typing event:', err))
    
    // Clear previous timeout
    if (typingTimeout) clearTimeout(typingTimeout)
    
    // Set new timeout for auto-stop (3 seconds of inactivity)
    const timeout = setTimeout(() => {
      supabase
        .channel(`typing:${selectedConversation}`)
        .send({
          type: 'broadcast',
          event: 'user_stopped_typing',
          payload: {
            user_id: user.id,
            conversation_id: selectedConversation,
          },
        })
        .catch((err) => console.error('Failed to send typing stop:', err))
    }, 3000)
    
    setTypingTimeout(timeout)
  }
}
```

#### Typing Channel Subscription (ChatPage.jsx)
Listens for typing events from other users:
```javascript
const typingChannel = supabase
  .channel(`typing:${selectedConversation}`)
  .on('broadcast', { event: 'user_typing' }, (payload) => {
    setTypingUsers((prev) => {
      const exists = prev.some((u) => u.user_id === payload.payload.user_id)
      return exists ? prev : [...prev, payload.payload]
    })
  })
  .on('broadcast', { event: 'user_stopped_typing' }, (payload) => {
    setTypingUsers((prev) =>
      prev.filter((u) => u.user_id !== payload.payload.user_id)
    )
  })
  .subscribe()
```

### UI Component (MessageInput.jsx)
Displays typing indicator when users are typing:
```jsx
{typingUsers.length > 0 && (
  <div className="typing-indicator">
    <div className="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <span className="typing-text">
      {typingUsers.map((u) => u.username).join(', ')} typing...
    </span>
  </div>
)}
```

### Styling (MessageInput.css)
Animated typing indicator with bouncing dots:
```css
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #666;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.5;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-10px);
  }
}
```

## Feature Behavior

### User A Types
1. User A starts typing in message input
2. `handleMessageChange` fires on each keystroke
3. `user_typing` broadcast sent (with throttling via timeout)
4. After 3 seconds of inactivity, `user_stopped_typing` broadcast sent

### User B Receives
1. User B's `typingChannel` subscription receives broadcasts
2. User A added to `typingUsers` state
3. Typing indicator appears: "user_a typing..."
4. Animated dots bounce continuously
5. When User A sends message or stops typing, indicator disappears

### Message Send Clears Typing
1. User sends message
2. `handleSendMessage` immediately:
   - Clears messageBody
   - Clears typingUsers state
   - Sends `user_stopped_typing` broadcast
   - Cancels pending timeout
3. All users see indicator disappear instantly

## Multi-User Scenarios

### Multiple Users Typing
- Each user's entry added to `typingUsers` array
- Display: "alice, bob, charlie typing..."
- Each user gets their own broadcast channel subscription

### Typing in Different Conversations
- Channel names include conversation ID: `typing:{conversationId}`
- Typing in one conversation doesn't affect others
- User can type in multiple conversations simultaneously

### User Goes Offline
- Browser closes or navigation away
- Pending timeout still broadcasts `user_stopped_typing`
- Indicator disappears for other users

## Performance Considerations

### Broadcast Throttling
- **Typing broadcasts**: One per keystroke (natural throttle from user speed)
- **Stopped typing broadcasts**: One after 3-second timeout
- **Prevents spam**: Timeout prevents continuous broadcasts

### State Updates
- `setTypingUsers` only updates if user not already in array
- Prevents duplicate entries and unnecessary re-renders
- Array filtering on "stopped typing" event

### Channel Cleanup
- Typing channel unsubscribed when conversation changes (useEffect cleanup)
- Prevents memory leaks and cross-conversation pollution
- New subscription created for each conversation

## Testing Typing Indicators

### Setup
1. Open app in two browser windows/tabs
2. Login with different users in each
3. Start same conversation in both

### Test Scenarios
```
Test 1: Basic Typing
- Type in Window A
- Verify indicator appears in Window B
- Shows correct username and animated dots

Test 2: Multiple Typists
- Type in both windows simultaneously
- Verify both names show in each window
- Indicator updates correctly

Test 3: Inactivity Timeout
- Type in Window A, then stop
- Wait 3 seconds
- Verify indicator disappears in Window B

Test 4: Send Clears Indicator
- Type in Window A
- Send message
- Verify indicator disappears in Window B immediately

Test 5: Message Switch
- Type in Conversation 1
- Switch to Conversation 2
- Verify Conversation 1 typing shows in Conversation 2 (it shouldn't)
- Type in Conversation 2
- Verify Conversation 2 typing shows correctly
```

## Debugging

### Typing Events Not Showing
1. Check browser console for broadcast errors
2. Verify conversation ID is correct
3. Ensure both users subscribed to same channel
4. Check Supabase real-time enabled in project

### Typing Not Clearing
1. Check if `typingTimeout` clearing in `handleSendMessage`
2. Verify `user_stopped_typing` broadcast is sent
3. Check receiving end unsubscribes properly on conversation change

### Performance Issues
- Monitor CPU with dev tools
- Check for duplicate subscriptions (useEffect cleanup needed)
- Verify state updates batch efficiently

## Future Enhancements

### Possible Improvements
1. **Avatars**: Show typing user's avatar next to indicator
2. **Longer timeout**: Increase 3-second timeout to 5-10 seconds
3. **Visual feedback**: Highlight typing user's profile or message input
4. **Typing speed**: Show typing speed indicator (slow, normal, fast)
5. **Editing indicator**: Show when user is editing a message
6. **Sound notification**: Play subtle sound when user starts typing
7. **Persistent typing**: Save typing indicator state across page refreshes

## Browser Compatibility

- Works in all modern browsers
- Uses Supabase broadcast channels (WebSocket-based)
- No special polyfills needed
- Mobile-friendly animated indicator

## Related Features

- **Messages**: Real-time message synchronization via Postgres subscriptions
- **Notifications**: Browser notifications on message receipt
- **Username Display**: Show real names in direct messages
- **Optimistic UI**: Instant message display before database confirmation

## Files Modified

1. `src/pages/ChatPage.jsx`
   - Added `typingUsers` and `typingTimeout` state
   - Added `handleMessageChange()` function
   - Added typing channel subscription
   - Updated `handleSendMessage()` to clear typing
   - Pass `handleMessageChange` and `typingUsers` to MessageInput

2. `src/components/MessageInput.jsx`
   - Accept `handleMessageChange` and `typingUsers` props
   - Render typing indicator component
   - Use `handleMessageChange` instead of direct `setMessageBody`

3. `src/components/MessageInput.css`
   - Added `.typing-indicator` styles
   - Added `.typing-dots` animation
   - Added `@keyframes typing` bouncing animation
