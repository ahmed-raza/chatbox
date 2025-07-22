import asyncio, websockets

async def connect():
    # Use a CUID format for conversation_id (you'll need to get this from your app)
    conversation_id = input("Enter conversation ID: ") or "cl9ebqhxk00008eqf00000000"
    uri = f"ws://localhost:8000/ws/{conversation_id}?user_id=1"
    async with websockets.connect(uri) as websocket:
        print("Connected to websocket server")

        while True:
            message = input("Enter message: ")
            await websocket.send(message)
            print(f"Sent: {message}")

asyncio.get_event_loop().run_until_complete(connect())
