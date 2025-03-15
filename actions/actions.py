import re
from rasa_sdk import Action
from rasa_sdk.events import SlotSet

class ActionNormalizePhoneModel(Action):
    def name(self):
        return "action_normalize_phone_model"

    def run(self, dispatcher, tracker, domain):
        phone_model = tracker.get_slot("phone_model")

        if phone_model:
            normalized_model = self.normalize_model(phone_model)
            
            # Check if normalization was successful
            if normalized_model is None:
                dispatcher.utter_message(text="I don't understand which model you're asking for, could you clarify?")
                return [SlotSet("phone_model", None)]  # Reset the slot to prevent further processing
            
            # If the model is successfully normalized, set the slot with the normalized model
            dispatcher.utter_message(text=f"Here is a link to the general information about {normalized_model}: [Product details](<link_to_{normalized_model.replace(' ', '_')}>)")
            return [SlotSet("phone_model", normalized_model)]

        return []

    def normalize_model(self, model):
        """Dynamically normalize phone model names using regex."""
        model_lower = model.lower().strip()

        # Normalize Samsung Galaxy S-series models
        match = re.match(r"(samsung\s*)?(galaxy\s*)?s(\d{2})\s*(\+|plus|ultra|fe|5g)?$", model_lower, re.IGNORECASE)
        if match:
            model_number = match.group(3)  # Extract the number (e.g., '23')
            variant = match.group(4)  # Extract the variant if exists (e.g., 'Plus', 'Ultra', 'FE')
            base_model = f"Samsung Galaxy S{model_number}"
            if variant:
                return f"{base_model} {variant.title()}"  # Ensure proper capitalization
            return base_model

        # Normalize Xiaomi models
        if re.match(r"mi \d+( t| pro| ultra)?$", model_lower):
            return f"Xiaomi Mi {model.split()[1].upper()}"

        if re.match(r"redmi( note)? \d+( pro| ultra)?$", model_lower):
            return f"Xiaomi {model.title()}"

        # Normalize iPhone models
        if re.match(r"iphone (\d{2}) pro max$", model_lower):
            return f"iPhone {model.split()[1]} Pro Max"
        if re.match(r"iphone (\d{2}) pro$", model_lower):
            return f"iPhone {model.split()[1]} Pro"

        return None  # Return None if no match is found