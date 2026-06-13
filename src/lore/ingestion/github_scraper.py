from __future__ import annotations

import math
import re
import time
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

import requests

from lore.core.models import (
    GitHubBranchSummary,
    GitHubCommitSummary,
    GitHubFileInfo,
    GitHubHistory,
    GitHubIssueSummary,
    GitHubIssues,
    GitHubPullRequestSummary,
    GitHubPullRequests,
    GitHubRepoInfo,
    GitHubSnapshot,
)


class GitHubScraperError(ValueError):
    pass


def parse_github_repo_url(repository_url: str) -> tuple[str, str]:
    cleaned = repository_url.strip().removesuffix(".git")
    cleaned = cleaned.removeprefix("git@github.com:")
    cleaned = cleaned.removeprefix("ssh://git@github.com/")

    parsed = urlparse(cleaned)

    if parsed.scheme and parsed.scheme not in {"http", "https"}:
        raise GitHubScraperError("Use an HTTPS GitHub repository URL.")

    if parsed.netloc:
        hostname = parsed.netloc.lower().removeprefix("www.")
        if hostname != "github.com":
            raise GitHubScraperError("Only github.com repository URLs are supported.")
        path = parsed.path
    else:
        path = cleaned
        if path.startswith("github.com/"):
            path = path[len("github.com/"):]

    parts = [part for part in path.strip("/").split("/") if part]
    if len(parts) < 2:
        raise GitHubScraperError(
            "Expected a GitHub repository URL like https://github.com/owner/repo."
        )

    return parts[0], parts[1]


class GitHubScraper:
    @classmethod
    def from_url(
        cls,
        repository_url: str,
        token: str | None = None,
        timeout: int = 20,
        min_interval_seconds: float = 0.35,
        max_retries: int = 2,
        rate_limit_wait_cap_seconds: int = 60,
    ) -> "GitHubScraper":
        owner, repo = parse_github_repo_url(repository_url)
        return cls(
            owner,
            repo,
            token=token,
            timeout=timeout,
            min_interval_seconds=min_interval_seconds,
            max_retries=max_retries,
            rate_limit_wait_cap_seconds=rate_limit_wait_cap_seconds,
        )

    def __init__(
        self,
        owner: str,
        repo: str,
        token: str | None = None,
        timeout: int = 20,
        min_interval_seconds: float = 0.35,
        max_retries: int = 2,
        rate_limit_wait_cap_seconds: int = 60,
    ):
        self.owner = owner
        self.repo = repo
        self.timeout = timeout
        self.min_interval_seconds = max(0.0, min_interval_seconds)
        self.max_retries = max(0, max_retries)
        self.rate_limit_wait_cap_seconds = max(0, rate_limit_wait_cap_seconds)
        self._last_request_at = 0.0
        self.base_url = "https://api.github.com"
        self.session = requests.Session()
        self.session.headers.update({"Accept": "application/vnd.github.v3+json"})
        if token:
            self.session.headers.update({"Authorization": f"Bearer {token}"})

    def _request(self, endpoint: str, params: dict[str, Any] | None = None) -> Any:
        fallback = [] if any(x in endpoint for x in ["issues", "pulls", "commits", "contents", "branches"]) else {}
        try:
            response = self._get_with_rate_limit(f"{self.base_url}{endpoint}", params=params)
            response.raise_for_status()
            return response.json()
        except GitHubScraperError:
            raise
        except requests.RequestException:
            return fallback

    def _get_with_rate_limit(
        self,
        url: str,
        params: dict[str, Any] | None = None,
    ) -> requests.Response:
        for attempt in range(self.max_retries + 1):
            self._throttle()
            response = self.session.get(url, params=params, timeout=self.timeout)
            if not self._is_rate_limited_response(response):
                return response

            wait_seconds = self._rate_limit_wait_seconds(response)
            if attempt >= self.max_retries or wait_seconds > self.rate_limit_wait_cap_seconds:
                raise GitHubScraperError(
                    "GitHub API rate limit exceeded. Set LORE_GITHUB_TOKEN or try again later."
                )
            time.sleep(wait_seconds)

        return response

    def _throttle(self) -> None:
        elapsed = time.monotonic() - self._last_request_at
        wait_seconds = self.min_interval_seconds - elapsed
        if wait_seconds > 0:
            time.sleep(wait_seconds)
        self._last_request_at = time.monotonic()

    def _is_rate_limited_response(self, response: requests.Response) -> bool:
        if response.status_code not in {403, 429}:
            return False
        try:
            message = response.json().get("message", "")
        except ValueError:
            message = response.text
        message = message.lower()
        return (
            response.status_code == 429
            or response.headers.get("X-RateLimit-Remaining") == "0"
            or "rate limit" in message
            or "secondary rate limit" in message
        )

    def _rate_limit_wait_seconds(self, response: requests.Response) -> int:
        retry_after = response.headers.get("Retry-After")
        if retry_after and retry_after.isdigit():
            return max(1, int(retry_after))

        reset_at = response.headers.get("X-RateLimit-Reset")
        if reset_at and reset_at.isdigit():
            return max(1, int(int(reset_at) - time.time()) + 1)

        return 2

    def get_file_information(self, max_files: int | None = None) -> GitHubRepoInfo:
        repo = self._request(f"/repos/{self.owner}/{self.repo}")
        if not repo:
            raise GitHubScraperError(f"Repository not found or inaccessible: {self.owner}/{self.repo}.")

        file_structure = self._build_file_structure(repo, max_files=max_files)
        for file_info in file_structure:
            file_info.count_of_unique_files_that_import_this_file = self._calculate_dependents(
                file_info.path,
                file_structure,
            )

        return GitHubRepoInfo(
            name=repo.get("name"),
            full_name=repo.get("full_name"),
            description=repo.get("description"),
            language=repo.get("language"),
            size=repo.get("size"),
            created_at=repo.get("created_at"),
            updated_at=repo.get("updated_at"),
            default_branch=repo.get("default_branch"),
            stars=repo.get("stargazers_count"),
            forks=repo.get("forks_count"),
            file_count=len(file_structure),
            structure=file_structure,
        )

    def _build_file_structure(
        self,
        repo: dict[str, Any],
        max_files: int | None,
    ) -> list[GitHubFileInfo]:
        default_branch = repo.get("default_branch")
        tree_files = self._get_repository_tree(default_branch)
        if tree_files:
            selected_files = tree_files[:max_files] if max_files and max_files > 0 else tree_files
            return [self._file_info_from_tree_item(item, default_branch) for item in selected_files]
        return self._root_file_structure(max_files=max_files)

    def _get_repository_tree(self, default_branch: str | None) -> list[dict[str, Any]]:
        if not default_branch:
            return []
        tree = self._request(
            f"/repos/{self.owner}/{self.repo}/git/trees/{default_branch}",
            {"recursive": "1"},
        )
        if not isinstance(tree, dict):
            return []
        items = tree.get("tree", [])
        if not isinstance(items, list):
            return []
        files = [
            item
            for item in items
            if item.get("type") == "blob" and item.get("path") and not self._is_ignored_path(item["path"])
        ]
        return sorted(files, key=lambda item: (self._file_priority(item.get("path", "")), item.get("path", "")))

    def _file_info_from_tree_item(self, item: dict[str, Any], default_branch: str | None) -> GitHubFileInfo:
        path = item.get("path") or ""
        size = item.get("size")
        raw_content = ""
        if self._should_analyze_file(path, size):
            raw_content = self._download_text(self._raw_download_url(default_branch, path))
        return GitHubFileInfo(
            name=path.rsplit("/", 1)[-1],
            type="file",
            path=path,
            size=size,
            lizard_analysis=self._analyze_with_lizard(raw_content, path),
            treesitter_count_of_comment_lines=self._count_comment_lines(raw_content),
        )

    def _root_file_structure(self, max_files: int | None) -> list[GitHubFileInfo]:
        contents = self._request(f"/repos/{self.owner}/{self.repo}/contents/")
        file_structure: list[GitHubFileInfo] = []
        if not isinstance(contents, list):
            return file_structure
        selected_contents = contents[:max_files] if max_files and max_files > 0 else contents
        for item in selected_contents:
            if item.get("type") != "file":
                continue
            path = item.get("path") or item.get("name") or ""
            raw_content = self._download_text(item.get("download_url"))
            file_structure.append(
                GitHubFileInfo(
                    name=item.get("name"),
                    type=item.get("type"),
                    path=path,
                    size=item.get("size"),
                    lizard_analysis=self._analyze_with_lizard(raw_content, path),
                    treesitter_count_of_comment_lines=self._count_comment_lines(raw_content),
                )
            )
        return file_structure

    def _raw_download_url(self, default_branch: str | None, path: str) -> str | None:
        if not default_branch:
            return None
        return f"https://raw.githubusercontent.com/{self.owner}/{self.repo}/{default_branch}/{path}"

    def _download_text(self, download_url: str | None) -> str:
        if not download_url:
            return ""
        try:
            response = self._get_with_rate_limit(download_url)
            response.raise_for_status()
            return response.text
        except GitHubScraperError:
            return ""
        except requests.RequestException:
            return ""

    def _is_ignored_path(self, path: str) -> bool:
        ignored_parts = {".git", "node_modules", "dist", "build", ".next", ".venv", "venv", "__pycache__"}
        return any(part in ignored_parts for part in path.split("/"))

    def _file_priority(self, path: str) -> int:
        source_extensions = {
            ".py",
            ".ts",
            ".tsx",
            ".js",
            ".jsx",
            ".go",
            ".java",
            ".rs",
            ".c",
            ".cpp",
            ".h",
            ".hpp",
        }
        config_names = {"package.json", "requirements.txt", "pyproject.toml", "go.mod", "cargo.toml", "pom.xml"}
        name = path.rsplit("/", 1)[-1].lower()
        suffix = "." + name.rsplit(".", 1)[-1] if "." in name else ""
        if suffix in source_extensions:
            return 0
        if name in config_names:
            return 1
        return 2

    def _should_analyze_file(self, path: str, size: int | None) -> bool:
        if size is not None and size > 250_000:
            return False
        return self._file_priority(path) <= 1

    def _analyze_with_lizard(self, code_content: str, filename: str) -> dict[str, float | int]:
        if not code_content:
            return {
                "V (Halstead Volume)": 0,
                "G (Cyclomatic Complexity Average)": 0,
                "CM (Comment Lines)": 0,
                "duplicated_lines": 0,
            }

        try:
            import lizard

            analysis = lizard.analyze_file.analyze_source_code(filename, code_content)
            token_count = getattr(analysis, "token_count", 0)
            estimated_vocabulary = max(10, int(token_count * 0.2))
            halstead_volume = token_count * math.log2(estimated_vocabulary) if token_count > 0 else 0
            complexity = getattr(analysis, "average_cyclomatic_complexity", 0)
            comment_lines = getattr(analysis, "comment_lines", 0)
        except Exception:
            token_count = len(code_content.split())
            estimated_vocabulary = max(10, len(set(code_content.split())))
            halstead_volume = token_count * math.log2(estimated_vocabulary) if token_count > 0 else 0
            complexity = 0
            comment_lines = self._count_comment_lines(code_content)

        return {
            "V (Halstead Volume)": round(halstead_volume, 2),
            "G (Cyclomatic Complexity Average)": complexity,
            "CM (Comment Lines)": comment_lines,
            "duplicated_lines": 0,
        }

    def _count_comment_lines(self, content: str) -> int:
        if not content:
            return 0
        return sum(
            1
            for line in content.splitlines()
            if line.strip().startswith(("#", "//", "*", "/*"))
        )

    def _calculate_dependents(self, file_path: str, file_structure: list[GitHubFileInfo]) -> int:
        stem = file_path.rsplit("/", 1)[-1].split(".")[0]
        if not stem:
            return 0
        return len(
            [
                file_info
                for file_info in file_structure
                if file_info.path != file_path and stem in file_info.path
            ]
        )

    def get_git_history(self) -> GitHubHistory:
        commits: list[GitHubCommitSummary] = []
        author_contributions: dict[str, int] = {}
        commits_with_others = 0
        dependency_config_changes = 0
        config_files = ["package.json", "pom.xml", "requirements.txt", "go.mod", "cargo.toml"]

        for page in range(1, 3):
            data = self._request(
                f"/repos/{self.owner}/{self.repo}/commits",
                {"per_page": 100, "page": page},
            )
            if not data:
                break
            for commit in data:
                details = commit.get("commit", {})
                author_name = details.get("author", {}).get("name")
                message = details.get("message") or ""
                message_lower = message.lower()
                if any(cfg in message_lower for cfg in config_files) or "dependency" in message_lower or "bump" in message_lower:
                    dependency_config_changes += 1
                if author_name:
                    author_contributions[author_name] = author_contributions.get(author_name, 0) + 1
                if "co-authored-by" in message_lower or "pair" in message_lower:
                    commits_with_others += 1
                commits.append(
                    GitHubCommitSummary(
                        sha=commit.get("sha"),
                        message=message,
                        author=author_name,
                        date=details.get("author", {}).get("date"),
                    )
                )

        total_commits = len(commits)
        cumulative_commits = 0
        bus_factor = 0
        for _author, count in sorted(author_contributions.items(), key=lambda item: item[1], reverse=True):
            cumulative_commits += count
            bus_factor += 1
            if total_commits > 0 and cumulative_commits / total_commits > 0.5:
                break

        branches: list[GitHubBranchSummary] = []
        branch_data = self._request(f"/repos/{self.owner}/{self.repo}/branches", {"per_page": 100})
        if isinstance(branch_data, list):
            branches = [
                GitHubBranchSummary(
                    name=branch.get("name"),
                    commit_sha=branch.get("commit", {}).get("sha"),
                    protected=branch.get("protected"),
                )
                for branch in branch_data
            ]

        return GitHubHistory(
            total_commits=total_commits,
            bus_factor=bus_factor if bus_factor > 0 else 1,
            commit_with_others=commits_with_others,
            commits_where_dependency_configurations_change=dependency_config_changes,
            commits=commits,
            branches=branches,
        )

    def get_pull_requests(self) -> GitHubPullRequests:
        open_prs: list[GitHubPullRequestSummary] = []
        closed_prs: list[GitHubPullRequestSummary] = []

        for state, target in [("open", open_prs), ("closed", closed_prs)]:
            for page in range(1, 3):
                data = self._request(
                    f"/repos/{self.owner}/{self.repo}/pulls",
                    {"state": state, "per_page": 100, "page": page},
                )
                if not data:
                    break
                for pr in data:
                    target.append(
                        GitHubPullRequestSummary(
                            number=pr.get("number"),
                            title=pr.get("title"),
                            state=pr.get("state"),
                            author=pr.get("user", {}).get("login"),
                            created_at=pr.get("created_at"),
                            merged_at=pr.get("merged_at"),
                        )
                    )

        return GitHubPullRequests(
            open=open_prs,
            closed=closed_prs,
            total_open=len(open_prs),
            total_closed=len(closed_prs),
            review_comment_count=0,
        )

    def get_issues(self) -> GitHubIssues:
        open_issues: list[GitHubIssueSummary] = []
        closed_issues: list[GitHubIssueSummary] = []

        for state, target in [("open", open_issues), ("closed", closed_issues)]:
            for page in range(1, 3):
                data = self._request(
                    f"/repos/{self.owner}/{self.repo}/issues",
                    {"state": state, "per_page": 100, "page": page},
                )
                if not data:
                    break
                for issue in data:
                    if "pull_request" in issue:
                        continue
                    target.append(
                        GitHubIssueSummary(
                            number=issue.get("number"),
                            title=issue.get("title"),
                            state=issue.get("state"),
                            author=issue.get("user", {}).get("login"),
                            created_at=issue.get("created_at"),
                            closed_at=issue.get("closed_at"),
                        )
                    )

        return GitHubIssues(
            open=open_issues,
            closed=closed_issues,
            total_open=len(open_issues),
            total_closed=len(closed_issues),
        )

    def scrape(self, repo_id: str | None = None, max_files: int | None = None) -> GitHubSnapshot:
        return GitHubSnapshot(
            repo_id=repo_id or f"{self.owner}/{self.repo}",
            owner=self.owner,
            repo=self.repo,
            file_information=self.get_file_information(max_files=max_files),
            git_history=self.get_git_history(),
            pull_requests=self.get_pull_requests(),
            issues=self.get_issues(),
            scraped_at=datetime.now(timezone.utc),
        )
