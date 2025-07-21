from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.connection import manager
from backend.auth.routes import router as auth_router
from backend.config.settings import settings
import alog

app = FastAPI(
    title=settings.app_name,
    description="Chat Application API with Authentication",
    version="1.0.0"
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


@app.get('/')
async def root():
    return {"message": "Works!"}

@app.websocket("/ws/{client_id}")
async def chat_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    client_id = websocket.path_params["client_id"]
    alog.info(f"Client ID: {client_id}")
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
