"""
Authentication-related Pydantic schemas
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, validator
import re


class UserSignupRequest(BaseModel):
    """User signup request schema"""
    email: EmailStr
    name: Optional[str] = None
    password: str
    
    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        return v
    
    @validator("name")
    def validate_name(cls, v):
        if v is not None and len(v.strip()) == 0:
            return None
        return v


class UserSigninRequest(BaseModel):
    """User signin request schema"""
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    """Forgot password request schema"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request schema"""
    token: str
    new_password: str
    
    @validator("new_password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        return v


class ChangePasswordRequest(BaseModel):
    """Change password request schema (for authenticated users)"""
    current_password: str
    new_password: str
    
    @validator("new_password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        return v


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema"""
    refresh_token: str


class UserResponse(BaseModel):
    """User response schema"""
    id: int
    email: str
    name: Optional[str] = None
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Authentication response schema"""
    user: UserResponse
    tokens: TokenResponse


class MessageResponse(BaseModel):
    """Generic message response schema"""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response schema"""
    message: str
    success: bool = False
    error_code: Optional[str] = None
