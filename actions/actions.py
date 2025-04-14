import re
from rasa_sdk import Action, Tracker, FormValidationAction
from rasa_sdk.events import SlotSet, AllSlotsReset, FollowupAction
from rasa_sdk.executor import CollectingDispatcher
from openai import OpenAI
import os
from dotenv import load_dotenv
import random

load_dotenv()
FALLBACK_COUNTER = 0
openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

phone_data = {
    "samsung galaxy s25": {
        "normalized_name": "Samsung Galaxy S25",
        "available": True,
        "quantity": 10,
        "price": 1200,
        "discount": "20% off",
        "review_score": 4.7,
        "image_url": "https://phonedb.net/img/samsung_galaxy_s25_5g.jpg",
        "key_features": ["200MP Camera", "5000mAh Battery"],
        "purchase_url": "https://store.com/s25",
        "score": 2265528
    },
    "samsung galaxy s24": {
        "normalized_name": "Samsung Galaxy S25",
        "available": True,
        "quantity": 10,
        "price": 1000,
        "discount": None,
        "review_score": 4.1,
        "image_url": "https://phonedb.net/img/samsung_galaxy_s24_5g.jpg",
        "key_features": ["100MP Camera", "5000mAh Battery"],
        "purchase_url": "https://store.com/s25",
        "score": 1639695
    },
    "samsung galaxy s22": {
        "normalized_name": "Samsung Galaxy S22",
        "available": True,
        "quantity": 100,
        "price": 300,
        "discount": "",
        "review_score": 5,
        "image_url": "https://phonedb.net/img/samsung_galaxy_s22_5g.jpg",
        "key_features": ["100MP Camera"],
        "purchase_url": "https://store.com/s25",
        "score": 1022200
    },
    "iphone 13 pro max": {
        "normalized_name": "iPhone 13 Pro Max",
        "available": True,
        "quantity": 5,
        "price": 1200,
        "discount": "15% off",
        "review_score": 4.8,
        "image_url": "https://phonedb.net/img/apple_iphone13_pro_max_3.jpg",
        "key_features": ["4352mAh Battery"],
        "purchase_url": "https://store.com/s25",
        "score": 1327255
    },
    "xiaomi mi 11": {
        "normalized_name": "Xiaomi Mi 11",
        "available": True,
        "quantity": 3,
        "price": 699,
        "discount": "10% off",
        "review_score": 4.3,
        "image_url": "https://phonedb.net/img/xiaomi_redmi_k80.jpg",
        "key_features": [],
        "purchase_url": "https://store.com/s25",
        "score": 1022200
    },
    "oneplus 9 pro": {
        "normalized_name": "OnePlus 9 Pro",
        "available": True,
        "quantity": 1,
        "price": 899,
        "discount": None,
        "review_score": 4.5,
        "image_url": "https://phonedb.net/img/oneplus9_pro.jpg",
        "key_features": [],
        "purchase_url": "https://store.com/s25",
        "score": 877600
    },
    "iphone 14 pro": {
        "normalized_name": "iPhone 14 Pro",
        "available": True,
        "quantity": 2,
        "price": 999,
        "discount": None,
        "review_score": 4.6,
        "image_url": "https://phonedb.net/img/apple_iphone14_pro_4.jpg",
        "key_features": [],
        "purchase_url": "https://store.com/s25",
        "score": 1474011
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
            dispatcher.utter_message(json_message={
            "payload": "recommendations",
            "data": {
                "title": "5 Phones on Sale:",
                "phones": self._prepare_phone_data(discounted_models[:5])
            }
        })
        else:
            dispatcher.utter_message("Sorry, there are no phones on sale at the moment.") 
        return []
    
    def _prepare_phone_data(self, phone_list):
        return [
            {
                "name": data['normalized_name'],
                "price": data['price'],
                "rating": data['review_score'],
                "discount": data.get('discount'),
                "image_url": data.get('image_url', '/default-phone.png'),
                "features": data.get('key_features', []),
                "purchase_url": data.get('purchase_url')
            }
            for data in phone_list
        ]
class ActionAskPrice(BasePhoneAction):
    def name(self):
        return "action_ask_price"

    def generate_response(self, phone_data: dict):
        price = phone_data.get("price")
        if price is None:
            return "Sorry, we don't have pricing information for this phone yet.", False
        return f"The price of {phone_data['normalized_name']} is ${price}. Would you like to purchase one?", True

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
        dispatcher.utter_message(response="utter_escalate_to_human")
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
        mi_match = re.match(r"(?:xiaomi\s+)?mi\s+(\d+)(?:\s+(t|pro|ultra))?$", model_lower)
        if mi_match:
            model_num = mi_match.group(1)
            suffix = mi_match.group(2)
            base = f"Xiaomi Mi {model_num}"
            return f"{base} {suffix.title()}" if suffix else base
        
        redmi_match = re.match(r"(?:xiaomi\s+)?redmi(?:\s+note)?\s+(\d+)(?:\s+(pro|ultra))?$", model_lower)
        if redmi_match:
            model_num = redmi_match.group(1)
            suffix = redmi_match.group(2)
            base = f"Xiaomi Redmi {model_num}"
            return f"{base} {suffix.title()}" if suffix else base
        
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
class ActionComparePhonesUnused(Action):
    def name(self):
        return "action_compare_phones_unused"

    def run(self, dispatcher, tracker, domain):
        phone1 = tracker.get_slot("phone1")
        phone2 = tracker.get_slot("phone2")
        
        normalized_phone1 = ActionNormalizePhoneModel.normalize_model(self, str(phone1))
        normalized_phone2 = ActionNormalizePhoneModel.normalize_model(self, str(phone2))
        
        if normalized_phone1:
            normalized_phone1 = normalized_phone1.lower()
        if normalized_phone2:
            normalized_phone2 = normalized_phone2.lower()

        missing_phones = []
        if normalized_phone1 not in phone_data:
            missing_phones.append(phone1)
        if normalized_phone2 not in phone_data:
            missing_phones.append(phone2)

        if missing_phones:
            dispatcher.utter_message(
                text=f"Sorry, I don't have data for: {', '.join(missing_phones)}."
            )
            return [SlotSet("phone1", None), SlotSet("phone2", None)]

        phone1_data = phone_data[normalized_phone1]
        phone2_data = phone_data[normalized_phone2]

        short_json = self._shorten_json(phone1_data, phone2_data)
        summary = self._generate_summary_with_llm(short_json)
        
        dispatcher.utter_message(json_message={
            "payload": "recommendations",
            "data": {
                "phone1": {
                    "name": phone1_data['normalized_name'],
                    "price": phone1_data['price'],
                    "rating": phone1_data['review_score'],
                    "discount": phone1_data.get('discount'),
                    "image_url": phone1_data.get('image_url', '/default-phone.png'),
                    "features": phone1_data.get('key_features', []),
                    "purchase_url": phone1_data.get('purchase_url')
                },
                "phone2": {
                    "name": phone2_data['normalized_name'],
                    "price": phone2_data['price'],
                    "rating": phone2_data['review_score'],
                    "discount": phone2_data.get('discount'),
                    "image_url": phone2_data.get('image_url', '/default-phone.png'),
                    "features": phone2_data.get('key_features', []),
                    "purchase_url": phone2_data.get('purchase_url')
                },
                "specs": self._compare_specs(phone1_data, phone2_data),
                "summary": summary
            }
        })
        return [SlotSet("phone1", None), SlotSet("phone2", None)]

    def _generate_summary_with_llm(self, data):
        try:
            prompt = (
                "You are an expert assistant for a webshop selling mobile phones. "
                "When given a comparison of two phones, summarize the comparison between the phones you were given based on the data you will receive. "
                "Only answer with sentences, two or three. Summarize the strengths and weaknesses of both.\n\n"
                f"Data: {data}"
            )

            response = client.responses.create(
                model="gpt-4o-mini",
                input=prompt,
            )

            return response.output_text

        except Exception as e:
            print(f"LLM request failed: {e}")
            return "I couldn't generate a summary at the moment."

    def _compare_specs(self, phone1, phone2):
        return [
            {
                "name": "Price",
                "phone1": f"${phone1['price']} {phone1['discount'] or ''}",
                "phone2": f"${phone2['price']} {phone2['discount'] or ''}",
                "winner": "phone1" if phone1['price'] < phone2['price'] else "phone2"
            },
            {
                "name": "Review Score",
                "phone1": phone1['review_score'],
                "phone2": phone2['review_score'],
                "winner": "phone1" if phone1['review_score'] > phone2['review_score'] else "phone2"
            },
            {
                "name": "Availability",
                "phone1": "In Stock" if phone1['available'] else "Out of Stock",
                "phone2": "In Stock" if phone2['available'] else "Out of Stock",
                "winner": "phone1" if phone1['quantity'] > phone2['quantity'] else "phone2"
            },
            {
                "name": "Score",
                "phone1": phone1['score'],
                "phone2": phone2['score'],
                "winner": "phone1" if phone1['score'] > phone2['quantity'] else "phone2"
            }
        ]

    def _shorten_json(self, phone1, phone2):
        return {
            "p1": {
                "n": phone1['normalized_name'],
                "p": phone1['price'],
                "r": phone1['review_score'],
                "d": phone1['discount'],
                "f": phone1.get('key_features', []),
                "s": phone1['score']
            },
            "p2": {
                "n": phone2['normalized_name'],
                "p": phone2['price'],
                "r": phone2['review_score'],
                "d": phone2['discount'],
                "f": phone2.get('key_features', []),
                "s": phone2['score']
            },
            "s": [
                {"n": "price", "w": "p1" if phone1['price'] < phone2['price'] else "p2"},
                {"n": "score", "w": "p1" if phone1['review_score'] > phone2['review_score'] else "p2"},
                {"n": "avail", "w": "p1" if phone1['quantity'] > phone2['quantity'] else "p2"}
            ]
        }
class ActionNormalizePhoneModels(Action):
    def name(self):
        return "action_normalize_phone_models"

    def run(self, dispatcher, tracker, domain):
        entities = tracker.latest_message.get("entities", [])
        phone_models = []
        
        # Error handling for missing/insufficient entities
        if len(entities) == 0:
            dispatcher.utter_message("Please specify two phone models to compare, like: 'Compare iPhone 15 and Samsung S23'")
            return []
            
        elif len(entities) == 1:
            dispatcher.utter_message(f"I found '{entities[0]['value']}' to be a valid model but need another phone to compare. Please specify two models.")
            return []

        try:
            phone1 = entities[0]["value"]
            phone2 = entities[1]["value"]
            phone_models = [phone1, phone2]            
        except (KeyError, IndexError) as e:
            dispatcher.utter_message("Sorry, I had trouble understanding the phone models. Please try again.")
            return []
        
        if len(phone_models) >= 2:
            phone1 = ActionNormalizePhoneModel.normalize_model(self, phone1)
            phone2 = ActionNormalizePhoneModel.normalize_model(self, phone2)   
            if phone1 is None or phone2 is None:
                dispatcher.utter_message(text="Sorry, I couldn't recognize both phone models. Please try again.")
                return [SlotSet("phone_model", None)]

            return [SlotSet("phone1", phone1), SlotSet("phone2", phone2)]
        else:
            dispatcher.utter_message(text="Please specify exactly two phones to compare")
        
        return [SlotSet("phone_model", None)]
    

    
        # TODO: LLM evaluation of comparison data
        # TODO: Send out_of_scope to LLM
class ActionRecommendByBudget(Action):
    def name(self):
        return "action_recommend_by_budget"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: dict):

        message = tracker.latest_message.get('text').lower()
        
        if "premium" in message:
            return self._handle_premium(dispatcher)
        elif any(term in message for term in ["no budget", "unlimited", "no limit"]):
            return self._handle_unlimited(dispatcher)
        elif any(term in message for term in ["cheap", "budget", "affordable", "economy"]):
            return self._handle_cheap(dispatcher)
            
        amounts = re.findall(r'\d+', message)
        if amounts:
            max_price = int(amounts[0])
            return self._handle_numerical_budget(dispatcher, max_price)
            
        dispatcher.utter_message("Please specify a budget amount or range.")
        return []

    def _prepare_phone_data(self, phone_list):
        return [
            {
                "name": data['normalized_name'],
                "price": data['price'],
                "rating": data['review_score'],
                "discount": data.get('discount'),
                "image_url": data.get('image_url', '/default-phone.png'),
                "features": data.get('key_features', []),
                "purchase_url": data.get('purchase_url')
            }
            for name, data in phone_list
        ]

    def _handle_numerical_budget(self, dispatcher, max_price):
        eligible_phones = [
            (data['normalized_name'], data) 
            for model, data in phone_data.items()
            if data['available'] and data['price'] <= max_price
        ]
        
        if not eligible_phones:
            dispatcher.utter_message(f"No phones found under ${max_price}. Try increasing your budget by $100-200?")
            return []
        
        eligible_phones.sort(key=lambda x: (-x[1]['review_score'], x[1]['price']))
        
        dispatcher.utter_message(json_message={
            "payload": "recommendations",
            "data": {
                "title": f"Top {min(5, len(eligible_phones))} phones under ${max_price}",
                "phones": self._prepare_phone_data(eligible_phones[:5])
            }
        })
        return []

    def _handle_premium(self, dispatcher):
        premium_phones = [
            (data['normalized_name'], data)
            for model, data in phone_data.items()
            if data['available'] and data['price'] >= 1000
        ]
        
        premium_phones.sort(key=lambda x: (-x[1]['review_score'], x[1]['price']))
        
        dispatcher.utter_message(json_message={
            "payload": "recommendations",
            "data": {
                "title": "📱 Premium Flagship Phones",
                "phones": self._prepare_phone_data(premium_phones[:5])
            }
        })
        return []

    def _handle_unlimited(self, dispatcher):
        all_phones = [
            (data['normalized_name'], data)
            for model, data in phone_data.items()
            if data['available']
        ]
        
        all_phones.sort(key=lambda x: (-x[1]['review_score'], x[1]['price']))
        
        dispatcher.utter_message(json_message={
            "payload": "recommendations",
            "data": {
                "title": "💎 All Available Phones",
                "subtitle": "Sorted by highest rating",
                "phones": self._prepare_phone_data(all_phones[:5])
            }
        })
        return []

    def _handle_cheap(self, dispatcher):
        cheap_phones = [
            (data['normalized_name'], data)
            for model, data in phone_data.items()
            if data['available'] and data['price'] <= 300
        ]
        
        if not cheap_phones:
            cheap_phones = [
                (data['normalized_name'], data)
                for model, data in phone_data.items()
                if data['available']
            ]
            cheap_phones.sort(key=lambda x: x[1]['price'])
        
        dispatcher.utter_message(json_message={
            "payload": "recommendations",
            "data": {
                "title": "💰 Best Budget Phones",
                "phones": self._prepare_phone_data(cheap_phones[:5]),
                "badge": "Super Budget" if cheap_phones[0][1]['price'] <= 300 else None
            }
        })
        return []  
class ValidateComparePhonesForm(FormValidationAction):
    def name(self):
        return "validate_compare_phones_form"

    async def validate_phone1(
        self,
        value: str,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: dict,
    ):
        normalized = ActionNormalizePhoneModel().normalize_model(value)
        if not normalized:
            dispatcher.utter_message(response="utter_invalid_phone_model")
            dispatcher.utter_message(f"Sorry, I don't recognize '{value}' as a valid phone model")
            return {"phone1": None}
        return [SlotSet("phone1", normalized), SlotSet("phone_model", None)]

    async def validate_phone2(
        self,
        value: str,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: dict,
    ):
        normalized = ActionNormalizePhoneModel().normalize_model(value)
        
        if not normalized:
            dispatcher.utter_message(f"Sorry, I don't recognize '{value}' as a valid phone model")
            return SlotSet("phone1", None)
        
        phone1 = tracker.get_slot("phone1")
        
        if phone1 and normalized.lower() == phone1.lower():
            dispatcher.utter_message(response="utter_ask_clarify_comparison")
            return SlotSet("phone2", None)
        
        return [SlotSet("phone2", normalized), SlotSet("phone_model", None)]
class ActionComparePhones(FormValidationAction):
    def name(self):
        return "action_compare_phones"

    async def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict
    ):
        phone1 = tracker.get_slot("phone1")
        phone2 = tracker.get_slot("phone2")
        
        comparison_result = self.compare_models(phone1, phone2)
        
        dispatcher.utter_message(text=comparison_result)
        
        return [SlotSet("phone1", None), SlotSet("phone2", None)]

    def compare_models(self, phone1, phone2):
        return f"Comparison results:\n{phone1} vs {phone2}\n\n[Specs comparison would go here]"

class ActionOutOfScopeInquiry(Action):
    def name(self):
        return "action_out_of_scope_inquiry"

    async def run(
        self, 
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: dict):
        
        user_message = tracker.latest_message.get("text")
        
        try:
            response = self._get_llm_response(user_message)
            dispatcher.utter_message(text=response)
            
        except Exception as e:
            dispatcher.utter_message(text="I'm not sure how to answer that. Could you ask me something about mobile phones?")
            
        return []

    def _get_llm_response(self, user_input):
        """Get response from LLM for out-of-scope questions"""
        
        prompt = f"""
        You are an assistant for a webshop that sells mobile phones. 
        Your task is to inform the user that this service does not help with anything but mobile phones. 
        Keep it under 3 sentences. User question: {user_input}"""
        
        response = client.responses.create(
                model="gpt-4o-mini",
                input=prompt,
            )
        
        return response.output_text
