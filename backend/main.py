from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from backend.auth.dependencies import get_current_user
from backend.schemas.auth import UserResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.connection import manager
from backend.auth.routes import router as auth_router
from backend.data.routes import router as data_router
from backend.conversation.routes import router as conversation_router
from backend.config.settings import settings
from backend.conversation.chat import ChatService
from backend.utils.database import get_database, disconnect_database
from contextlib import asynccontextmanager
import alog

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown events
    """
    # Startup: Initialize database connection
    alog.info("Starting up application...")
    await get_database()  # This will create and connect the database

    yield

    # Shutdown: Clean up database connection
    alog.info("Shutting down application...")
    await disconnect_database()

app = FastAPI(
    title=settings.app_name,
    description="Chat Application API with Authentication",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication routes
app.include_router(auth_router, prefix="/api")
app.include_router(data_router, prefix="/api")
app.include_router(conversation_router, prefix="/api")

chat_service = ChatService()

@app.websocket("/ws/{conversation_id}")
async def chat_websocket(websocket: WebSocket, conversation_id: str):
    await manager.connect(conversation_id, websocket)

    user_id = websocket.query_params.get("user_id") if websocket.query_params else None
    if user_id:
        user_id = int(user_id)  # Convert to int since User.id is int

    alog.info(f"User {user_id} connected to conversation {conversation_id}")

    try:
        while True:
            data = await websocket.receive_text()

            alog.info(f"User {user_id} sent message: {data}")

            message = await chat_service.add_message(conversation_id, user_id, data)

            await manager.broadcast(conversation_id, data, sender=websocket)
    except WebSocketDisconnect:
        manager.disconnect(conversation_id, websocket)
        alog.info(f"User {user_id} disconnected from conversation {conversation_id}")
