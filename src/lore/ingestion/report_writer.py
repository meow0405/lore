import json
import re
from datetime import datetime, timezone
from pathlib import Path

from lore.core.models import GitHubFileInfo, GitHubSnapshot


def safe_path_part(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_.-]+", "_", value.strip())
    return cleaned.strip("._") or "unknown"


def repo_slug(snapshot: GitHubSnapshot) -> str:
    return safe_path_part(f"{snapshot.owner}_{snapshot.repo}")


def default_report_path(
    snapshot: GitHubSnapshot,
    reports_dir: str | Path = "scrape_reports",
    timestamp: str | None = None,
) -> Path:
    report_timestamp = timestamp or datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    return Path(reports_dir) / f"{repo_slug(snapshot)}_{report_timestamp}.json"


def file_report_payload(snapshot: GitHubSnapshot, file_info: GitHubFileInfo) -> dict:
    return {
        "report_type": "file",
        "repo_id": snapshot.repo_id,
        "owner": snapshot.owner,
        "repo": snapshot.repo,
        "file_path": file_info.path,
        "file_information": file_info.model_dump(mode="json"),
        "scraped_at": snapshot.scraped_at.isoformat(),
    }


def save_file_reports(snapshot: GitHubSnapshot, repo_report_path: Path) -> list[Path]:
    files_dir = repo_report_path.with_suffix("")
    files_dir = files_dir.parent / f"{files_dir.name}_files"
    files_dir.mkdir(parents=True, exist_ok=True)

    written_paths: list[Path] = []
    for index, file_info in enumerate(snapshot.file_information.structure, start=1):
        file_name = f"{index:04d}_{safe_path_part(file_info.path)}.json"
        file_path = files_dir / file_name
        file_path.write_text(
            json_dumps(file_report_payload(snapshot, file_info)),
            encoding="utf-8",
        )
        written_paths.append(file_path)
    return written_paths


def json_dumps(payload: dict) -> str:
    return json.dumps(payload, indent=2)


def save_snapshot_report(
    snapshot: GitHubSnapshot,
    output_file: str | Path | None = None,
    reports_dir: str | Path = "scrape_reports",
) -> tuple[Path, list[Path]]:
    path = Path(output_file) if output_file else default_report_path(snapshot, reports_dir=reports_dir)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(snapshot.model_dump_json(indent=2), encoding="utf-8")
    file_paths = save_file_reports(snapshot, path)
    return path, file_paths
