import os
from pathlib import Path
import pandas as pd
from backend.config import get_settings

settings = get_settings()


def ensure_data_dir(source: str, topic: str) -> Path:
    """
    Ensures that the data directory for a given source exists,
    and returns the full path to the Parquet file for the topic.
    """
    base = Path(settings.DATA_DIR) / source
    base.mkdir(parents=True, exist_ok=True)
    return base / f"{topic}.parquet"


def write_parquet(records: list[dict], source: str, topic: str) -> str:
    """
    Writes a list of records (dictionaries) to a Parquet file.
    Creates an empty DataFrame with 'ext_id' column if records are empty.
    Returns the path to the saved Parquet file.
    """
    print("DATA_DIR =", settings.DATA_DIR)
    print("CWD =", os.getcwd())

    path = ensure_data_dir(source, topic)
    print("PARQUET PATH =", path)

    if not records:
        df = pd.DataFrame(columns=["ext_id"])
    else:
        df = pd.DataFrame.from_records(records)

    df.to_parquet(path, index=False)
    return str(path)
