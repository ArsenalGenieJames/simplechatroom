# Authentication & Database Integration Guide

## SQL Schema Integration

Your app is now fully integrated with the following users table:

```sql
create table public.users (
  id uuid not null default gen_random_uuid (),
  username character varying(50) not null,
  display_name character varying(100) null,
  email character varying(255) null,
  password_hash text null,
  avatar_url text null,
  created_at timestamp with time zone null default now(),
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_username_key unique (username)
) TABLESPACE pg_default;
```

## How Login & SignUp Work

### SignUp Process

1. **Username Validation**
   - Must be 3-50 characters
   - Only letters, numbers, underscores, and hyphens allowed
   - Checked against database for uniqueness
   - Stored in lowercase

2. **Email Validation**
   - Must be valid email format
   - Checked against database for uniqueness
   - Converted to lowercase for consistency

3. **Password Requirements**
   - Minimum 6 characters
   - Managed by Supabase Auth (encrypted)

4. **Account Creation Flow**
   - Create Supabase Auth account (handles password hashing)
   - Create user profile in `users` table with:
     - `id` (from Supabase Auth user)
     - `username` (unique, lowercase)
     - `display_name` (optional, defaults to username)
     - `email` (unique, lowercase)
     - `created_at` (auto-generated)
   - If profile creation fails, auth user is deleted to maintain consistency

5. **Error Handling**
   - Duplicate username → Clear error message
   - Duplicate email → Clear error message
   - Invalid format → Validation message
   - Database error → Specific error description

### Login Process

1. **Authentication**
   - Email and password verified by Supabase Auth
   - Session created automatically

2. **Profile Fetch**
   - After successful login, app fetches user profile from `users` table
   - Profile contains username, display_name, and other user info
   - Used by ChatPage to display user identity

3. **Automatic Redirect**
   - On successful auth, user automatically redirected to ChatPage
   - On logout, user redirected to Login page

## Data Constraints Enforced

✅ **Email Unique Constraint**
- Users table enforces unique emails
- SignUp validates before creation

✅ **Username Unique Constraint**
- Users table enforces unique usernames
- SignUp validates before creation
- Case-insensitive (stored as lowercase)

✅ **Required Fields**
- Username is required (50 chars max)
- Email is optional but unique when provided
- Display Name is optional (100 chars max)
- Avatar URL is optional (stored for future use)

✅ **Timestamps**
- `created_at` automatically set to current time
- Used by ChatPage to sort conversations

## File Structure

```
src/
├── pages/
│   ├── Login.jsx           # Login form with validation
│   ├── SignUp.jsx          # Signup form with DB integration
│   ├── ChatPage.jsx        # Chat interface (uses user data)
│   ├── Auth.css            # Auth styles
│   └── ChatPage.css        # Chat styles
├── App.js                  # Main app routing
└── supabaseClient.js       # Supabase initialization
```

## Testing the Integration

1. **Create Account**
   - Fill in username, email, password
   - Click Create Account
   - Check for validation errors
   - Should redirect to login after 2.5 seconds

2. **Try Duplicate**
   - Try same username → Error message
   - Try same email → Error message

3. **Login**
   - Use email and password from signup
   - Should redirect to ChatPage
   - Profile data should load from database

4. **View Profile**
   - In ChatPage, messages show sender's display_name from users table
   - Conversations list shows users who are participants

## Security Notes

✅ Passwords are never stored in `users` table - handled by Supabase Auth
✅ Email verification can be enabled in Supabase settings
✅ Username/Email uniqueness enforced at database level
✅ Input validation on both client and database
✅ User IDs match between Auth and users table for data consistency
