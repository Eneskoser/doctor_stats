import json
from typing import Any, Optional
from redis import Redis
from app.core.config import settings


class CacheService:
    def __init__(self):
        self.redis = Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True,
        )
        self.default_ttl = 3600  # 1 hour

    def _generate_key(self, prefix: str, identifier: str) -> str:
        return f"{prefix}:{identifier}"

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        try:
            serialized_value = json.dumps(value)
            return self.redis.set(
                key, serialized_value, ex=ttl if ttl is not None else self.default_ttl
            )
        except (TypeError, json.JSONDecodeError):
            return False

    def get(self, key: str) -> Optional[Any]:
        try:
            value = self.redis.get(key)
            if value is None:
                return None
            return json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return None

    def delete(self, key: str) -> bool:
        return bool(self.redis.delete(key))

    def get_analysis_cache_key(
        self, dataset_id: str, analysis_type: str, params: dict
    ) -> str:
        """Generate a cache key for analysis results"""
        params_str = json.dumps(params, sort_keys=True)
        return self._generate_key(
            f"analysis:{analysis_type}", f"{dataset_id}:{params_str}"
        )


cache_service = CacheService()
