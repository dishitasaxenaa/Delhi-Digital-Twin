import time
from typing import Any, Optional, Dict

class SimpleTTLCache:
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        entry = self._cache.get(key)
        if not entry:
            return None
        if time.time() > entry["expires_at"]:
            del self._cache[key]
            return None
        return entry["data"]

    def set(self, key: str, data: Any, ttl_seconds: int):
        self._cache[key] = {
            "data": data,
            "expires_at": time.time() + ttl_seconds,
            "cached_at": time.time(),
        }

    def get_cached_time(self, key: str) -> Optional[float]:
        entry = self._cache.get(key)
        return entry["cached_at"] if entry else None

    def clear(self):
        self._cache.clear()

cache = SimpleTTLCache()
