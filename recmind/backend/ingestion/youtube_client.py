from typing import List, Dict, Optional
from googleapiclient.discovery import build
from backend.config import get_settings
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound


settings = get_settings()


def _get_youtube_client():
    if not settings.YOUTUBE_API_KEY:
        raise RuntimeError("YOUTUBE_API_KEY not set")
    return build("youtube", "v3", developerKey=settings.YOUTUBE_API_KEY)


def search_videos(query: str, max_items: int = 50) -> List[Dict]:
    youtube = _get_youtube_client()
    results: List[Dict] = []
    next_page_token = None

    while len(results) < max_items:
        resp = youtube.search().list(
            q=query,
            type="video",
            part="id,snippet",
            maxResults=50,
            pageToken=next_page_token,
            order="viewCount",
        ).execute()

        items = resp.get("items", [])
        ids = [it["id"]["videoId"] for it in items if it.get("id") and it["id"].get("videoId")]

        stats_map = {}
        if ids:
            stats_resp = youtube.videos().list(
                part="statistics",
                id=','.join(ids)
            ).execute()
            stats_map = {v["id"]: v.get("statistics", {}) for v in stats_resp.get("items", [])}

        for it in items:
            vid = it["id"].get("videoId")
            if not vid:
                continue

            snippet = it["snippet"]
            stat = stats_map.get(vid, {})

            results.append({
                "source": "youtube",
                "ext_id": vid,
                "title": snippet.get("title"),
                "desc": snippet.get("description"),
                "channelTitle": snippet.get("channelTitle"),
                "publishedAt": snippet.get("publishedAt"),
                "viewCount": int(stat.get("viewCount")) if stat.get("viewCount") else None,
                "url": f"https://www.youtube.com/watch?v={vid}",
            })

            if len(results) >= max_items:
                break

        next_page_token = resp.get("nextPageToken")
        if not next_page_token:
            break

    return results


def fetch_transcript(video_id: str) -> Optional[str]:
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        return "\n".join([t.get("text", "") for t in transcript_list])
    except (TranscriptsDisabled, NoTranscriptFound):
        return None
    except Exception:
        return None