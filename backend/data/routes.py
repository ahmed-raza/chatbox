from fastapi import APIRouter, HTTPException, status, Depends
from backend.auth.dependencies import get_current_user
from backend.schemas.auth import UserResponse
from backend.utils.common import get_users as fetch_users

router = APIRouter(tags=["Data"])

@router.get('/users', response_model=list[UserResponse])
async def get_users(current_user: UserResponse = Depends(get_current_user)):
    users = await fetch_users()
    return users
