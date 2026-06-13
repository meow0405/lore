from datetime import timezone
from pathlib import Path

from pydriller import Repository

from lore.core.models import ChangedFile, CommitRecord
from lore.ingestion.stats import build_file_stats


def ingest_repository(repo_path: str | Path, repo_id: str) -> list[CommitRecord]:
    """Read full git history using PyDriller and return normalized commit records."""
    records: list[CommitRecord] = []
    for commit in Repository(str(repo_path)).traverse_commits():
        changed_files: list[ChangedFile] = []
        for modified in commit.modified_files:
            path = modified.new_path or modified.old_path
            if not path:
                continue
            changed_files.append(
                ChangedFile(
                    path=path,
                    added=modified.added_lines or 0,
                    deleted=modified.deleted_lines or 0,
                    complexity=float(modified.complexity or 0),
                )
            )

        authored_at = commit.author_date
        if authored_at.tzinfo is None:
            authored_at = authored_at.replace(tzinfo=timezone.utc)

        records.append(
            CommitRecord(
                repo_id=repo_id,
                hash=commit.hash,
                author_name=commit.author.name,
                author_email=commit.author.email,
                message=commit.msg or "",
                authored_at=authored_at,
                changed_files=changed_files,
            )
        )
    return records
