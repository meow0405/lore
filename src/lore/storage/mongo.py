from pymongo import ASCENDING, MongoClient, ReplaceOne

from lore.core.models import (
    Annotation,
    Capsule,
    CommitRecord,
    ExpertScore,
    FileFeature,
    GitHubSnapshot,
    GraphPayload,
)
from lore.graph.builder import build_graph
from lore.storage.memory import MemoryStore


class MongoStore(MemoryStore):
    """Mongo-backed store with MemoryStore read behavior for fast hackathon iteration."""

    def __init__(self, uri: str, db_name: str) -> None:
        super().__init__()
        self.client = MongoClient(uri)
        self.db = self.client[db_name]
        self._ensure_indexes()

    def _ensure_indexes(self) -> None:
        for name in ["file_features", "capsules", "expert_scores", "annotations", "graph_nodes"]:
            self.db[name].create_index([("repo_id", ASCENDING), ("file_path", ASCENDING)])
        self.db.github_snapshots.create_index([("repo_id", ASCENDING)], unique=True)

    async def save_commits(self, commits: list[CommitRecord]) -> None:
        await super().save_commits(commits)
        if commits:
            self.db.commits.insert_many([item.model_dump(mode="json") for item in commits])

    async def save_file_features(self, features: list[FileFeature]) -> None:
        await super().save_file_features(features)
        if features:
            self.db.file_features.bulk_write(
                [
                    ReplaceOne(
                        {"repo_id": item.repo_id, "file_path": item.file_path},
                        item.model_dump(mode="json"),
                        upsert=True,
                    )
                    for item in features
                ]
            )

    async def save_expert_scores(self, scores: list[ExpertScore]) -> None:
        await super().save_expert_scores(scores)
        if scores:
            self.db.expert_scores.insert_many([item.model_dump(mode="json") for item in scores])

    async def save_capsules(self, capsules: list[Capsule]) -> None:
        await super().save_capsules(capsules)
        if capsules:
            self.db.capsules.bulk_write(
                [
                    ReplaceOne(
                        {"repo_id": item.repo_id, "file_path": item.file_path},
                        item.model_dump(mode="json"),
                        upsert=True,
                    )
                    for item in capsules
                ]
            )

    async def save_github_snapshot(self, snapshot: GitHubSnapshot) -> None:
        await super().save_github_snapshot(snapshot)
        self.db.github_snapshots.replace_one(
            {"repo_id": snapshot.repo_id},
            snapshot.model_dump(mode="json"),
            upsert=True,
        )

    async def add_annotation(self, annotation: Annotation) -> None:
        await super().add_annotation(annotation)
        self.db.annotations.insert_one(annotation.model_dump(mode="json"))

    async def get_file_feature(self, repo_id: str, file_path: str) -> FileFeature | None:
        cached = await super().get_file_feature(repo_id, file_path)
        if cached:
            return cached
        data = self.db.file_features.find_one({"repo_id": repo_id, "file_path": file_path}, {"_id": 0})
        return FileFeature.model_validate(data) if data else None

    async def get_features(self, repo_id: str) -> list[FileFeature]:
        cached = await super().get_features(repo_id)
        if cached:
            return cached
        return [
            FileFeature.model_validate(item)
            for item in self.db.file_features.find({"repo_id": repo_id}, {"_id": 0})
        ]

    async def get_experts(self, repo_id: str, file_path: str) -> list[ExpertScore]:
        cached = await super().get_experts(repo_id, file_path)
        if cached:
            return cached
        docs = self.db.expert_scores.find(
            {"repo_id": repo_id, "file_path": file_path},
            {"_id": 0},
        ).sort("final_score", -1).limit(5)
        return [ExpertScore.model_validate(item) for item in docs]

    async def get_capsule(self, repo_id: str, file_path: str) -> Capsule | None:
        cached = await super().get_capsule(repo_id, file_path)
        if cached:
            return cached
        data = self.db.capsules.find_one({"repo_id": repo_id, "file_path": file_path}, {"_id": 0})
        return Capsule.model_validate(data) if data else None

    async def get_github_snapshot(self, repo_id: str) -> GitHubSnapshot | None:
        cached = await super().get_github_snapshot(repo_id)
        if cached:
            return cached
        data = self.db.github_snapshots.find_one({"repo_id": repo_id}, {"_id": 0})
        return GitHubSnapshot.model_validate(data) if data else None

    async def get_graph(self, repo_id: str) -> GraphPayload:
        return build_graph(repo_id, await self.get_features(repo_id))
