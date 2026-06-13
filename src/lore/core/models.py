from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class DangerLabel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class ChangedFile(BaseModel):
    path: str
    added: int = 0
    deleted: int = 0
    complexity: float = 0.0


class CommitRecord(BaseModel):
    repo_id: str
    hash: str
    author_name: str
    author_email: str | None = None
    message: str = ""
    authored_at: datetime
    changed_files: list[ChangedFile] = Field(default_factory=list)


class FileFeature(BaseModel):
    repo_id: str
    file_path: str
    commit_count: int = 0
    author_count: int = 0
    last_touched_at: datetime | None = None
    cochanged_files: dict[str, int] = Field(default_factory=dict)
    commit_frequency_score: float = 0.0
    bus_factor_score: float = 0.0
    recency_score: float = 0.0
    coupling_score: float = 0.0
    complexity_score: float = 0.0
    danger_score: float = 0.0
    danger_label: DangerLabel = DangerLabel.low


class ExpertScore(BaseModel):
    repo_id: str
    file_path: str
    author_name: str
    author_email: str | None = None
    contribution_score: float = 0.0
    review_bonus: float = 0.0
    final_score: float = 0.0


class Capsule(BaseModel):
    repo_id: str
    file_path: str
    summary: str
    highest_impact_commit: str | None = None
    risks: list[str] = Field(default_factory=list)
    related_issue_or_pr: str | None = None
    confidence: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Annotation(BaseModel):
    repo_id: str
    file_path: str
    body: str
    author: str = "lore"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GraphNode(BaseModel):
    id: str
    label: str
    kind: str = "file"
    data: dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    source: str
    target: str
    weight: float = 1.0
    kind: str = "cochange"


class GraphPayload(BaseModel):
    repo_id: str
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class GitHubFileInfo(BaseModel):
    name: str | None = None
    type: str | None = None
    path: str
    size: int | None = None
    lizard_analysis: dict[str, float | int] = Field(default_factory=dict)
    treesitter_count_of_comment_lines: int = 0
    count_of_unique_files_that_import_this_file: int = 0


class GitHubRepoInfo(BaseModel):
    name: str | None = None
    full_name: str | None = None
    description: str | None = None
    language: str | None = None
    size: int | None = None
    created_at: str | None = None
    updated_at: str | None = None
    default_branch: str | None = None
    stars: int | None = None
    forks: int | None = None
    file_count: int = 0
    structure: list[GitHubFileInfo] = Field(default_factory=list)


class GitHubCommitSummary(BaseModel):
    sha: str | None = None
    message: str | None = None
    author: str | None = None
    date: str | None = None


class GitHubBranchSummary(BaseModel):
    name: str | None = None
    commit_sha: str | None = None
    protected: bool | None = None


class GitHubHistory(BaseModel):
    total_commits: int = 0
    bus_factor: int = 1
    commit_with_others: int = 0
    commits_where_dependency_configurations_change: int = 0
    commits: list[GitHubCommitSummary] = Field(default_factory=list)
    branches: list[GitHubBranchSummary] = Field(default_factory=list)


class GitHubPullRequestSummary(BaseModel):
    number: int | None = None
    title: str | None = None
    state: str | None = None
    author: str | None = None
    created_at: str | None = None
    merged_at: str | None = None


class GitHubIssueSummary(BaseModel):
    number: int | None = None
    title: str | None = None
    state: str | None = None
    author: str | None = None
    created_at: str | None = None
    closed_at: str | None = None


class GitHubPullRequests(BaseModel):
    open: list[GitHubPullRequestSummary] = Field(default_factory=list)
    closed: list[GitHubPullRequestSummary] = Field(default_factory=list)
    total_open: int = 0
    total_closed: int = 0
    review_comment_count: int = 0


class GitHubIssues(BaseModel):
    open: list[GitHubIssueSummary] = Field(default_factory=list)
    closed: list[GitHubIssueSummary] = Field(default_factory=list)
    total_open: int = 0
    total_closed: int = 0


class GitHubSnapshot(BaseModel):
    repo_id: str
    owner: str
    repo: str
    file_information: GitHubRepoInfo
    git_history: GitHubHistory
    pull_requests: GitHubPullRequests
    issues: GitHubIssues
    scraped_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
