from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

load_dotenv()

class Users:
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
            self.db = self.client["users"]
            self.users = self.db["user-data"]
            print("Connected to MongoDB")
        except ConnectionFailure as e:
            print(f"MongoDB connection failed: {e}")
            raise
        
class Tickets:
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
            self.db = self.client["tickets"]
            self.tickets = self.db["ticket-data"]
            print("Connected to MongoDB")
        except ConnectionFailure as e:
            print(f"MongoDB connection failed: {e}")
            raise