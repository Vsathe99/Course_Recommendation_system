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
    parquet_path = os.path.join(settings.RAW_DATA_DIR, source, f"{topic}.parquet")
    if not os.path.exists(parquet_path):
        raise FileNotFoundError(f"Missing parquet file: {parquet_path}")

    df = pd.read_parquet(parquet_path)

    # If no rows, nothing to index
    if df.empty:
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

    # If somehow all texts list is empty, bail out
    if not texts:
        return 0

    # ------------- Generate embeddings -------------
    vecs = embed_texts(texts)  # could be list or np array
    vecs = np.array(vecs)

    # Possible shapes:
    # - (n, dim)  -> OK
    # - (dim,)    -> single vector, make it (1, dim)
    # - (0,)      -> no vectors, bail out
    if vecs.size == 0:
        return 0

    if vecs.ndim == 1:
        vecs = vecs.reshape(1, -1)
    elif vecs.ndim != 2:
        raise ValueError(f"Unexpected embedding shape: {vecs.shape}")

    n_docs, dim = vecs.shape

    # ------------- Store metadata + build numeric IDs -------------
    ids: list[int] = []

    # IMPORTANT: df.iterrows() order matches `texts` / `vecs`
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

        # Insert into Mongo
        inserted_id = insert_item(doc)  # returns string like "671fd4..."

        # Compute unique FAISS-safe numeric_id for *this* row
        numeric_id = int(str(inserted_id)[-8:], 16) % (10**8)

        # Persist numeric_id on the same document
        set_item_numeric_id(inserted_id, numeric_id)
        
        # Add to FAISS ids list
        ids.append(numeric_id)

    # Sanity check
    if len(ids) != n_docs:
        raise ValueError(
            f"IDs count ({len(ids)}) != embeddings count ({n_docs}) "
            f"for topic={topic}, source={source}"
        )

    # ------------- Build / update FAISS index -------------
    store = FaissStore(dim=dim, path=faiss_path)
    store.load()          # loads existing index if present
    store.upsert(vecs, ids)
    store.save()

    return len(ids)
