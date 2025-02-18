## Getting Started

To get started with the project, install the necessary dependencies by running the appropriate command for your operating system:

## Linux / Mac

```sh
pipx install fastapi && pipx install uvicorn && pip install python-socketio
```
then

```sh
yarn install
```

## Windows

```sh
pip install -r pyreq.txt; yarn install
```
# To run the application:

```sh
uvicorn backend.main:app_asgi --host 0.0.0.0 --port 8000
```
```sh
yarn run dev
```
## The objective of this project is to build an AI-powered chatbot.

# Tech Stack

The project uses the following technologies:

### Frontend - Typescript, HTML, and CSS
- **React.ts**: React with typescript. Used for making the UI and UX.
- **Tailwind CSS**: A utility-first CSS framework used for styling the components.
- **Socket.IO (React Client)**: Enables real-time, bi-directional communication between the client (React app) and the backend server, necessary for escalating to human agents.

### Backend - Python
- **FastAPI**: Python framework for back-end side (python).
- **Socket.IO (Python Server)**: Used to handle WebSocket connections and allow real-time communication between the client and the server (python).
- **Uvicorn**: A server used for the real-time hosting (python).

### Database: 
- Not implemented yet.

### NLP libraries - Python: 
- Not implemented yet.


# Features and Functionality (WIP)

### User Interaction
	Users can type messages, and the bot will respond in real-time if possible.
	The bot can process and understand customer intents (e.g., product inquiries, troubleshooting).

### Product Information
	The bot can retrieve product details from the database and present it to the customer.
    This way, the user can be redirected to the product page (to purchase the product): Purchasing products will not be implemented in this project.

### Conversational AI
	The bot can assist in troubleshooting, product recommendations, or answering general inquiries.
    The bot is able to hold basic conversation with the customers. 

### Escalation to Human Agents
	If the bot cannot resolve a customer’s issue, it can escalate the conversation to a human agent for further support.
    There will be a notification for human agents when escalating
    The conversation with the human agents will be real-time

## User Stories (WIP)

## DB Schema (WIP)