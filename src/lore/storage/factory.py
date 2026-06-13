from functools import lru_cache

from lore.core.config import get_settings
from lore.storage.base import Store
from lore.storage.memory import MemoryStore
from lore.storage.mongo import MongoStore


@lru_cache
def get_store() -> Store:
    settings = get_settings()
    if settings.mongo_uri:
        return MongoStore(settings.mongo_uri, settings.mongo_db)
    return MemoryStore()
