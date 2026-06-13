# Python Scraper Bridge

Temporary terminal runner for the Python GitHub scraper.

## Setup

From the repository root:

```powershell
pip install -e ".[dev]"
```

Optional, to avoid GitHub unauthenticated rate limits:

```powershell
$env:LORE_GITHUB_TOKEN="your_token_here"
```

Optional throttle settings:

```powershell
$env:LORE_GITHUB_MIN_INTERVAL_SECONDS="0.35"
$env:LORE_GITHUB_MAX_RETRIES="2"
$env:LORE_GITHUB_RATE_LIMIT_WAIT_CAP_SECONDS="60"
```

## Run

From `p_scraper/lore-backend`:

```powershell
npm.cmd run scrape:prompt
```

Paste a GitHub repository URL such as:

```text
https://github.com/facebook/react
```

Type `exit` to stop.

The runner validates GitHub URLs, calls the Python scraper via `child_process.spawn`,
prints either the JSON analysis or a structured error object, and saves successful
scrapes to the root `scrape_reports/` directory.
