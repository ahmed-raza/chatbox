from prisma import Prisma
from contextlib import asynccontextmanager
from backend.schemas.auth import UserResponse

prisma = Prisma()

@asynccontextmanager
async def get_db():
    await prisma.connect()
    yield prisma
    await prisma.disconnect()

async def get_users():
    async with get_db() as db:
        users = await db.user.find_many()
        return [
            UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                created_at=user.createdAt.isoformat(),
                updated_at=user.updatedAt.isoformat()
            )
            for user in users
        ]
