from __future__ import annotations

import argparse
import json
import pickle
from pathlib import Path
from typing import Any

import pandas as pd


MODEL_FEATURES = [
    "lines_of_code",
    "cyclomatic_complexity",
    "num_developers",
    "code_churn",
]

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DEFAULT_REPORTS_DIR = PROJECT_ROOT / "scrape_reports"
DEFAULT_MODEL_PATH = SCRIPT_DIR / "xgboost_code_defect_predictor.pkl"


def latest_json_report(reports_dir: Path) -> Path:
    if not reports_dir.exists():
        raise FileNotFoundError(f"Reports directory does not exist: {reports_dir}")

    reports = sorted(
        (path for path in reports_dir.glob("*.json") if not path.parent.name.endswith("_files")),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )
    if not reports:
        raise FileNotFoundError(f"No JSON reports found in {reports_dir}")
    return reports[0]


def resolve_report_path(report: Path | None, reports_dir: Path) -> Path:
    if report is None:
        return latest_json_report(reports_dir)

    if report.exists():
        return report

    report_from_dir = reports_dir / report
    if report_from_dir.exists():
        return report_from_dir

    matches = sorted(reports_dir.rglob(report.name), key=lambda path: path.stat().st_mtime, reverse=True)
    if matches:
        return matches[0]

    raise FileNotFoundError(f"Could not find report {report} or {report_from_dir}")


def load_report(report_path: Path) -> dict[str, Any]:
    with report_path.open("r", encoding="utf-8") as file:
        return json.load(file)


def load_reports(report_path: Path) -> list[dict[str, Any]]:
    if report_path.is_dir():
        reports = [load_report(path) for path in sorted(report_path.glob("*.json"))]
        if not reports:
            raise FileNotFoundError(f"No JSON reports found in {report_path}")
        return reports
    return [load_report(report_path)]


def collect_file_entries(items: Any) -> list[dict[str, Any]]:
    if not isinstance(items, list):
        return []

    files: list[dict[str, Any]] = []
    for item in items:
        if not isinstance(item, dict):
            continue

        if item.get("type") == "file":
            files.append(item)

        for nested_key in ("children", "files", "structure"):
            files.extend(collect_file_entries(item.get(nested_key)))

    return files


def report_files(report: dict[str, Any]) -> list[dict[str, Any]]:
    if report.get("report_type") == "file":
        file_information = report.get("file_information", {})
        return [file_information] if isinstance(file_information, dict) else []

    file_information = report.get("file_information", {})
    if not isinstance(file_information, dict):
        return []
    if file_information.get("path"):
        return [file_information]
    return collect_file_entries(file_information.get("structure", []))


def numeric_value(*values: Any, default: float = 0.0) -> float:
    for value in values:
        if value is None:
            continue
        try:
            return float(value)
        except (TypeError, ValueError):
            continue
    return default


def feature_row(file_info: dict[str, Any]) -> dict[str, float | str]:
    lizard_analysis = file_info.get("lizard_analysis") or {}

    lines_of_code = numeric_value(
        file_info.get("lines_of_code"),
        file_info.get("file_loc"),
        file_info.get("loc"),
        file_info.get("size"),
    )
    cyclomatic_complexity = numeric_value(
        file_info.get("cyclomatic_complexity"),
        lizard_analysis.get("G (Cyclomatic Complexity Average)"),
    )
    num_developers = numeric_value(
        file_info.get("num_developers"),
        file_info.get("count_of_unique_files_that_import_this_file"),
    )
    code_churn = numeric_value(
        file_info.get("code_churn"),
        lizard_analysis.get("duplicated_lines"),
        file_info.get("treesitter_count_of_comment_lines"),
    )

    return {
        "file_path": file_info.get("path") or file_info.get("name") or "<unknown>",
        "lines_of_code": lines_of_code,
        "cyclomatic_complexity": cyclomatic_complexity,
        "num_developers": num_developers,
        "code_churn": code_churn,
    }


def build_feature_frame(
    files: list[dict[str, Any]],
    targets: list[str] | None = None,
) -> pd.DataFrame:
    rows = [feature_row(file_info) for file_info in files]
    frame = pd.DataFrame(rows)

    if frame.empty:
        raise ValueError("No file metrics found in the scrape report.")

    if targets:
        target_lowers = [target.lower() for target in targets]
        mask = pd.Series(False, index=frame.index)
        for target_lower in target_lowers:
            mask = mask | frame["file_path"].str.lower().str.contains(
                target_lower,
                regex=False,
                na=False,
            )
        frame = frame[mask]
        if frame.empty:
            raise ValueError(f"No file path in the scrape report matched {', '.join(targets)!r}.")

    return frame


def load_features_from_scrape_report(
    report_path: Path | None = None,
    reports_dir: Path = DEFAULT_REPORTS_DIR,
    targets: list[str] | None = None,
) -> tuple[Path, dict[str, Any], pd.DataFrame]:
    selected_report_path = resolve_report_path(report_path, reports_dir)
    reports = load_reports(selected_report_path)
    files = [
        file_info
        for report in reports
        for file_info in report_files(report)
    ]
    report = reports[0]
    feature_frame = build_feature_frame(files, targets=targets)
    return selected_report_path, report, feature_frame


def predict_probabilities(feature_frame: pd.DataFrame, model_path: Path) -> pd.DataFrame:
    if not model_path.exists():
        raise FileNotFoundError(f"Model file does not exist: {model_path}")

    with model_path.open("rb") as file:
        predictor = pickle.load(file)

    probabilities = predictor.predict_proba(feature_frame[MODEL_FEATURES])[:, 1]
    result = feature_frame.copy()
    result["defect_probability"] = probabilities
    return result.sort_values("defect_probability", ascending=False)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Predict defect probability from the newest JSON report in scrape_reports."
    )
    parser.add_argument(
        "--report",
        type=Path,
        help=(
            "Specific scrape report JSON or per-file report directory to read. "
            "Defaults to the newest repo JSON in scrape_reports."
        ),
    )
    parser.add_argument(
        "--reports-dir",
        type=Path,
        default=DEFAULT_REPORTS_DIR,
        help="Directory containing scrape report JSON files.",
    )
    parser.add_argument(
        "--target",
        action="append",
        help="Optional file path/name substring. Can be passed multiple times for several files.",
    )
    parser.add_argument(
        "--file",
        dest="target",
        action="append",
        help="Alias for --target.",
    )
    parser.add_argument(
        "--model",
        type=Path,
        default=DEFAULT_MODEL_PATH,
        help="Pickle model used for prediction.",
    )
    parser.add_argument(
        "--top",
        type=int,
        default=10,
        help="Number of highest-risk files to print when no target is provided.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    report_path, report, feature_frame = load_features_from_scrape_report(
        report_path=args.report,
        reports_dir=args.reports_dir,
        targets=args.target,
    )
    predictions = predict_probabilities(feature_frame, args.model)

    repo_id = report.get("repo_id", "unknown repository")
    print(f"=== Risk Prediction Summary for {repo_id} ===")
    print(f"Report: {report_path}")

    if not args.target and len(predictions) > 1:
        average_probability = predictions["defect_probability"].mean() * 100
        highest_probability = predictions["defect_probability"].max() * 100
        print(f"Repo average defect probability: {average_probability:.2f}%")
        print(f"Repo highest file defect probability: {highest_probability:.2f}%")

    display = predictions if args.target else predictions.head(max(args.top, 1))
    for _, row in display.iterrows():
        print(f"{row['file_path']}: {row['defect_probability'] * 100:.2f}%")


if __name__ == "__main__":
    main()
