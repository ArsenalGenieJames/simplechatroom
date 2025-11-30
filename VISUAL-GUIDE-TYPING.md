# Visual Guide: Typing Indicators

## Feature Overview

### What Users See

```
SCENARIO 1: One User Typing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chat Window A (User: alice)          Chat Window B (User: bob)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Messages List]                      [Messages List]

Message from bob: Hello!             Message from alice: Hi!


┌─────────────────────────┐          ┌─────────────────────────┐
│  ⚪ ⚪ ⚪                  │          │  alice typing...        │
│  alice typing...        │          │  ⚪ ⚪ ⚪ (animated)      │
└─────────────────────────┘          └─────────────────────────┘

[Type message here]                  [Type message here]
[Send]                               [Send]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


SCENARIO 2: Multiple Users Typing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Group Chat View
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Messages List]

Previous messages...

┌──────────────────────────────┐
│  alice, bob, charlie typing... │
│  ⚪ ⚪ ⚪ (animated)             │
└──────────────────────────────┘

[Type message here]
[Send]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


SCENARIO 3: User Sends Message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEFORE (alice typing)
                                    AFTER (message sent)
┌──────────────────────────┐       ┌──────────────────────────┐
│  alice typing...         │  -->  │  (indicator gone)        │
│  ⚪ ⚪ ⚪ (animated)        │       │                          │
└──────────────────────────┘       │  Message from alice: Hi! │
                                    └──────────────────────────┘
(Instant disappearance)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Animation Sequence

### Typing Dots Animation
```
TIME 0ms:    ● ○ ○  (first dot up)
TIME 200ms:  ○ ● ○  (second dot up)
TIME 400ms:  ○ ○ ●  (third dot up)
TIME 600ms:  ● ○ ○  (first dot up again)
TIME 800ms:  ○ ● ○  (second dot up again)
TIME 1000ms: ○ ○ ●  (third dot up again)
TIME 1200ms: ● ○ ○  (cycle repeats)
TIME 1400ms: back to start

(Continuous loop while user is typing)
```

## Data Flow

### Typing Event Flow
```
┌─────────────────────┐
│  User Starts Typing │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ handleChange │
    └──────┬───────┘
           │
           ├─ Update messageBody state
           ├─ Send 'user_typing' broadcast
           └─ Set 3-second timeout
           │
           ▼
  ┌─────────────────────┐
  │ Supabase Broadcast  │
  │  Channel: typing:X  │
  │  Event: user_typing │
  └────────┬────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Other Users Recv │
    └────────┬─────────┘
           │
           ├─ Update typingUsers array
           └─ Re-render UI
           │
           ▼
    ┌────────────────────┐
    │ Show Indicator &   │
    │ Animated Dots      │
    └────────────────────┘
```

### Stop Typing Flow (User Stops)
```
┌──────────────────────────┐
│  3 Seconds Inactivity    │
│  (No new keystrokes)     │
└──────────┬───────────────┘
           │
           ▼
    ┌──────────────┐
    │ Timeout Fires│
    └──────┬───────┘
           │
    Send 'user_stopped_typing'
           │
           ▼
  ┌─────────────────────────┐
  │ Supabase Broadcast      │
  │  Event: user_stopped    │
  └────────┬────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Other Users Recv │
    └────────┬─────────┘
           │
    Remove user from typingUsers
           │
           ▼
    ┌────────────────────┐
    │ Indicator Removed  │
    │ UI Updated         │
    └────────────────────┘
```

### Stop Typing Flow (User Sends Message)
```
┌──────────────────────┐
│  User Sends Message  │
└──────────┬───────────┘
           │
           ▼
  ┌─────────────────────┐
  │ handleSendMessage() │
  └──────┬──────────────┘
         │
         ├─ Show message optimistically
         ├─ Clear messageBody
         ├─ Clear typingUsers array
         ├─ Cancel any pending timeout
         │
         └─ Send 'user_stopped_typing'
           │
           ▼
  ┌─────────────────────────┐
  │ Supabase Broadcast      │
  │  Event: user_stopped    │
  └────────┬────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Other Users Recv │
    └────────┬─────────┘
           │
    Remove user from typingUsers
           │
           ▼
    ┌──────────────────────────┐
    │ Indicator Removed        │
    │ (Instant - not 3 seconds)│
    └──────────────────────────┘
```

## State Management

### typingUsers Array Structure
```javascript
typingUsers = [
  {
    user_id: "uuid-123",
    username: "alice",
    conversation_id: "conv-uuid"
  },
  {
    user_id: "uuid-456",
    username: "bob",
    conversation_id: "conv-uuid"
  },
  {
    user_id: "uuid-789",
    username: "charlie",
    conversation_id: "conv-uuid"
  }
]

// Displayed as: "alice, bob, charlie typing..."
```

### UI Re-render Trigger Points
```
1. User types (handleMessageChange)
   └─ Broadcast sent
   └─ Other users' subscriptions receive
   └─ setTypingUsers() called
   └─ UI re-renders

2. 3 second timeout fires (auto-stop)
   └─ Broadcast sent
   └─ Other users receive
   └─ setTypingUsers() removes user
   └─ UI re-renders

3. Message sent (handleSendMessage)
   └─ setTypingUsers([]) clears all
   └─ Broadcast sent
   └─ UI re-renders instantly
   └─ Message appears
```

## Component Tree

```
ChatPage (manages typing state)
│
├─ State:
│  ├─ typingUsers: array
│  └─ typingTimeout: ID
│
├─ Subscriptions:
│  └─ typingChannel (Supabase)
│      ├─ Listens: user_typing
│      └─ Listens: user_stopped_typing
│
└─ MessageInput (displays typing)
   │
   └─ IF typingUsers.length > 0:
      └─ Render TypingIndicator
         └─ Display names + animated dots
```

## CSS Animation Breakdown

### Typing Indicator Container
```
┌──────────────────────────────────┐
│  ⚪ ⚪ ⚪   alice typing...       │
│  (animated) (text)                │
└──────────────────────────────────┘

Background: Light gray (#f9f9f9)
Padding: 8px
Border radius: 6px
Margin below: 12px
```

### Dots Animation Timing
```
Dot 1: 0ms   --200ms→  Dot 2: 200ms   --200ms→  Dot 3: 400ms
├─ Opacity: 0.5→1→0.5
└─ Position: translateY(0→-10px→0)

Then cycle repeats starting at 600ms...
Total cycle: 1400ms
Smooth continuous loop
```

## Performance Considerations

### Message Flow Efficiency
```
Keystroke → handleMessageChange
         → Check if already broadcasting
         → Send broadcast (once per keystroke naturally)
         → Set timeout (replaced if another keystroke)
         └─ Results in ~0.2-0.5 broadcasts per second (from user typing)
```

### State Update Batching
```
Single broadcast received
├─ Update typingUsers array (single setState)
└─ Single UI re-render (React batching)

No duplicate processing
No unnecessary renders
```

### Channel Cleanup
```
Switch conversation:
├─ Old typingChannel unsubscribe (cleanup)
├─ typingUsers reset to []
└─ New channel subscribed for new conversation

Prevents:
├─ Memory leaks
├─ Cross-conversation typing pollution
└─ Duplicate subscriptions
```

## Browser Network Activity

### Typing - Every 1-2 seconds
```
→ WebSocket: BROADCAST 'user_typing'
  payload: {user_id, username, conversation_id}
  size: ~150 bytes
```

### Stop Typing - Once after 3 seconds
```
→ WebSocket: BROADCAST 'user_stopped_typing'
  payload: {user_id, conversation_id}
  size: ~100 bytes
```

### Message Send
```
→ WebSocket: BROADCAST 'user_stopped_typing'
  payload: {user_id, conversation_id}
  size: ~100 bytes

→ REST API: POST /messages
  (actual message insertion)
```

## Comparison with Alternative Approaches

### vs Database Polling
```
❌ Inefficient - hundreds of database queries
❌ Latency - 1-5 second delay
❌ Expensive - unnecessary database load

✅ Broadcasting - instant, WebSocket-based
✅ Lightweight - no database queries for typing
✅ Real-time - <100ms latency typical
```

### vs WebSocket Raw
```
❌ Broadcasting needs same - WebSocket underneath
✅ Supabase handles infrastructure
✅ Built-in channel management
✅ Easy to use
```

### vs Message Inserts with Realtime
```
❌ Would fill message table with typing events
❌ Not designed for ephemeral data
❌ Would show in message history

✅ Broadcast channels - ephemeral
✅ Only alive during subscription
✅ No database storage
```

## Troubleshooting Flowchart

```
Typing indicator not showing?
├─ Check Browser Console
│  ├─ Any broadcast errors? YES→ Check channel name/format
│  └─ Errors from handleMessageChange? YES→ Debug function
│
├─ Check both users in same conversation? NO→ Switch to same conv
│
├─ Check typingUsers state in React DevTools
│  ├─ Empty? YES→ Subscription not receiving
│  └─ Has users? YES→ Display logic issue
│
├─ Check Supabase real-time enabled
│
└─ Try different browser/incognito mode

Not clearing after send?
├─ Check handleSendMessage runs
│  ├─ Message sends? YES→ Function runs
│  └─ Message doesn't send? YES→ Fix send logic first
│
├─ Verify setTypingUsers([]) is called
│  └─ Use React DevTools to see state
│
└─ Verify user_stopped_typing broadcast sent
   └─ Check browser Network tab for WebSocket messages
```

## Real-time Sequence Diagram

```
User A                          Supabase              User B
  │                               │                      │
  │ Types "Hi"                    │                      │
  ├──────────────────────────────>│                      │
  │  'user_typing' broadcast      │                      │
  │                               ├─────────────────────>│
  │                               │  Typing event recv   │
  │                               │                      ├─> Show indicator
  │                               │                      │
  │ Types "How are"               │                      │
  ├──────────────────────────────>│                      │
  │  'user_typing' broadcast      │                      │
  │  (timeout resets)             │                      │
  │                               ├─────────────────────>│
  │                               │                      │ (indicator updates)
  │                               │                      │
  │ Pauses 3 seconds...           │                      │
  │                               │                      │
  │                       Timeout fires                 │
  ├──────────────────────────────>│                      │
  │  'user_stopped_typing'        │                      │
  │                               ├─────────────────────>│
  │                               │  Stop event recv     │
  │                               │                      ├─> Hide indicator
  │                               │                      │
  │ Sends message                 │                      │
  ├──────────────────────────────>│                      │
  │  'user_stopped_typing'        │                      │
  │  (also sent on send)          │                      │
  │                               ├─────────────────────>│
  │  Message insert               │  Stop + message      │
  │                               ├─────────────────────>│
  │                               │  Both received       │
  │<──────────────────────────────┤  (indicator gone)    │
  │  Message confirmation         │  (message appears)   │
  │                               │                      │
```

## Summary

✅ **Real-time typing detection** - Instant feedback
✅ **Animated visual indicator** - User sees who's typing
✅ **Multi-user support** - Shows all typing users
✅ **Auto-timeout** - Clears after 3 seconds of inactivity
✅ **Message send clears** - Instant disappearance
✅ **Efficient** - Uses broadcasts, not database
✅ **Works across devices** - WebSocket real-time
✅ **No page refresh needed** - Fully automatic
