from pymongo import MongoClient
from datetime import datetime
from bson.objectid import ObjectId
import os

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)

# Database and collection
db = client["faiss_app"]
items_collection = db["Courses"]

# Item operations
def insert_item(data: dict):
    """Insert a new document (metadata record)."""
    data["created_at"] = datetime.utcnow()
    result = items_collection.insert_one(data)
    return str(result.inserted_id)

def get_item_by_id(item_id: str):
    """Fetch item by MongoDB ObjectId."""
    return items_collection.find_one({"_id": ObjectId(item_id)})

def get_items_by_topic(topic: str):
    """Fetch all items for a given topic."""
    return list(items_collection.find({"topic": topic}))

def update_item(item_id: str, updates: dict):
    """Update item by ID."""
    return items_collection.update_one(
        {"_id": ObjectId(item_id)}, {"$set": updates}
    )

def delete_item(item_id: str):
    """Delete item by ID."""
    return items_collection.delete_one({"_id": ObjectId(item_id)})

def init_db():
    """Ensure indexes and setup."""
    items_collection.create_index("topic")
    items_collection.create_index("source")
    
def get_item_by_numeric_id(num_id: int):
    """
    Retrieve a document by the numeric ID used in FAISS.
    The numeric ID is derived from the MongoDB ObjectId's last 8 hex chars.
    """
    for doc in items_collection.find({}, {"_id": 1, "source": 1, "title": 1, "url": 1, "desc": 1, "topic": 1, "popularity": 1}):
        doc_num_id = int(str(doc["_id"])[-8:], 16) % (10**8)
        if doc_num_id == num_id:
            return doc
    return None
