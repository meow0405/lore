from lore.core.models import GitHubFileInfo
from lore.ingestion.github_scraper import GitHubScraper, GitHubScraperError, parse_github_repo_url


def test_count_comment_lines_for_common_languages() -> None:
    scraper = GitHubScraper("owner", "repo")

    count = scraper._count_comment_lines(
        "# python\n"
        "value = 1\n"
        "// js\n"
        "/* c */\n"
        "* block\n"
    )

    assert count == 4


def test_calculate_dependents_uses_matching_file_stems() -> None:
    scraper = GitHubScraper("owner", "repo")
    files = [
        GitHubFileInfo(path="src/auth.py", name="auth.py"),
        GitHubFileInfo(path="tests/test_auth.py", name="test_auth.py"),
        GitHubFileInfo(path="src/billing.py", name="billing.py"),
    ]

    assert scraper._calculate_dependents("src/auth.py", files) == 1


def test_parse_github_repo_url_accepts_common_github_formats() -> None:
    urls = [
        "https://github.com/python/cpython",
        "https://github.com/python/cpython.git",
        "git@github.com:python/cpython.git",
        "github.com/python/cpython",
        "python/cpython",
        "ssh://git@github.com/python/cpython.git",
    ]

    for url in urls:
        owner, repo = parse_github_repo_url(url)
        assert owner == "python"
        assert repo == "cpython"


def test_parse_github_repo_url_rejects_non_github_urls() -> None:
    try:
        parse_github_repo_url("https://gitlab.com/python/cpython")
        assert False, "Expected GitHubScraperError for non-GitHub URL"
    except GitHubScraperError as exc:
        assert "Only github.com repository URLs are supported" in str(exc)


class _FakeRateLimitResponse:
    status_code = 403
    headers = {"X-RateLimit-Remaining": "0"}
    text = "API rate limit exceeded"

    def json(self) -> dict:
        return {"message": "API rate limit exceeded"}


def test_rate_limited_response_is_detected() -> None:
    scraper = GitHubScraper("owner", "repo")

    assert scraper._is_rate_limited_response(_FakeRateLimitResponse())
