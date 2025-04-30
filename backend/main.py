from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import socketio
import uvicorn
import process_message
from auth_routes import router as auth_router

app = FastAPI(title="Chatbot CS API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins="*")
app_asgi = socketio.ASGIApp(sio, app)

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
@sio.event
async def chat_message(sid, data):
    try:
        print(f"Message from {sid}: {data}")
        response = process_message.process_messages(data)
        
        print(f"Response: {response}")
        if "buttons" in response[0]:
            await sio.emit("buttons", response, room=sid)
        elif "custom" in response[0]:
            await sio.emit("data", response, room=sid)
        else:
            await sio.emit("chat_message", response, room=sid)
    except asyncio.TimeoutError as e:
        print(f"Error: {e}")
if __name__ == "__main__":
    uvicorn.run(app_asgi, host="0.0.0.0", port=8000, reload=True)