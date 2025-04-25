import requests
RASA_URL = "http://localhost:5005/webhooks/rest/webhook"

def process_messages(message: str):
    rasa_payload = {"message": message}
    try:
        rasa_response = requests.post(RASA_URL, json=rasa_payload)
        rasa_response.raise_for_status()
        rasa_data = rasa_response.json()
        if "buttons" in rasa_data[0]:
            return rasa_data
        elif "text" in rasa_data[0]:
            rasa_reply = rasa_data[0]["text"]
            response = f"{rasa_reply}"
            return response
        elif "custom" in rasa_data[0]:
            return rasa_data
    except Exception as e:
        return f"Error communicating with Chatbot services: {e}"
    return f"There has been an issue. Please come back later"
    