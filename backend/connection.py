from fastapi import WebSocket, WebSocketDisconnect
from collections import defaultdict
from typing import Dict, List
import alog

class ConnectionManager:
    def __init__(self):
        # Map of conversation_id -> list of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = defaultdict(list)

    async def connect(self, conversation_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[conversation_id].append(websocket)

    def disconnect(self, conversation_id: str, websocket: WebSocket):
        self.active_connections[conversation_id].remove(websocket)
        if not self.active_connections[conversation_id]:
            del self.active_connections[conversation_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, conversation_id: str, message: str, sender: WebSocket):
        connections = self.active_connections.get(conversation_id, [])
        for connection in connections:
            alog.info(f"Sending message to {connection}")
            if connection != sender:
                await connection.send_text(message)

manager = ConnectionManager()
