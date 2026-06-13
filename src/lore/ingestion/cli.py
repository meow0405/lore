import argparse
import asyncio

from lore.capsules.synthesizer import synthesize_capsules
from lore.experts.ranker import rank_experts
from lore.features.scoring import compute_file_features
from lore.ingestion.repository import ingest_repository
from lore.storage.factory import get_store


async def ingest(repo_path: str, repo_id: str) -> None:
    commits = ingest_repository(repo_path, repo_id)
    features = compute_file_features(commits, repo_id)
    experts = rank_experts(commits, repo_id)
    capsules = synthesize_capsules(commits, features)

    store = get_store()
    await store.save_commits(commits)
    await store.save_file_features(features)
    await store.save_expert_scores(experts)
    await store.save_capsules(capsules)

    print(f"Ingested {len(commits)} commits, {len(features)} files for repo '{repo_id}'.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest a git repository into Lore.")
    parser.add_argument("--repo-path", required=True)
    parser.add_argument("--repo-id", required=True)
    args = parser.parse_args()
    asyncio.run(ingest(args.repo_path, args.repo_id))


if __name__ == "__main__":
    main()
