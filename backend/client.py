import asyncio, websockets

async def connect():
    uri = "ws://localhost:8000/ws/1"
    async with websockets.connect(uri) as websocket:
        print("Connected to websocket server")

        while True:
            message = input("Enter message: ")
            await websocket.send(message)
            print(f"Sent: {message}")

asyncio.get_event_loop().run_until_complete(connect())
