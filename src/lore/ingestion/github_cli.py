import argparse
import asyncio
import json

from lore.core.config import get_settings
from lore.ingestion.github_scraper import GitHubScraper
from lore.ingestion.report_writer import save_snapshot_report
from lore.storage.factory import get_store


async def scrape(
    repository_url: str | None,
    owner: str | None,
    repo: str | None,
    repo_id: str | None,
    output_file: str | None,
    max_files: int | None,
) -> None:
    settings = get_settings()
    if repository_url:
        scraper = GitHubScraper.from_url(
            repository_url,
            token=settings.github_token,
            min_interval_seconds=settings.github_min_interval_seconds,
            max_retries=settings.github_max_retries,
            rate_limit_wait_cap_seconds=settings.github_rate_limit_wait_cap_seconds,
        )
    elif owner and repo:
        scraper = GitHubScraper(
            owner,
            repo,
            token=settings.github_token,
            min_interval_seconds=settings.github_min_interval_seconds,
            max_retries=settings.github_max_retries,
            rate_limit_wait_cap_seconds=settings.github_rate_limit_wait_cap_seconds,
        )
    else:
        raise SystemExit("Provide --repo-url, or both --owner and --repo.")

    snapshot = scraper.scrape(
        repo_id=repo_id,
        max_files=max_files,
    )
    await get_store().save_github_snapshot(snapshot)

    saved_path, file_paths = save_snapshot_report(snapshot, output_file=output_file)
    print(json.dumps({
        "status": "saved",
        "output_file": str(saved_path),
        "file_report_count": len(file_paths),
        "file_reports_dir": str(file_paths[0].parent) if file_paths else None,
        "snapshot": snapshot.model_dump(mode="json"),
    }, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrape GitHub metadata into Lore.")
    parser.add_argument("--repo-url")
    parser.add_argument("--owner")
    parser.add_argument("--repo")
    parser.add_argument("--repo-id")
    parser.add_argument("--output-file")
    parser.add_argument(
        "--max-files",
        type=int,
        default=None,
        help="Optional cap on files to scrape. Defaults to all files found in the repository tree.",
    )
    args = parser.parse_args()
    asyncio.run(scrape(args.repo_url, args.owner, args.repo, args.repo_id, args.output_file, args.max_files))


if __name__ == "__main__":
    main()
