import time
import requests
from typing import List, Dict, Optional
from backend.config import get_settings
import os
import base64

settings = get_settings()

# Base URL for GitHub API
GITHUB_API = "https://api.github.com"

# Read token from env or settings
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN") or settings.GITHUB_TOKEN

HEADERS = {"Accept": "application/vnd.github+json"}
if GITHUB_TOKEN:
    HEADERS["Authorization"] = f"token {GITHUB_TOKEN}"


def _retry_request(
    url: str,
    params: dict = None,
    max_retries: int = 2
) -> Optional[requests.Response]:
    backoff = 1
    for _ in range(max_retries):
        resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
        if resp.status_code == 200:
            return resp
        if resp.status_code in (403, 429) or 500 <= resp.status_code < 600:
            time.sleep(backoff)
            backoff *= 2
            continue
        return resp
    return None


def search_repos(topic: str, max_items: int = 30) -> List[Dict]:
    if not topic:
        return []

    params = {
        "q": f"{topic} in:name,description,readme",
        "sort": "stars",
        "order": "desc",
        "per_page": max_items,  # ask GitHub to return top 30 repos directly
        "page": 1
    }

    r = _retry_request(f"{GITHUB_API}/search/repositories", params=params)
    if r is None or r.status_code != 200:
        return []

    data = r.json()
    repos = data.get("items", [])

    items = []
    for repo in repos:
        items.append({
            "source": "github",
            "ext_id": repo.get("full_name"),
            "title": repo.get("name"),
            "desc": repo.get("description"),
            "topics": repo.get("topics", []),
            "stars": repo.get("stargazers_count"),
            "language": repo.get("language"),
            "url": repo.get("html_url"),
        })

    return items[:max_items]



def fetch_readme(full_name: str) -> Optional[str]:
    r = _retry_request(f"{GITHUB_API}/repos/{full_name}/readme")
    if r is None or r.status_code != 200:
        return None

    data = r.json()
    content = data.get("content")
    if content and data.get("encoding") == "base64":
        return base64.b64decode(content).decode("utf-8", errors="ignore")

    return None
