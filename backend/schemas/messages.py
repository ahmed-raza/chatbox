"""
Messages-related Pydantic schemas
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from backend.schemas.auth import UserResponse
import re

class MessageRequest(BaseModel):
    """Message request schema"""
    content: str

class MessageResponse(BaseModel):
    """Message response schema"""
    id: str
    content: str
    sender: UserResponse
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
