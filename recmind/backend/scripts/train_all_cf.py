import sys
from pathlib import Path

# 🔑 Add project root (recmind) to PYTHONPATH
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from backend.recommender.cf import CFModel
from backend.core.faiss_store import FaissStore
from backend.core import db


def normalize_topic(topic: str) -> str:
    return (
        topic.strip()
        .lower()
        .replace(" ", "_")
        .replace("/", "_")
    )


def main():
    topics = db._get_db()["items"].distinct("topic")

    for raw_topic in topics:
        

        try:
            faiss = FaissStore.from_topic(raw_topic)
        except FileNotFoundError:
            print(f"[SKIP] No FAISS index for topic: {raw_topic}")
            continue

        cf = CFModel(raw_topic, faiss)

        if not cf.is_trained() or cf.is_stale(days=15):
            print(f"[TRAIN] Training CF for topic: {raw_topic}")
            cf.fit()
        else:
            print(f"[SKIP] Model fresh for topic: {raw_topic}")


if __name__ == "__main__":
    main()
