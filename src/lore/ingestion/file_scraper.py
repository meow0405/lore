import json
import re
import shutil
import subprocess
from pathlib import Path
from typing import Any


class FileScraperError(RuntimeError):
    pass


def _repo_slug(repository_url: str) -> str:
    cleaned = repository_url.rstrip("/").replace(".git", "")
    parts = [part for part in cleaned.split("/") if part]
    if len(parts) >= 2:
        return re.sub(r"[^A-Za-z0-9_.-]+", "_", f"{parts[-2]}_{parts[-1]}")
    return "repo"


def _command(name: str) -> str:
    candidates = [name]
    if name == "npm":
        candidates.insert(0, "npm.cmd")
    elif name == "node":
        candidates.insert(0, "node.exe")

    for candidate in candidates:
        found = shutil.which(candidate)
        if found:
            return found
    return name


def run_file_scraper(
    repository_url: str,
    relative_file_path: str | None = None,
    workspace_base: str | None = None,
    output_file: str | None = None,
    timeout_seconds: int = 240,
) -> dict[str, Any]:
    root_dir = Path(__file__).resolve().parents[3]
    scraper_dir = root_dir / "p_scraper" / "lore-backend"
    dist_entry = scraper_dir / "dist" / "index.js"

    if not scraper_dir.exists():
        raise FileScraperError(f"TypeScript file scraper not found at {scraper_dir}.")

    workspace_dir = Path(workspace_base) if workspace_base else root_dir / "p_scraper" / "workspaces"
    report_path = (
        Path(output_file)
        if output_file
        else root_dir / "file_scraper_reports" / f"{_repo_slug(repository_url)}.analysis-report.json"
    )

    try:
        subprocess.run(
            [_command("npm"), "run", "build"],
            cwd=scraper_dir,
            check=True,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
        )
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        stderr = getattr(exc, "stderr", "") or str(exc)
        raise FileScraperError(f"Failed to build TypeScript file scraper: {stderr}") from exc

    if not dist_entry.exists():
        raise FileScraperError(f"Built scraper entry not found at {dist_entry}.")

    command = [
        _command("node"),
        str(dist_entry),
        "--repo-url",
        repository_url,
        "--workspace-base",
        str(workspace_dir),
        "--output-file",
        str(report_path),
        "--json-only",
    ]
    if relative_file_path:
        command.extend(["--file", relative_file_path])

    try:
        subprocess.run(
            command,
            cwd=scraper_dir,
            check=True,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
        )
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        stderr = getattr(exc, "stderr", "") or str(exc)
        stdout = getattr(exc, "stdout", "")
        raise FileScraperError(f"File scraper failed: {stderr or stdout}") from exc

    if not report_path.exists():
        raise FileScraperError(f"File scraper completed but did not create {report_path}.")

    return {
        "output_file": str(report_path),
        "report": json.loads(report_path.read_text(encoding="utf-8")),
    }
