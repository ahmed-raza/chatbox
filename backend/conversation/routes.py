from fastapi import APIRouter, Depends, HTTPException
from backend.conversation.chat import ChatService
from backend.auth.dependencies import get_current_user
from backend.schemas.auth import UserResponse  # assuming this is your user schema

router = APIRouter(prefix="/chat", tags=["Chat"])
chat_service = ChatService()

# ✅ Create a new conversation (current user + list of users)
@router.post("/conversations")
async def create_conversation(
    user_ids: list[int],
    current_user: UserResponse = Depends(get_current_user)
):
    all_users = set(user_ids + [current_user.id])
    return await chat_service.create_conversation(list(all_users))

# ✅ Get single conversation
@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    conversation = await chat_service.get_conversation(conversation_id)
    if not conversation or current_user.id not in [user.id for user in conversation.users]:
        raise HTTPException(status_code=403, detail="Not authorized for this conversation")
    return conversation

# ✅ List all conversations of the current user
@router.get("/conversations")
async def list_conversations(current_user: UserResponse = Depends(get_current_user)):
    return await chat_service.list_conversations(current_user.id)

# ✅ Send a message
@router.post("/messages/")
async def send_message(
    conversation_id: str,
    content: str,
    current_user: UserResponse = Depends(get_current_user)
):
    return await chat_service.add_message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=content
    )

# ✅ Get messages in a conversation
@router.get("/messages/{conversation_id}")
async def get_messages(
    conversation_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    conversation = await chat_service.get_conversation(conversation_id)
    if not conversation or current_user.id not in [user.id for user in conversation.users]:
        raise HTTPException(status_code=403, detail="Not authorized for this conversation")
    return await chat_service.get_messages(conversation_id, current_user.id)
