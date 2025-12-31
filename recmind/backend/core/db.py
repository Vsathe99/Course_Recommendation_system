from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Dict, Any
from bson import ObjectId
from pymongo import MongoClient, ASCENDING
from backend.config import get_settings

# ---------- Lazy Globals ----------
_client: MongoClient | None = None
_db = None
_indexes_created = False


def _get_client() -> MongoClient:
    global _client
    if _client is None:
        settings = get_settings()
        _client = MongoClient(settings.MONGO_URL)
    return _client


def _get_db():
    global _db
    if _db is None:
        settings = get_settings()
        _db = _get_client()[settings.DB_NAME]
        _ensure_indexes(_db)
    return _db


def _ensure_indexes(db):
    global _indexes_created
    if _indexes_created:
        return

    db.items.create_index([("topic", ASCENDING)])
    db.interactions.create_index([("user_id", ASCENDING)])
    db.interactions.create_index([("item_id", ASCENDING)])

    _indexes_created = True


# ---------- Collections ----------
def _items_col():
    return _get_db()["items"]


def _interactions_col():
    return _get_db()["interactions"]


# ---------- Item Helpers ----------
def get_items_by_ids(item_ids: List[str]) -> List[Dict[str, Any]]:
    ids = [ObjectId(i) for i in item_ids if i]
    return list(_items_col().find({"_id": {"$in": ids}}))


def get_items_by_topic(topic: str) -> List[Dict[str, Any]]:
    return list(_items_col().find({"topic": topic}))


def insert_item(item: Dict[str, Any]) -> str:
    item.setdefault("created_at", datetime.utcnow())
    result = _items_col().insert_one(item)
    return str(result.inserted_id)


def get_item_by_numeric_id(num_id: int):
    for doc in _items_col().find(
        {},
        {
            "_id": 1,
            "source": 1,
            "title": 1,
            "url": 1,
            "desc": 1,
            "topic": 1,
            "popularity": 1,
        },
    ):
        doc_num_id = int(str(doc["_id"])[-8:], 16) % (10**8)
        if doc_num_id == num_id:
            return doc
    return None


def get_items_by_numeric_ids(num_ids: List[int]) -> List[Dict[str, Any]]:
    num_set = {int(n) for n in num_ids}
    results: List[Dict[str, Any]] = []

    for doc in _items_col().find(
        {},
        {
            "_id": 1,
            "source": 1,
            "title": 1,
            "url": 1,
            "desc": 1,
            "topic": 1,
            "popularity": 1,
        },
    ):
        doc_num_id = int(str(doc["_id"])[-8:], 16) % (10**8)
        if doc_num_id in num_set:
            doc["numeric_id"] = doc_num_id
            results.append(doc)

    return results

def set_item_numeric_id(item_id: str, numeric_id: int):
    _items_col().update_one(
        {"_id": ObjectId(item_id)},
        {"$set": {"numeric_id": numeric_id}},
    )


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
    _interactions_col().insert_one(doc)


def get_interactions_by_topic(topic: str):
    ids = [
        it["_id"]
        for it in _items_col().find({"topic": topic}, {"_id": 1})
    ]
    return list(
        _interactions_col().find({"item_id": {"$in": ids}})
    )