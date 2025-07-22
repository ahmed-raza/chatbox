from backend.services.auth_service import auth_service
import alog

class ChatService:
    """Chat and message service"""

    async def create_conversation(self, user_ids: list[int]):
        try:
            await auth_service.connect_db()
            return await auth_service.db.conversation.create(
                data={"users": {"connect": [{"id": uid} for uid in user_ids]}}
            )
        finally:
            await auth_service.disconnect_db()

    async def get_conversation(self, conversation_id: str):
        try:
            await auth_service.connect_db()
            return await auth_service.db.conversation.find_unique(
                where={"id": conversation_id},
                include={"users": True, "messages": {"include": {"sender": True}}}
            )
        finally:
            await auth_service.disconnect_db()

    async def list_conversations(self, user_id: int):
        try:
            await auth_service.connect_db()
            return await auth_service.db.conversation.find_many(
                where={"users": {"some": {"id": user_id}}},
                include={"users": True, "messages": {"orderBy": {"createdAt": "desc"}}}
            )
        finally:
            await auth_service.disconnect_db()

    async def add_message(self, conversation_id: str, sender_id: int, content: str):
        try:
            await auth_service.connect_db()
            alog.info(f"Adding message to conversation {conversation_id} sender {sender_id} content {content}")
            return await auth_service.db.message.create(
                data={
                    "content": content,
                    "sender": {"connect": {"id": sender_id}},
                    "conversation": {"connect": {"id": conversation_id}}
                }
            )
        finally:
            await auth_service.disconnect_db()

    async def get_messages(self, conversation_id: str, current_user_id: int = None):
        try:
            await auth_service.connect_db()
            fetch_messages = await auth_service.db.message.find_many(
                where={"conversationId": conversation_id},
                include={"sender": True},
                order={"createdAt": "asc"}
            )
            messages = [
                {
                    "id": message.id,
                    "text": message.content,
                    "sender": "me" if current_user_id and message.sender.id == current_user_id else "they",
                    "created_at": message.createdAt.isoformat(),
                    "updated_at": message.updatedAt.isoformat()
                }
                for message in fetch_messages
            ]
            return messages
        finally:
            await auth_service.disconnect_db()
