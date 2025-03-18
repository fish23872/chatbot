import re
from rasa_sdk import Action, Tracker
from rasa_sdk.events import SlotSet, AllSlotsReset
from rasa_sdk.executor import CollectingDispatcher
import random

class ActionSlotReset(Action): 	
    def name(self):
        return "action_check_stock"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        # Simulated stock data (TODO replace with a database or API call later)
        stock_data = {
            "samsung Galaxy s25": {"available": True, "quantity": 10},
            "iphone 13 pro max": {"available": True, "quantity": 5},
            "oneplus 9 pro": {"available": False, "quantity": 0},
            "xiaomi mi 11": {"available": True, "quantity": 3},
            "samsung galaxy s21 ultra": {"available": False, "quantity": 0},
            "oneplus 10": {"available": True, "quantity": 7},
            "iphone 15": {"available": True, "quantity": 15},
        }
        phone_model = next(tracker.get_latest_entity_values("phone_model"), None)

        if phone_model:
            phone_model = phone_model.lower()
            if phone_model in stock_data:
                stock_info = stock_data[phone_model]
                if stock_info["available"]:
                    response = f"Yes, the {phone_model.title()} is available. We have {stock_info['quantity']} in stock."
                else:
                    response = f"Sorry, the {phone_model.title()} is currently out of stock."
            else:
                response = f"Sorry, we don't carry the {phone_model.title()}."
        else:
            response = "Please specify the phone model you're asking about."
        dispatcher.utter_message(text=response)

        return []
class ActionGetDiscountedModels(Action):
    def name(self):
        return "action_get_discounted_models"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        # List of discounted phone models (TODO replace with actual data from a database)
        discounted_models = [
            {"model": "Samsung Galaxy S22", "discount": "20% off", "price": "$799"},
            {"model": "iPhone 13", "discount": "15% off", "price": "$849"},
            {"model": "Xiaomi Mi 11", "discount": "10% off", "price": "$699"},
        ]
        if discounted_models:
            response = "Here are some phones currently on sale:\n"
            for phone in discounted_models:
                response += f"- {phone['model']}: {phone['discount']}, now at {phone['price']}\n"
        else:
            response = "Sorry, there are no phones on sale at the moment."
        dispatcher.utter_message(text=response)
        return []
class ActionAskPrice(Action):
    def name(self):
        return "action_ask_price"

    def run(self, dispatcher, tracker, domain):
        phone_model = tracker.get_slot("phone_model")
        if phone_model:
            # Simulate fetching a random price between $500 and $1500
            price = random.randint(500, 1500)
            dispatcher.utter_message(text=f"The price of {phone_model} is ${price}.")
            return []
        return []

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
        return None