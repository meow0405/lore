import asyncio

from lore.core.models import ChangedFile, CommitRecord
from lore.capsules.synthesizer import synthesize_capsules
from lore.experts.ranker import rank_experts
from lore.features.scoring import compute_file_features
from lore.storage.factory import get_store


async def main() -> None:
    from datetime import datetime, timezone

    commits = [
        CommitRecord(
            repo_id="demo",
            hash="abc123",
            author_name="Ishan",
            author_email="ishan@example.com",
            message="Add analysis pipeline",
            authored_at=datetime.now(timezone.utc),
            changed_files=[
                ChangedFile(path="src/lore/features/scoring.py", added=120, deleted=5, complexity=12),
                ChangedFile(path="src/lore/api/server.py", added=80, deleted=2, complexity=8),
            ],
        )
    ]
    features = compute_file_features(commits, "demo")
    store = get_store()
    await store.save_commits(commits)
    await store.save_file_features(features)
    await store.save_expert_scores(rank_experts(commits, "demo"))
    await store.save_capsules(synthesize_capsules(commits, features))
    print("Demo data loaded for repo_id=demo.")


if __name__ == "__main__":
    asyncio.run(main())
