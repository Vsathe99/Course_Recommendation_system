from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Dict, Any
import os
from pymongo import MongoClient, ASCENDING
from bson import ObjectId

# --- Mongo connection ---
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "fiass_app")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

items_col = db["items"]
interactions_col = db["interactions"]

# --- Indexes ---
items_col.create_index([("topic", ASCENDING)])
interactions_col.create_index([("user_id", ASCENDING)])
interactions_col.create_index([("item_id", ASCENDING)])

# ---------- Item Helpers ----------
def get_items_by_ids(item_ids: List[str]) -> List[Dict[str, Any]]:
    """
    Fetch items by their MongoDB _id (ObjectId) strings.
    Use this ONLY when you genuinely have ObjectId strings.
    """
    ids = [ObjectId(i) for i in item_ids if i]
    return list(items_col.find({"_id": {"$in": ids}}))


def get_items_by_topic(topic: str) -> List[Dict[str, Any]]:
    return list(items_col.find({"topic": topic}))


def insert_item(item: Dict[str, Any]) -> str:
    item.setdefault("created_at", datetime.utcnow())
    result = items_col.insert_one(item)
    return str(result.inserted_id)


def get_item_by_numeric_id(num_id: int):
    """
    Retrieve a document by the numeric ID used in FAISS.
    The numeric ID is derived from the MongoDB ObjectId's last 8 hex chars.
    """
    for doc in items_col.find(
        {},
        {"_id": 1, "source": 1, "title": 1, "url": 1, "desc": 1, "topic": 1, "popularity": 1},
    ):
        doc_num_id = int(str(doc["_id"])[-8:], 16) % (10**8)
        if doc_num_id == num_id:
            return doc
    return None


def get_items_by_numeric_ids(num_ids: List[int]) -> List[Dict[str, Any]]:
    """
    Batch version of get_item_by_numeric_id.
    Takes numeric FAISS IDs (ints) and returns matching docs.
    """
    num_set = {int(n) for n in num_ids}
    results: List[Dict[str, Any]] = []

    for doc in items_col.find(
        {},
        {"_id": 1, "source": 1, "title": 1, "url": 1, "desc": 1, "topic": 1, "popularity": 1},
    ):
        doc_num_id = int(str(doc["_id"])[-8:], 16) % (10**8)
        if doc_num_id in num_set:
            # attach numeric_id if you want to use it later
            doc["numeric_id"] = doc_num_id
            results.append(doc)

    return results

# ---------- Interaction Helpers ----------
def log_interaction(
    user_id: str,
    item_id: str,
    event: str,
    dwell_time_ms: Optional[int] = None,
):
    doc = {
        "user_id": user_id,
        "item_id": ObjectId(item_id),
        "event": event,
        "ts": datetime.utcnow(),
        "dwell_time_ms": dwell_time_ms,
    }
    interactions_col.insert_one(doc)


def get_interactions_by_topic(topic: str):
    ids = [it["_id"] for it in items_col.find({"topic": topic}, {"_id": 1})]
    return list(interactions_col.find({"item_id": {"$in": ids}}))
