import os
import pandas as pd
from backend.core.embedding import embed_texts
from backend.core.faiss_store import FaissStore
from backend.core.db import insert_item

def build_index(topic: str, source: str, faiss_path: str):
    # Load data
    parquet_path = f"data/raw/{source}/{topic}.parquet"
    if not os.path.exists(parquet_path):
        raise FileNotFoundError(f"Missing parquet file: {parquet_path}")

    df = pd.read_parquet(parquet_path)

    # Construct text fields
    if source == "github":
        texts = (
            df["title"].fillna("") + " " +
            df["desc"].fillna("") + " " +
            df.get("topics", "").astype(str)
        ).tolist()
    else:  # youtube
        texts = (
            df["title"].fillna("") + " " +
            df["desc"].fillna("") + " " +
            df.get("transcript", "").fillna("")
        ).tolist()

    # Generate embeddings
    vecs = embed_texts(texts)

    # Store metadata in MongoDB and collect assigned IDs
    ids = []
    for _, row in df.iterrows():
        doc = {
            "source": source,
            "ext_id": str(row.get("ext_id", "")),
            "title": row.get("title", ""),
            "desc": row.get("desc", ""),
            "url": row.get("url", ""),
            "topic": topic,
            "popularity": int(row.get("stars", row.get("viewCount", 0))),
            "difficulty": row.get("difficulty", None),
        }
        inserted_id = insert_item(doc)
        ids.append(int(str(inserted_id)[-8:], 16) % (10**8))  # convert Mongo ObjectId to numeric ID

    # Build FAISS index
    store = FaissStore(dim=vecs.shape[1], path=faiss_path)
    store.load()
    store.upsert(vecs, ids)
    store.save()

    return len(ids)
