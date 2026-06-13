from lore.core.models import ExpertScore, FileFeature


def review_comment(feature: FileFeature, experts: list[ExpertScore]) -> str | None:
    if feature.danger_label.value == "low":
        return None

    expert_line = ""
    if experts:
        top = experts[0]
        expert_line = f" Suggested reviewer: {top.author_name}."

    return (
        f"Lore flagged `{feature.file_path}` as {feature.danger_label.value} risk "
        f"(danger {feature.danger_score:.2f}).{expert_line}"
    )
