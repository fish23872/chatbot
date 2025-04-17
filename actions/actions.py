from rasa_sdk import Action, Tracker, FormValidationAction
from rasa_sdk.events import SlotSet, AllSlotsReset, FollowupAction
from rasa_sdk.executor import CollectingDispatcher
from .utils.llm_actions import LlmActions
from .utils.phone_normalizer import PhoneNormalizer
from .utils.database import MongoDB

FALLBACK_COUNTER = 0
db = MongoDB()
class BasePhoneAction(Action):
    def name(self):
        return "action_base"

    def get_phone_model(self, tracker: Tracker):
        """Retrieve and normalize the phone_model slot."""
        phone_model = tracker.get_slot("phone_model")
        if phone_model:
            return PhoneNormalizer.normalize(phone_model)
        return None

    def get_phone_data(self, phone_model: str):
        return db.get_phone(phone_model)

    def get_phones_by_filter(self, filter_dict: dict):
        return db.get_phones_by_filter(filter_dict)

    def generate_response(self, phone_data: dict):
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
        review_score = phone_data.get("review_score", "no review score")
        return f"The {phone_data['normalized_name']} has a review score of {review_score}/5."
class ActionCheckStock(BasePhoneAction):
    def name(self):
        return "action_check_stock"

    def generate_response(self, phone_data: dict):
        if phone_data.get("available", False):
            return f"Yes, the {phone_data['normalized_name']} is available. We have {phone_data.get('quantity', 0)} in stock."
        else:
            return f"Sorry, the {phone_data['normalized_name']} is currently out of stock."
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
        
class ActionGetDiscountedModels(Action):
    def name(self):
        return "action_get_discounted_models"
    
    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        discounted_models = db.get_phones_by_filter({
            "discount": {"$exists": True, "$ne": None},
            "available": True
        })

        if discounted_models:
            dispatcher.utter_message(json_message={
                "payload": "recommendations",
                "data": {
                    "title": "Phones on Sale:",
                    "phones": self._prepare_phone_data(discounted_models)
                }
            })
        else:
            dispatcher.utter_message("No discounted phones available currently.")
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

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        phone_model = tracker.get_slot("phone_model")
        if not phone_model:
            return []
            
        normalized_model = PhoneNormalizer.normalize(phone_model)
        
        if normalized_model:
            return [SlotSet("phone_model", normalized_model)]
        return [SlotSet("phone_model", None)]
class ActionComparePhones(Action):
    def name(self):
        return "action_compare_phones"

    def run(self, dispatcher, tracker, domain):
        phone1 = tracker.get_slot("phone1")
        phone2 = tracker.get_slot("phone2")
        
        normalized_phone1 = PhoneNormalizer.normalize(str(phone1))
        normalized_phone2 = PhoneNormalizer.normalize(str(phone2))

        phone1_data = db.get_phone(normalized_phone1)
        phone2_data = db.get_phone(normalized_phone2)
        
        if not phone1_data or not phone2_data:
            missing = []
            if not phone1_data: missing.append(phone1)
            if not phone2_data: missing.append(phone2)
            if None not in missing: 
                dispatcher.utter_message(f"Sorry, no data for: {', '.join(missing)}")
            return [SlotSet("phone1", None), SlotSet("phone2", None)]
        
        short_json = self._shorten_json(phone1_data, phone2_data)
        
        prompt = f"""
            You are an expert assistant for a webshop selling mobile phones.
            When given a comparison of two phones, summarize the comparison between the phones you were given based on the data you will receive.
            Only answer with sentences, two or three. Summarize the strengths and weaknesses of both.\n\n
            fData: {short_json}"""
        
        try:
            summary = LlmActions.create_response(prompt)
        except Exception as e:
            summary = "I couldn't give a summary at the moment"
        
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
            phone1 = PhoneNormalizer.normalize(phone1)
            phone2 = PhoneNormalizer.normalize(phone2)   
            if phone1 is None or phone2 is None:
                dispatcher.utter_message(text="Sorry, I couldn't recognize both phone models. Please try again.")
                return [SlotSet("phone_model", None)]

            return [SlotSet("phone1", phone1), SlotSet("phone2", phone2)]
        else:
            dispatcher.utter_message(text="Please specify exactly two phones to compare")
        
        return [SlotSet("phone_model", None)]
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

    def _prepare_phone_data(self, phone_docs):
        return [
            {
                "name": doc['normalized_name'],
                "price": doc['price'],
                "rating": doc['review_score'],
                "discount": doc.get('discount'),
                "image_url": doc['image_url'],
                "features": doc['key_features'],
                "purchase_url": doc.get('purchase_url')
            }
            for doc in phone_docs
        ]

    def _handle_numerical_budget(self, dispatcher, max_price):
        eligible_phones = list(db.phones.find({
            "price": {"$lte": max_price},
            "available": True
        }).sort([
            ("review_score", -1),
            ("price", 1)
        ]).limit(5))
        
        if not eligible_phones:
            dispatcher.utter_message(f"No phones found under ${max_price}. Try increasing your budget by $100-200?")
            return []
        
        dispatcher.utter_message(json_message={
            "payload": "recommendations",
            "data": {
                "title": f"Top {len(eligible_phones)} phones under ${max_price}",
                "phones": self._prepare_phone_data(eligible_phones)
            }
        })
        return []

    def _handle_premium(self, dispatcher):
        premium_phones = list(db.phones.find({
            "price": {"$gte": 1000},
            "available": True
        }).sort([
            ("review_score", -1),
            ("price", 1)
        ]).limit(5))
        
        dispatcher.utter_message(json_message={
            "payload": "recommendations",
            "data": {
                "title": "📱 Premium Flagship Phones",
                "phones": self._prepare_phone_data(premium_phones)
            }
        })
        return []

    def _handle_unlimited(self, dispatcher):
        all_phones = list(db.phones.find({
            "available": True
        }).sort([
            ("review_score", -1),
            ("price", 1)
        ]).limit(5))
        
        dispatcher.utter_message(json_message={
            "payload": "recommendations",
            "data": {
                "title": "💎 All Available Phones",
                "subtitle": "Sorted by highest rating",
                "phones": self._prepare_phone_data(all_phones)
            }
        })
        return []

    def _handle_cheap(self, dispatcher):
        cheap_phones = list(self.db.phones.find({
            "price": {"$lte": 300},
            "available": True
        }).sort("price", 1).limit(5))
        
        if not cheap_phones:
            cheap_phones = list(db.phones.find({
                "available": True
            }).sort("price", 1).limit(5))
        
        dispatcher.utter_message(json_message={
            "payload": "recommendations",
            "data": {
                "title": "💰 Best Budget Phones",
                "phones": self._prepare_phone_data(cheap_phones),
                "badge": "Super Budget" if cheap_phones and cheap_phones[0]['specs']['price'] <= 300 else None
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
        normalized = PhoneNormalizer.normalize(value)
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
        normalized = PhoneNormalizer.normalize(value)
        
        if not normalized:
            dispatcher.utter_message(f"Sorry, I don't recognize '{value}' as a valid phone model")
            return SlotSet("phone1", None)
        
        phone1 = tracker.get_slot("phone1")
        
        if phone1 and normalized.lower() == phone1.lower():
            dispatcher.utter_message(response="utter_ask_clarify_comparison")
            return SlotSet("phone2", None)
        
        return [SlotSet("phone2", normalized), SlotSet("phone_model", None)]
class ActionComparePhonesForm(FormValidationAction):
    def name(self):
        return "action_compare_phones_form"

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
        
        prompt = f"""
        You are an assistant for a webshop that sells mobile phones. 
        Your task is to inform the user that this service does not help with anything but mobile phones. 
        Keep it under 3 sentences. User question: {user_message}"""
        
        try:
            response = LlmActions.create_response(prompt)
            dispatcher.utter_message(text=response)
            
        except Exception as e:
            dispatcher.utter_message(text="I'm not sure how to answer that. Could you ask me something about mobile phones?")
            
        return []