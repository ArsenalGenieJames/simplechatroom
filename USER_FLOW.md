# User Authentication Flow

## Complete User Journey

### 1. **New User - Sign Up Flow**
```
Sign Up Page
    ↓
Fill Form (Username, Email, Password, Display Name)
    ↓
Click "Create Account"
    ↓
Validate inputs (3-50 chars username, valid email, min 6 chars password)
    ↓
Check for duplicate username/email in database
    ↓
Create Supabase Auth account (handles password encryption)
    ↓
Create user profile in `users` table
    ↓
Show success message "Redirecting to chat..."
    ↓
Auto-login with credentials (1.5 second delay)
    ↓
Auth state change detected
    ↓
Automatically redirect to ChatPage
    ↓
User can start chatting immediately ✓
```

### 2. **Existing User - Login Flow**
```
Login Page
    ↓
Enter Email & Password
    ↓
Click "Login"
    ↓
Verify credentials with Supabase Auth
    ↓
Auth state change detected
    ↓
Fetch user profile from `users` table
    ↓
Automatically redirect to ChatPage
    ↓
Display conversations and messages ✓
```

### 3. **Logout Flow**
```
ChatPage (with Logout button in top-right)
    ↓
Click "Logout"
    ↓
Sign out from Supabase Auth
    ↓
Auth state change detected (user = null)
    ↓
Automatically redirect to Login Page
    ↓
User can login again or signup ✓
```

## Key Features

### Sign Up Redirects
- ✅ After successful account creation → Automatically directed to ChatPage
- ✅ New users never see Login page after signup
- ✅ Auto-login happens 1.5 seconds after account creation
- ✅ If auto-login fails → Redirects to Login page (fallback)

### Login Redirects
- ✅ Successful login → Automatically directed to ChatPage
- ✅ Failed login → Shows error message, stays on Login page

### Logout Redirects
- ✅ Click Logout button → Automatically directed to Login page
- ✅ Users can access both Login and SignUp pages when logged out
- ✅ Session cleared from Supabase Auth

### Page Access Control
```
Logged In:
  ✓ ChatPage (default)
  ✓ Logout button visible
  ✗ Cannot access Login or SignUp pages

Logged Out:
  ✓ Login page (default)
  ✓ SignUp page (via "Sign up" link)
  ✗ Cannot access ChatPage
```

## Technical Implementation

### App.js Logic
```javascript
// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    setUser(session.user)
    setCurrentPage('chat')
    // Renders ChatPage with logout button
  } else {
    setUser(null)
    setCurrentPage('login')
    // Renders Login/SignUp pages
  }
})
```

### SignUp.jsx Logic
```javascript
// After successful profile creation
setTimeout(() => {
  // Auto-login the user
  supabase.auth.signInWithPassword({
    email, password
  }).then(({ error }) => {
    if (error) {
      onSwitchToLogin() // Fallback
    }
    // Success: App.js detects auth state change → redirects to chat
  })
}, 1500)
```

## User Experience Timeline

### New User
- T=0s: Lands on Login page
- T=5s: Clicks "Sign up" → Sees SignUp page
- T=30s: Fills form and clicks "Create Account"
- T=32s: Sees "Account created successfully! Redirecting to chat..."
- T=33.5s: Auto-login triggers
- T=34s: Auth state updates
- T=35s: ChatPage loads with their conversations ✓

### Returning User
- T=0s: Lands on Login page
- T=10s: Enters email and password, clicks "Login"
- T=12s: Auth state updates
- T=13s: ChatPage loads ✓

### Logout
- T=0s: In ChatPage, user clicks "Logout" button
- T=1s: Auth session cleared
- T=2s: Redirected to Login page ✓

## Database Integration

### Users Table
- Stores user profile information
- Linked to Supabase Auth via `id` field
- Username and Email are unique constraints
- Display Name is optional

### Auth System
- Passwords managed by Supabase Auth (never stored in users table)
- Email verification can be enabled in Supabase settings
- Session tokens managed automatically

## Security Notes

✅ Passwords never exposed in frontend code
✅ Email verification can be enforced (optional)
✅ Unique constraints on username and email
✅ Input validation before database operations
✅ Auto-logout on session expiry
✅ Secure session management via Supabase
