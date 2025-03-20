import re
from rasa_sdk import Action, Tracker
from rasa_sdk.events import SlotSet, AllSlotsReset
from rasa_sdk.executor import CollectingDispatcher
import random

phone_data = {
    "samsung galaxy s25": {
        "normalized_name": "Samsung Galaxy S25",
        "available": True,
        "quantity": 10,
        "price": 1000,
        "discount": "20% off",
        "review_score": 4.7,
    },
    "iphone 13 pro max": {
        "normalized_name": "iPhone 13 Pro Max",
        "available": True,
        "quantity": 5,
        "price": 1200,
        "discount": "15% off",
        "review_score": 4.8,
    },
    "xiaomi mi 11": {
        "normalized_name": "Xiaomi Mi 11",
        "available": True,
        "quantity": 3,
        "price": 699,
        "discount": "10% off",
        "review_score": 4.3,
    },
    "oneplus 9 pro": {
        "normalized_name": "OnePlus 9 Pro",
        "available": False,
        "quantity": 0,
        "price": 899,
        "discount": None,
        "review_score": 4.5,
    },
    "iphone 14 pro": {
        "normalized_name": "iPhone 14 Pro",
        "available": True,
        "quantity": 2,
        "price": 999,
        "discount": None,
        "review_score": 4.6,
    },
}
class BasePhoneAction(Action):
    def name(self):
        return "action_base"
    def get_phone_model(self, tracker: Tracker):
        """Retrieve and normalize the phone_model slot."""
        phone_model = tracker.get_slot("phone_model")
        if phone_model:
            return phone_model.lower()
        return None

    def get_phone_data(self, phone_model: str):
        """Retrieve phone data from the phone_data dictionary."""
        if phone_model in phone_data:
            return phone_data[phone_model]
        return None

    def generate_response(self, phone_data: dict):
        """Generate a response based on the phone data."""
        raise NotImplementedError("Subclasses must implement this method.")

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        phone_model = self.get_phone_model(tracker)
        if phone_model:
            data = self.get_phone_data(phone_model)
            if data:
                response = self.generate_response(data)
            else:
                response = f"Sorry, we don't have information for the {phone_model.title()}."
        else:
            response = "Please specify the phone model you're asking about."

        dispatcher.utter_message(text=response)
        return []

class ActionGetReviews(BasePhoneAction):
    def name(self):
        return "action_get_reviews"

    def generate_response(self, phone_data: dict):
        review_score = phone_data.get("review_score")
        return f"The {phone_data['normalized_name']} has a review score of {review_score}/5."

class ActionCheckStock(BasePhoneAction):
    def name(self):
        return "action_check_stock"

    def generate_response(self, phone_data: dict):
        if phone_data["available"]:
            return f"Yes, the {phone_data['normalized_name']} is available. We have {phone_data['quantity']} in stock."
        else:
            return f"Sorry, the {phone_data['normalized_name']} is currently out of stock."

class ActionGetDiscountedModels(BasePhoneAction):
    def name(self):
        return "action_get_discounted_models"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        discounted_models = [
            phone for phone in phone_data.values() if phone["discount"]
        ]

        if discounted_models:
            response = "Here are some phones currently on sale:\n"
            for phone in discounted_models:
                response += f"- {phone['normalized_name']}: {phone['discount']}, now at ${phone['price']}\n"
        else:
            response = "Sorry, there are no phones on sale at the moment."

        dispatcher.utter_message(text=response)
        return []
class ActionAskPrice(BasePhoneAction):
    def name(self):
        return "action_ask_price"

    def generate_response(self, phone_data: dict):
        price = phone_data.get("price")
        if price is None:
            return "Sorry, we don't have pricing information for this phone yet.", False
        return f"The price of {phone_data['normalized_name']} is ${price}.", True

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        phone_model = self.get_phone_model(tracker)
        if phone_model:
            data = self.get_phone_data(phone_model)
            if data:
                response, is_valid = self.generate_response(data)
                dispatcher.utter_message(text=response)
                return [SlotSet("is_valid_phone", is_valid)]
            else:
                dispatcher.utter_message(text=f"Sorry, we don't carry the {phone_model.title()}.")
                return [SlotSet("is_valid_phone", False)]
        else:
            dispatcher.utter_message(text="Please specify the phone model you're asking about.")
            return [SlotSet("is_valid_phone", False)]
class ActionEscalateToHuman(Action):
    def name(self):
        return "action_escalate_to_human"

    def run(self, dispatcher, tracker, domain):
        # TODO Logic to escalate to a human agent
        return None
class ActionNormalizePhoneModel(Action):
    def name(self):
        return "action_normalize_phone_model"

    def run(self, dispatcher, tracker, domain):
        phone_model = tracker.get_slot("phone_model")

        if phone_model:
            normalized_model = self.normalize_model(phone_model)

            if normalized_model:
                return [SlotSet("phone_model", normalized_model)]
            else:
                return [SlotSet("phone_model", None)]

        return []

    def normalize_model(self, model):
        """Dynamically normalize phone model names using regex."""
        model_lower = model.lower().strip()
        
        # Samsung
        match = re.match(r"(samsung\s*)?(galaxy\s*)?s(\d{1,2})\s*(\+|plus|ultra|fe|5g)?$", model_lower, re.IGNORECASE)
        if match:
            model_number = match.group(3) 
            variant = match.group(4)
            base_model = f"Samsung Galaxy S{model_number}"
            if variant:
                if variant.lower() == "plus":
                    return f"{base_model} +"
                return f"{base_model} {variant.title()}"
            return base_model
        
        # Xiaomi
        if re.match(r"mi \d+( t| pro| ultra)?$", model_lower):
            parts = model_lower.split()
            base = f"Xiaomi Mi {parts[1].upper()}"
            if len(parts) > 2:
                return f"{base} {parts[2].title()}"
            return base
        
        if re.match(r"redmi( note)? \d+( pro| ultra)?$", model_lower):
            return f"Xiaomi {model.title()}"
        
        # iPhone
        iphone_match = re.match(r"(iphone|i phone)\s*(\d{1,2})(\s*(pro))?(\s*(max))?$", model_lower)
        if iphone_match:
            model_number = iphone_match.group(2)
            pro = iphone_match.group(4)
            max_suffix = iphone_match.group(6)
            
            result = f"iPhone {model_number}"
            if pro:
                result += " Pro"
            if max_suffix:
                result += " Max"
            return result  
        
            # OnePlus
        oneplus_match = re.match(r"(oneplus|one plus|op)\s*(\d{1,2})(\s*(pro|t|r|ce|nord|ultra|5g))?(\s*(pro|t|r|ce|nord|ultra|5g))?$", model_lower)
        if oneplus_match:
            model_number = oneplus_match.group(2)
            variant1 = oneplus_match.group(4)
            variant2 = oneplus_match.group(6)
            
            result = f"OnePlus {model_number}"
            if variant1:
                result += f" {variant1.title()}"
            if variant2:
                result += f" {variant2.title()}"
            return result
        return None