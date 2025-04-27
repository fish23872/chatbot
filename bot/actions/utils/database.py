from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

load_dotenv()

class MongoDB:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        self.client = MongoClient(os.getenv("MONGODB_URI"))
        try:
            self.client.admin.command('ping')
            self.db = self.client["phone-data"]
            self.phones = self.db["phone-collection"]
            print("Connected to MongoDB")
        except ConnectionFailure as e:
            print("MongoDB connection failed")
            raise e

    def get_phone(self, model_name: str):
        """Get phone data by normalized name"""
        return self.phones.find_one({
                "normalized_name": model_name
        })

    def get_phones_by_filter(self, filter_dict: dict):
        """Get multiple phones matching filter"""
        return list(self.phones.find(filter_dict).limit(5))