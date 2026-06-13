from collections import defaultdict

from lore.core.models import CommitRecord


def build_file_stats(commits: list[CommitRecord]) -> dict[str, dict]:
    stats: dict[str, dict] = defaultdict(
        lambda: {"commit_count": 0, "authors": set(), "last_touched_at": None, "cochanges": defaultdict(int)}
    )

    for commit in commits:
        paths = [changed.path for changed in commit.changed_files]
        for path in paths:
            entry = stats[path]
            entry["commit_count"] += 1
            entry["authors"].add(commit.author_email or commit.author_name)
            if entry["last_touched_at"] is None or commit.authored_at > entry["last_touched_at"]:
                entry["last_touched_at"] = commit.authored_at
            for other in paths:
                if other != path:
                    entry["cochanges"][other] += 1

    return stats
