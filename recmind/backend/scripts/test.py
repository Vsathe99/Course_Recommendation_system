import sys
from pathlib import Path

# Add project root to PYTHONPATH
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from backend.core.faiss_store import FaissStore
from backend.core.paths import FAISS_DIR


def normalize_topic(topic: str) -> str:
    return (
        topic.strip()
        .lower()
        .replace(" ", "_")
        .replace("/", "_")
    )


def test_faiss_topic(topic: str):
    print("====================================")
    print(f"RAW TOPIC      : '{topic}'")

    topic_id = normalize_topic(topic)
    expected_path = FAISS_DIR / f"{topic_id}.index"

    print(f"NORMALIZED ID  : '{topic_id}'")
    print(f"EXPECTED PATH : {expected_path}")
    print(f"FILE EXISTS   : {expected_path.exists()}")

    print("\nFILES IN FAISS_DIR:")
    for f in FAISS_DIR.iterdir():
        print("  -", f.name)

    print("\nTRYING TO LOAD FAISS INDEX...")
    try:
        store = FaissStore.from_topic(topic)
        print("✅ SUCCESS: FAISS index loaded")
        print("Index dim:", store.index.d)
        print("Total vectors:", store.index.ntotal)
    except FileNotFoundError as e:
        print("❌ FAILED:", e)


if __name__ == "__main__":
    # 🔴 CHANGE THIS TO YOUR ACTUAL TOPIC
    test_faiss_topic("python")
