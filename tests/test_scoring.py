from datetime import datetime, timezone

from lore.core.models import ChangedFile, CommitRecord
from lore.features.scoring import compute_file_features


def test_compute_file_features_labels_files() -> None:
    commits = [
        CommitRecord(
            repo_id="demo",
            hash="1",
            author_name="A",
            authored_at=datetime.now(timezone.utc),
            changed_files=[ChangedFile(path="app.py", complexity=10)],
        )
    ]

    features = compute_file_features(commits, "demo")

    assert len(features) == 1
    assert features[0].file_path == "app.py"
    assert features[0].danger_score > 0
