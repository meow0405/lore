from abc import ABC, abstractmethod

from lore.core.models import (
    Annotation,
    Capsule,
    CommitRecord,
    ExpertScore,
    FileFeature,
    GitHubSnapshot,
    GraphPayload,
)


class Store(ABC):
    @abstractmethod
    async def save_commits(self, commits: list[CommitRecord]) -> None: ...

    @abstractmethod
    async def save_file_features(self, features: list[FileFeature]) -> None: ...

    @abstractmethod
    async def save_expert_scores(self, scores: list[ExpertScore]) -> None: ...

    @abstractmethod
    async def save_capsules(self, capsules: list[Capsule]) -> None: ...

    @abstractmethod
    async def save_github_snapshot(self, snapshot: GitHubSnapshot) -> None: ...

    @abstractmethod
    async def add_annotation(self, annotation: Annotation) -> None: ...

    @abstractmethod
    async def get_file_feature(self, repo_id: str, file_path: str) -> FileFeature | None: ...

    @abstractmethod
    async def get_features(self, repo_id: str) -> list[FileFeature]: ...

    @abstractmethod
    async def get_experts(self, repo_id: str, file_path: str) -> list[ExpertScore]: ...

    @abstractmethod
    async def get_capsule(self, repo_id: str, file_path: str) -> Capsule | None: ...

    @abstractmethod
    async def get_github_snapshot(self, repo_id: str) -> GitHubSnapshot | None: ...

    @abstractmethod
    async def get_graph(self, repo_id: str) -> GraphPayload: ...
