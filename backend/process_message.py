import spacy
from spacy.matcher import PhraseMatcher
import re
import requests

# Load the spaCy model once
nlp = spacy.load("en_core_web_md")

# Replace with your Rasa instance URL
RASA_URL = "http://localhost:5005/webhooks/rest/webhook"

def process_message(message: str) -> str:
    """
    Processes the incoming message using spaCy to extract entities, keywords.
    Returns a formatted response string that combines spaCy analysis and Rasa's response.
    """
    # Process the message using spaCy
    doc = nlp(message.lower())
    entities = [(ent.text, ent.label_) for ent in doc.ents]
    keywords = [token.lemma_ for token in doc if token.is_alpha and not token.is_stop]

    # Send the message to Rasa to get its response
    rasa_payload = {"message": message}
    try:
        rasa_response = requests.post(RASA_URL, json=rasa_payload)
        rasa_response.raise_for_status()
        rasa_data = rasa_response.json()
        rasa_reply = rasa_data[0]["text"] if rasa_data else "Sorry, I couldn't understand that."
    except requests.exceptions.RequestException as e:
        rasa_reply = f"Error communicating with Rasa: {e}"

    # Generate the combined response
    if entities:
        print(f"I recognized these entities: {entities}\n")
    if keywords:
        print(f"Keywords detected: {', '.join(keywords)}\n")
    response = f"Rasa response: {rasa_reply}"

    return response