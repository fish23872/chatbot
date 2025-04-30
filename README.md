# To run the application:

```sh
docker-compose up
```
## The objective of this project is to build an AI-powered chatbot.

# Tech Stack

The project uses the following technologies:

### Frontend - Typescript, HTML, and CSS
- **React.ts**: React with typescript. Used for making the UI and UX.
- **Tailwind CSS**: A utility-first CSS framework used for styling the components.
- **Socket.IO (React Client)**: Enables real-time, bi-directional communication between the client (React app) and the backend server, necessary for escalating to human agents.

### Backend - Python
- **FastAPI**: Python framework for back-end side (python). https://fastapi.tiangolo.com/
- **Socket.IO (Python Server)**: Used to handle WebSocket connections and allow real-time communication between the client and the server (python).
- **Uvicorn**: A server used for the real-time hosting (python). https://www.uvicorn.org/

### Database: 
- MongoDB

### NLP libraries - Python: 
- **spaCy**: Industrial-Strength Natural Language Processing https://spacy.io/
- **Rasa Open Source**: Provides flexible conversational AI software https://rasa.com/
- **ChatGPT**: For LLM API Calls

# Features and Functionality (WIP)

### User Interaction
-	Users can type messages, and the bot will respond in real-time if possible.
-	The bot can process and understand customer intents (e.g., product inquiries, troubleshooting).

### Product Information
-	The bot can retrieve product details from the database and present it to the customer.
-   This way, the user can be redirected to the product page (to purchase the product): Purchasing products will not be implemented in this project.
-   Products can be compared, a summary from an LLM Model will be included for each comparison

### Conversational AI
-	The bot can assist in troubleshooting, product recommendations, or answering general inquiries.
-   The bot is able to hold basic conversation with the customers. 

### Escalation to Human Agents
-	If the bot cannot resolve a customer’s issue, it can escalate the conversation to a human agent for further support.
-   There will be a notification for human agents when escalating
-   The conversation with the human agents will be real-time