from collections import defaultdict
from datetime import datetime, timezone
from math import exp, log1p

from lore.core.models import CommitRecord, DangerLabel, FileFeature
from lore.ingestion.stats import build_file_stats


def _clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


def _recency_score(last_touched: datetime | None) -> float:
    if last_touched is None:
        return 0.0
    age_days = max(0, (datetime.now(timezone.utc) - last_touched).days)
    return _clamp(exp(-age_days / 90))


def _label(score: float) -> DangerLabel:
    if score >= 0.72:
        return DangerLabel.high
    if score >= 0.42:
        return DangerLabel.medium
    return DangerLabel.low


def compute_file_features(commits: list[CommitRecord], repo_id: str) -> list[FileFeature]:
    stats = build_file_stats(commits)
    max_commits = max((entry["commit_count"] for entry in stats.values()), default=1)
    max_coupling = max(1, max((sum(entry["cochanges"].values()) for entry in stats.values()), default=0))
    complexity_by_path: dict[str, float] = defaultdict(float)

    for commit in commits:
        for changed in commit.changed_files:
            complexity_by_path[changed.path] = max(complexity_by_path[changed.path], changed.complexity)

    features: list[FileFeature] = []
    for path, entry in stats.items():
        author_count = len(entry["authors"])
        commit_frequency = _clamp(entry["commit_count"] / max_commits)
        bus_factor = _clamp(1 / max(author_count, 1))
        recency = _recency_score(entry["last_touched_at"])
        coupling = _clamp(sum(entry["cochanges"].values()) / max_coupling)
        complexity = _clamp(log1p(complexity_by_path[path]) / log1p(50))
        danger = _clamp(
            0.28 * commit_frequency
            + 0.24 * bus_factor
            + 0.18 * recency
            + 0.18 * coupling
            + 0.12 * complexity
        )

        features.append(
            FileFeature(
                repo_id=repo_id,
                file_path=path,
                commit_count=entry["commit_count"],
                author_count=author_count,
                last_touched_at=entry["last_touched_at"],
                cochanged_files=dict(entry["cochanges"]),
                commit_frequency_score=commit_frequency,
                bus_factor_score=bus_factor,
                recency_score=recency,
                coupling_score=coupling,
                complexity_score=complexity,
                danger_score=danger,
                danger_label=_label(danger),
            )
        )

    return sorted(features, key=lambda item: item.danger_score, reverse=True)
