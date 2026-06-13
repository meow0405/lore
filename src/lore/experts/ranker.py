from collections import defaultdict
from datetime import datetime, timezone
from math import exp

from lore.core.config import get_settings
from lore.core.models import CommitRecord, ExpertScore


def _decay(authored_at) -> float:
    age_days = max(0, (datetime.now(timezone.utc) - authored_at).days)
    return exp(-age_days / 90)


def rank_experts(commits: list[CommitRecord], repo_id: str) -> list[ExpertScore]:
    raw: dict[tuple[str, str], dict] = defaultdict(lambda: {"score": 0.0, "email": None})

    for commit in commits:
        contribution = _decay(commit.authored_at)
        for changed in commit.changed_files:
            key = (changed.path, commit.author_name)
            raw[key]["score"] += contribution
            raw[key]["email"] = commit.author_email

    max_by_file: dict[str, float] = defaultdict(float)
    for (file_path, _author), data in raw.items():
        max_by_file[file_path] = max(max_by_file[file_path], data["score"])

    review_bonus = get_settings().review_bonus
    ranked = [
        ExpertScore(
            repo_id=repo_id,
            file_path=file_path,
            author_name=author,
            author_email=data["email"],
            contribution_score=data["score"],
            review_bonus=review_bonus,
            final_score=min(1.0, data["score"] / max_by_file[file_path] + review_bonus),
        )
        for (file_path, author), data in raw.items()
    ]
    return sorted(ranked, key=lambda item: (item.file_path, -item.final_score))
