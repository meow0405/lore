from collections import defaultdict

from lore.core.models import Capsule, CommitRecord, FileFeature


def synthesize_capsules(commits: list[CommitRecord], features: list[FileFeature]) -> list[Capsule]:
    commits_by_file: dict[str, list[CommitRecord]] = defaultdict(list)
    for commit in commits:
        for changed in commit.changed_files:
            commits_by_file[changed.path].append(commit)

    capsules: list[Capsule] = []
    for feature in features:
        related = commits_by_file.get(feature.file_path, [])
        highest = max(related, key=lambda c: len(c.changed_files), default=None)
        risks = []
        if feature.danger_score >= 0.72:
            risks.append("High danger score from frequent, recent, or tightly coupled changes.")
        if feature.bus_factor_score > 0.8:
            risks.append("Knowledge appears concentrated in a small author set.")
        if feature.coupling_score > 0.6:
            risks.append("File often changes with other files, so edits may have hidden blast radius.")

        summary = (
            f"{feature.file_path} is labelled {feature.danger_label.value} "
            f"with danger score {feature.danger_score:.2f} across {feature.commit_count} commits."
        )
        capsules.append(
            Capsule(
                repo_id=feature.repo_id,
                file_path=feature.file_path,
                summary=summary,
                highest_impact_commit=highest.hash if highest else None,
                risks=risks,
                confidence=min(0.95, 0.45 + feature.commit_count / 20),
            )
        )
    return capsules
