# Authentication System

This document describes the authentication system implemented for the chat application backend.

## Features

- **User Registration (Signup)**: Create new user accounts with email and password
- **User Authentication (Signin)**: Login with email and password
- **Password Reset**: Forgot password functionality with email-based reset
- **Password Change**: Change password for authenticated users
- **JWT Tokens**: Access and refresh token system
- **Token Refresh**: Refresh expired access tokens
- **Protected Routes**: Secure endpoints requiring authentication

## Project Structure

```
backend/
├── auth/
│   ├── __init__.py
│   ├── dependencies.py      # Authentication dependencies
│   └── routes.py           # Authentication endpoints
├── config/
│   ├── __init__.py
│   └── settings.py         # Application settings
├── schemas/
│   ├── __init__.py
│   └── auth.py            # Pydantic schemas
├── services/
│   ├── __init__.py
│   └── auth_service.py    # Business logic
├── utils/
│   ├── __init__.py
│   ├── email.py           # Email utilities
│   └── security.py       # Security utilities
└── main.py               # FastAPI application
```

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables by copying `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
```env
# JWT Configuration
JWT_SECRET_KEY="your-super-secret-jwt-key-change-this-in-production"

# Email Configuration (for password reset)
SMTP_SERVER="smtp.gmail.com"
SMTP_USERNAME="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

4. Generate and apply Prisma migrations:
```bash
prisma generate
prisma db push
```

## API Endpoints

### Authentication Endpoints

All authentication endpoints are prefixed with `/api/auth`.

#### 1. User Signup
- **POST** `/api/auth/signup`
- **Body**:
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "password123"
}
```
- **Response**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "created_at": "2025-01-01T00:00:00",
    "updated_at": "2025-01-01T00:00:00"
  },
  "tokens": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "bearer"
  }
}
```

#### 2. User Signin
- **POST** `/api/auth/signin`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**: Same as signup

#### 3. Forgot Password
- **POST** `/api/auth/forgot-password`
- **Body**:
```json
{
  "email": "user@example.com"
}
```
- **Response**:
```json
{
  "message": "Password reset link has been sent to your email",
  "success": true
}
```

#### 4. Reset Password
- **POST** `/api/auth/reset-password`
- **Body**:
```json
{
  "token": "reset_token_from_email",
  "new_password": "newpassword123"
}
```
- **Response**:
```json
{
  "message": "Password has been reset successfully",
  "success": true
}
```

#### 5. Change Password (Protected)
- **POST** `/api/auth/change-password`
- **Headers**: `Authorization: Bearer <access_token>`
- **Body**:
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

#### 6. Refresh Token
- **POST** `/api/auth/refresh`
- **Body**:
```json
{
  "refresh_token": "eyJ..."
}
```

#### 7. Get Current User (Protected)
- **GET** `/api/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`

#### 8. Logout (Protected)
- **POST** `/api/auth/logout`
- **Headers**: `Authorization: Bearer <access_token>`

#### 9. Health Check
- **GET** `/api/auth/health`

## Usage Examples

### Frontend Integration

```javascript
// Signup
const signup = async (email, name, password) => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password })
  });
  return response.json();
};

// Signin
const signin = async (email, password) => {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Protected request
const getProfile = async (accessToken) => {
  const response = await fetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};
```

### Using Authentication Dependencies

```python
from fastapi import APIRouter, Depends
from backend.auth.dependencies import get_current_user
from backend.schemas.auth import UserResponse

router = APIRouter()

@router.get("/protected-endpoint")
async def protected_route(current_user: UserResponse = Depends(get_current_user)):
    return {"message": f"Hello {current_user.email}!"}
```

## Security Features

- **Password Hashing**: Uses bcrypt for secure password storage
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Token Types**: Separate access and refresh tokens
- **Password Validation**: Enforces strong password requirements
- **Email Verification**: Password reset via email tokens
- **CORS Protection**: Configurable CORS origins

## Testing

Run the test script to verify the authentication system:

```bash
python backend/test_auth.py
```

Make sure the server is running on `http://localhost:8000` before running tests.

## Configuration

Key configuration options in `.env`:

- `JWT_SECRET_KEY`: Secret key for JWT token signing
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`: Access token expiration (default: 30 minutes)
- `JWT_REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration (default: 7 days)
- `PASSWORD_RESET_TOKEN_EXPIRE_MINUTES`: Password reset token expiration (default: 15 minutes)
- `SMTP_*`: Email configuration for password reset functionality

## Error Handling

The API returns consistent error responses:

```json
{
  "detail": "Error message",
  "success": false
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors, user already exists, etc.)
- `401`: Unauthorized (invalid credentials, expired tokens)
- `422`: Validation Error (invalid request format)

## Next Steps

1. Install the new dependencies: `pip install -r requirements.txt`
2. Configure your `.env` file with proper values
3. Test the endpoints using the provided test script
4. Integrate with your frontend application
5. Set up email configuration for password reset functionality
