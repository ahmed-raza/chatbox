# Frontend Authentication System

This document describes the frontend authentication system implemented for the Next.js chat application.

## Features

- **User Registration & Login**: Complete signup and signin flows
- **Password Reset**: Forgot password and reset password functionality
- **Protected Routes**: Automatic redirection for authenticated/unauthenticated users
- **Persistent Authentication**: JWT tokens stored in localStorage with automatic refresh
- **User Profile Management**: Change password and view account information
- **Responsive Design**: Mobile-friendly authentication forms
- **Real-time State Management**: React Context for global auth state

## Project Structure

```
web/src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx           # Login page
│   │   ├── signup/page.tsx          # Signup page
│   │   ├── forgot-password/page.tsx # Forgot password page
│   │   └── reset-password/page.tsx  # Reset password page
│   ├── chat/page.tsx                # Protected chat page
│   ├── profile/page.tsx             # User profile page
│   ├── layout.tsx                   # Root layout with AuthProvider
│   └── page.tsx                     # Home page
├── components/
│   ├── auth/
│   │   ├── AlertMessage.tsx         # Alert/notification component
│   │   ├── AuthButton.tsx           # Styled button component
│   │   ├── AuthCard.tsx             # Auth form container
│   │   ├── FormInput.tsx            # Form input component
│   │   └── ProtectedRoute.tsx       # Route protection wrapper
│   └── ui/
│       └── navbar.tsx               # Navigation with auth state
├── contexts/
│   └── AuthContext.tsx              # Authentication context
└── hooks/
    └── useAuthForm.ts               # Form handling hook
```

## Authentication Flow

### 1. User Registration
- Navigate to `/auth/signup`
- Fill out name, email, password, and confirm password
- Form validation ensures strong passwords
- Successful registration automatically logs user in
- Redirects to chat page

### 2. User Login
- Navigate to `/auth/login`
- Enter email and password
- Successful login stores JWT tokens
- Redirects to chat page

### 3. Password Reset
- Navigate to `/auth/forgot-password`
- Enter email address
- Backend sends reset email with token
- Click link in email to go to `/auth/reset-password?token=...`
- Enter new password
- Redirects to login page

### 4. Protected Routes
- Chat page requires authentication
- Profile page requires authentication
- Unauthenticated users redirected to login
- Authenticated users on auth pages redirected to chat

## Components

### AuthContext
Provides global authentication state and methods:

```typescript
const { 
  user,           // Current user object
  isAuthenticated, // Boolean auth status
  isLoading,      // Loading state
  login,          // Login function
  signup,         // Signup function
  logout,         // Logout function
  forgotPassword, // Forgot password function
  resetPassword,  // Reset password function
  changePassword  // Change password function
} = useAuth();
```

### Form Components

#### FormInput
Reusable input component with validation:
```tsx
<FormInput
  label="Email"
  type="email"
  placeholder="Enter your email"
  required
  {...getFieldProps('email')}
/>
```

#### AuthButton
Styled button with loading states:
```tsx
<AuthButton
  type="submit"
  variant="primary"
  loading={isSubmitting}
  fullWidth
>
  Sign In
</AuthButton>
```

#### AuthCard
Container for authentication forms:
```tsx
<AuthCard
  title="Sign In"
  subtitle="Welcome back!"
  footer={{
    text: "Don't have an account?",
    linkText: "Sign up",
    linkHref: "/auth/signup"
  }}
>
  {/* Form content */}
</AuthCard>
```

### ProtectedRoute
Wrapper for pages requiring authentication:
```tsx
<ProtectedRoute>
  <ChatPageContent />
</ProtectedRoute>
```

## Form Validation

The `useAuthForm` hook provides comprehensive form validation:

### Password Requirements
- Minimum 8 characters
- At least one letter
- At least one number

### Email Validation
- Valid email format required
- Real-time validation feedback

### Confirm Password
- Must match the password field
- Updates validation when password changes

## API Integration

### Environment Configuration
Set the API URL in `web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### API Endpoints Used
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/change-password` - Change password (authenticated)
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info

## Token Management

### Storage
- JWT tokens stored in localStorage
- Automatic persistence across browser sessions
- Tokens cleared on logout

### Refresh Strategy
- Access tokens automatically refreshed when expired
- Refresh tokens used for seamless re-authentication
- Failed refresh redirects to login

### Security
- Tokens included in Authorization headers
- Automatic token validation on app load
- Secure token handling in API calls

## Navigation Integration

The navbar shows different content based on authentication state:

### Unauthenticated Users
- Sign In button
- Sign Up button
- Public navigation links

### Authenticated Users
- User avatar with name/email
- Dropdown menu with:
  - Profile link
  - Sign Out option
- Protected navigation links

## Error Handling

### Form Errors
- Real-time validation feedback
- Server error display
- User-friendly error messages

### Network Errors
- Graceful handling of API failures
- Retry mechanisms for token refresh
- Fallback error states

## Responsive Design

### Mobile Support
- Touch-friendly form inputs
- Responsive navigation menu
- Mobile-optimized layouts

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility

## Usage Examples

### Protecting a Page
```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content requires authentication</div>
    </ProtectedRoute>
  );
}
```

### Using Auth State
```tsx
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Custom Form with Validation
```tsx
import { useAuthForm, validationRules } from '@/hooks/useAuthForm';

export default function MyForm() {
  const { handleSubmit, getFieldProps, isSubmitting } = useAuthForm({
    initialValues: { email: '', password: '' },
    validationRules: {
      email: validationRules.email,
      password: validationRules.password,
    },
    onSubmit: async (values) => {
      // Handle form submission
      return { success: true, message: 'Success!' };
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <FormInput label="Email" {...getFieldProps('email')} />
      <FormInput label="Password" type="password" {...getFieldProps('password')} />
      <AuthButton type="submit" loading={isSubmitting}>
        Submit
      </AuthButton>
    </form>
  );
}
```

## Testing the System

1. **Start the backend server**: `uvicorn backend.main:app --reload`
2. **Start the frontend**: `npm run dev`
3. **Test the flow**:
   - Visit `http://localhost:3000`
   - Click "Sign Up" to create an account
   - Try logging in and out
   - Test password reset (requires email configuration)
   - Access protected routes

## Next Steps

1. **Install dependencies**: `npm install` in the web directory
2. **Configure environment**: Set up `.env.local` with correct API URL
3. **Start development**: `npm run dev`
4. **Test authentication**: Follow the testing steps above

The frontend authentication system is now fully integrated and ready for use!
