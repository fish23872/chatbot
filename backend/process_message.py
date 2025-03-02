import spacy
from spacy.matcher import PhraseMatcher
import re

# Load the spaCy model once
nlp = spacy.load("en_core_web_md")

def process_message(message: str) -> str:
    """
    Processes the incoming message using spaCy to extract entities, keywords.
    Returns a formatted response string.
    """
    doc = nlp(message.lower())
    entities = [(ent.text, ent.label_) for ent in doc.ents]
    keywords = [token.lemma_ for token in doc if token.is_alpha and not token.is_stop]

    # Generate response
    response = f"You said: {message}\n"
    if entities:
        response += f"I recognized these entities: {entities}\n"
    if keywords:
        response += f"Keywords detected: {', '.join(keywords)}\n"
    
    return response