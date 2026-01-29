import os
import numpy as np
import pandas as pd
from bson import ObjectId

from backend.core.embedding import embed_texts
from backend.core.faiss_store import FaissStore
from backend.core.db import insert_item, set_item_numeric_id
from backend.config import get_settings


settings = get_settings()


def _safe_col(df: pd.DataFrame, name: str) -> pd.Series:
    """
    Return df[name].fillna("") if it exists,
    otherwise an empty-string Series of same length.
    """
    if name in df.columns:
        return df[name].fillna("")
    return pd.Series([""] * len(df), index=df.index)


def build_index(topic: str, source: str, faiss_path: str) -> int:
    """
    Build / extend FAISS index for one (topic, source) pair.

    Returns:
        number of items indexed for this call.
        If 0, nothing was added (empty parquet or no usable rows).
    """

    print("=== BUILD INDEX START ===")
    print("Topic:", topic)
    print("Source:", source)

    parquet_path = os.path.join(settings.RAW_DATA_DIR, source, f"{topic}.parquet")
    print("Parquet path:", parquet_path)

    if not os.path.exists(parquet_path):
        raise FileNotFoundError(f"Missing parquet file: {parquet_path}")

    df = pd.read_parquet(parquet_path)
    print("Parquet loaded. Rows:", len(df))

    # If no rows, nothing to index
    if df.empty:
        print("Parquet is empty. Nothing to index.")
        return 0

    # ------------- Construct text fields safely -------------
    if source == "github":
        titles = _safe_col(df, "title")
        descs = _safe_col(df, "desc")
        topics = _safe_col(df, "topics").astype(str)
        texts = (titles + " " + descs + " " + topics).tolist()
    else:  # youtube
        titles = _safe_col(df, "title")
        descs = _safe_col(df, "desc")
        transcripts = _safe_col(df, "transcript")
        texts = (titles + " " + descs + " " + transcripts).tolist()

    print("Texts constructed:", len(texts))

    if not texts:
        print("No texts found. Exiting.")
        return 0

    # ------------- Generate embeddings -------------
    vecs = embed_texts(texts)
    vecs = np.array(vecs)

    print("Embeddings generated. Shape:", vecs.shape)

    if vecs.size == 0:
        print("No embeddings generated. Exiting.")
        return 0

    if vecs.ndim == 1:
        vecs = vecs.reshape(1, -1)
    elif vecs.ndim != 2:
        raise ValueError(f"Unexpected embedding shape: {vecs.shape}")

    n_docs, dim = vecs.shape
    print("Docs:", n_docs, "Dim:", dim)

    # ------------- Store metadata + build numeric IDs -------------
    ids: list[int] = []

    print("Starting MongoDB inserts...")
    print("Mongo URI:", settings.MONGO_URI)

    for idx, (_, row) in enumerate(df.iterrows()):
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

        try:
            inserted_id = insert_item(doc)
            print(f"[{idx}] Inserted Mongo ID:", inserted_id)
        except Exception as e:
            print(f"[{idx}] Mongo insert FAILED:", repr(e))
            raise

        if inserted_id is None:
            raise RuntimeError("insert_item() returned None")

        numeric_id = int(str(inserted_id)[-8:], 16) % (10**8)

        try:
            set_item_numeric_id(inserted_id, numeric_id)
            print(f"[{idx}] numeric_id set:", numeric_id)
        except Exception as e:
            print(f"[{idx}] Failed to set numeric_id:", repr(e))
            raise

        ids.append(numeric_id)

    print("Mongo inserts completed. Total:", len(ids))

    if len(ids) != n_docs:
        raise ValueError(
            f"IDs count ({len(ids)}) != embeddings count ({n_docs}) "
            f"for topic={topic}, source={source}"
        )

    # ------------- Build / update FAISS index -------------
    print("Updating FAISS index...")

    store = FaissStore(dim=dim, path=faiss_path)
    store.load()
    store.upsert(vecs, ids)
    store.save()

    print("FAISS update complete.")
    print("=== BUILD INDEX END ===")

    return len(ids)
