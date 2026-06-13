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
from lore.storage.base import Store


class MemoryStore(Store):
    def __init__(self) -> None:
        self.commits: list[CommitRecord] = []
        self.features: dict[tuple[str, str], FileFeature] = {}
        self.experts: list[ExpertScore] = []
        self.capsules: dict[tuple[str, str], Capsule] = {}
        self.github_snapshots: dict[str, GitHubSnapshot] = {}
        self.annotations: list[Annotation] = []

    async def save_commits(self, commits: list[CommitRecord]) -> None:
        self.commits.extend(commits)

    async def save_file_features(self, features: list[FileFeature]) -> None:
        for feature in features:
            self.features[(feature.repo_id, feature.file_path)] = feature

    async def save_expert_scores(self, scores: list[ExpertScore]) -> None:
        self.experts.extend(scores)

    async def save_capsules(self, capsules: list[Capsule]) -> None:
        for capsule in capsules:
            self.capsules[(capsule.repo_id, capsule.file_path)] = capsule

    async def save_github_snapshot(self, snapshot: GitHubSnapshot) -> None:
        self.github_snapshots[snapshot.repo_id] = snapshot

    async def add_annotation(self, annotation: Annotation) -> None:
        self.annotations.append(annotation)

    async def get_file_feature(self, repo_id: str, file_path: str) -> FileFeature | None:
        return self.features.get((repo_id, file_path))

    async def get_features(self, repo_id: str) -> list[FileFeature]:
        return [feature for feature in self.features.values() if feature.repo_id == repo_id]

    async def get_experts(self, repo_id: str, file_path: str) -> list[ExpertScore]:
        return [
            score
            for score in self.experts
            if score.repo_id == repo_id and score.file_path == file_path
        ][:5]

    async def get_capsule(self, repo_id: str, file_path: str) -> Capsule | None:
        return self.capsules.get((repo_id, file_path))

    async def get_github_snapshot(self, repo_id: str) -> GitHubSnapshot | None:
        return self.github_snapshots.get(repo_id)

    async def get_graph(self, repo_id: str) -> GraphPayload:
        features = await self.get_features(repo_id)
        return build_graph(repo_id, features)
