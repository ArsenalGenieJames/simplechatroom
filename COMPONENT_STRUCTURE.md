# Chat Application - Component Structure

## Overview
The chat application has been refactored to separate concerns with modular components and dedicated CSS files. This makes it easier to track, maintain, and extend each feature independently.

## Directory Structure

```
src/
├── components/
│   ├── ChatHeader.jsx          # Chat conversation header
│   ├── ChatHeader.css
│   ├── ConversationsList.jsx   # List of conversations in sidebar
│   ├── ConversationsList.css
│   ├── MessageInput.jsx        # Message input form
│   ├── MessageInput.css
│   ├── MessagesList.jsx        # Display chat messages
│   ├── MessagesList.css
│   ├── SearchBar.jsx           # Search users functionality
│   ├── SearchBar.css
│   ├── UserProfile.jsx         # User profile & logout
│   └── UserProfile.css
│
├── pages/
│   ├── ChatPage.jsx            # Main chat page container
│   ├── ChatPage.css            # Layout styles only
│   ├── Auth.jsx
│   ├── Auth.css
│   ├── Login.jsx
│   ├── SignUp.jsx
│   └── ...
│
└── ...
```

## Components Description

### SearchBar Component
**Files:** `SearchBar.jsx` & `SearchBar.css`
- Handles user search functionality
- Displays search results with user avatars
- Shows online indicators for users
- Triggers conversation creation on user selection
- CSS includes:
  - Search input styling with focus states
  - Search results dropdown with absolute positioning
  - User avatar styling with online indicator

### ConversationsList Component
**Files:** `ConversationsList.jsx` & `ConversationsList.css`
- Displays all user conversations
- Shows unread message counts
- Highlights active conversation
- Handles conversation selection
- CSS includes:
  - Conversation item styling with hover effects
  - Active state highlighting with gradient
  - Unread badge styling
  - Scrollbar customization

### UserProfile Component
**Files:** `UserProfile.jsx` & `UserProfile.css`
- Shows current user's profile info
- Displays user avatar, username, and email
- Provides logout button
- Mobile responsive (hides text on small screens)
- CSS includes:
  - Profile section footer styling
  - User info flex layout
  - Avatar placeholder with gradient
  - Logout button styling

### ChatHeader Component
**Files:** `ChatHeader.jsx` & `ChatHeader.css`
- Displays conversation title at top of chat
- Shows the name/title of active conversation
- CSS includes:
  - Header styling with subtle shadow
  - Mobile responsive font sizing

### MessagesList Component
**Files:** `MessagesList.jsx` & `MessagesList.css`
- Shows all messages in a conversation
- Differentiates between sent and received messages
- Displays sender name and timestamp
- CSS includes:
  - Message bubble styling (sent vs received)
  - Color differentiation for message direction
  - Scrollbar styling for message area
  - Mobile responsive text sizing

### MessageInput Component
**Files:** `MessageInput.jsx` & `MessageInput.css`
- Message composition form
- Send button with loading state
- Disabled state when no text entered
- CSS includes:
  - Input field styling with focus states
  - Send button styling with hover/active effects
  - Form flex layout
  - Disabled state styling

## Main ChatPage Container

**File:** `ChatPage.jsx`
- Imports all components and manages state
- Handles Supabase API calls for:
  - Fetching conversations
  - Loading messages
  - Sending messages
  - User search
  - User profile
- Coordinates between components via props
- CSS: `ChatPage.css` contains only layout-related styles

## CSS Organization

Each component has its own dedicated CSS file with:
- Component-specific styling
- Responsive design breakpoints
- Hover, active, and disabled states
- Smooth transitions and animations

The main `ChatPage.css` file contains only:
- Container layout (flex structure)
- Sidebar and main area dimensions
- Mobile responsive breakpoints for overall layout

## Benefits of This Structure

✅ **Easy to Track:** Each component and its styles are isolated
✅ **Maintainable:** Changes to one component don't affect others
✅ **Scalable:** New features can be added as new components
✅ **Reusable:** Components can be easily imported elsewhere
✅ **Mobile Responsive:** Each component handles its own responsive design
✅ **Clean Code:** Separated concerns make the code easier to read

## How to Extend

To add a new feature:
1. Create a new component file in `src/components/`
2. Create the corresponding CSS file
3. Import the component in `ChatPage.jsx`
4. Add it to the JSX render
5. Pass necessary props and callbacks

Example:
```jsx
import MyNewComponent from '../components/MyNewComponent'

// In ChatPage.jsx
<MyNewComponent 
  data={data}
  onAction={handleAction}
/>
```
