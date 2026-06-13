from pydantic import BaseModel

from lore.core.models import Annotation


class AnalyseRequest(BaseModel):
    repo_id: str
    file_path: str


class QueryRequest(BaseModel):
    repo_id: str
    file_path: str
    question: str | None = None


class AnnotateRequest(BaseModel):
    repo_id: str
    file_path: str
    body: str
    author: str = "lore"


class GitHubScrapeRequest(BaseModel):
    repository_url: str | None = None
    owner: str | None = None
    repo: str | None = None
    repo_id: str | None = None
    max_files: int | None = None


class FileScrapeRequest(BaseModel):
    repository_url: str
    relative_file_path: str | None = None
    workspace_base: str | None = None
    output_file: str | None = None
    timeout_seconds: int = 240


class AnalyseResponse(BaseModel):
    feature: object | None
    experts: list[object]
    capsule: object | None


def to_annotation(request: AnnotateRequest) -> Annotation:
    return Annotation(
        repo_id=request.repo_id,
        file_path=request.file_path,
        body=request.body,
        author=request.author,
    )
