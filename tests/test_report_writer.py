import json

from lore.core.models import (
    GitHubFileInfo,
    GitHubHistory,
    GitHubIssues,
    GitHubPullRequests,
    GitHubRepoInfo,
    GitHubSnapshot,
)
from lore.ingestion.report_writer import save_snapshot_report


def test_save_snapshot_report_writes_json(tmp_path) -> None:
    snapshot = GitHubSnapshot(
        repo_id="owner/repo",
        owner="owner",
        repo="repo",
        file_information=GitHubRepoInfo(
            name="repo",
            full_name="owner/repo",
            structure=[
                GitHubFileInfo(
                    name="app.py",
                    type="file",
                    path="src/app.py",
                    size=123,
                )
            ],
        ),
        git_history=GitHubHistory(),
        pull_requests=GitHubPullRequests(),
        issues=GitHubIssues(),
    )

    path, file_paths = save_snapshot_report(snapshot, reports_dir=tmp_path)

    assert path.exists()
    assert '"repo_id": "owner/repo"' in path.read_text(encoding="utf-8")
    assert len(file_paths) == 1
    assert file_paths[0].exists()

    file_report = json.loads(file_paths[0].read_text(encoding="utf-8"))
    assert file_report["report_type"] == "file"
    assert file_report["repo_id"] == "owner/repo"
    assert file_report["file_path"] == "src/app.py"
    assert file_report["file_information"]["path"] == "src/app.py"
