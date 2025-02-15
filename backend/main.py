from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import socketio
import uvicorn

app = FastAPI()
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins="*") 
# asgi is used for compatibility with FastAPI
# for now any connection is allowed (*)

app_asgi = socketio.ASGIApp(sio, app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) # any headers, methods, and connections are allowed (this might be changed later)

# event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}") # prints a message when a client is connected
@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}") # prints when there is a disconnection
@sio.event
async def chat_message(sid, data):
    try:
        print(f"Message from {sid}: {data}")
        await sio.emit("chat_message", "You said: "+ data)
        # return the message (testing)
    except asyncio.TimeoutError as e: # handling timeout errors
            print(f"Error: {e}")
    
if __name__ == "__main__":
    uvicorn.run(app_asgi, host="0.0.0.0", port=8000)