# Lore

Lore is a phase-wise Python backend for repository intelligence: ingest commit history,
score risky files, rank experts, synthesize "why" capsules, and serve the data through
FastAPI for VS Code, GitHub Actions, and a browser graph.

## Phases

| Phase | Folder | Purpose |
| --- | --- | --- |
| 0 | `docs/`, `.env.example` | setup, ownership, external service checklist |
| 1 | `src/lore/ingestion` | clone/read repositories and extract commit facts |
| 2 | `src/lore/features` | danger, coupling, recency, bus factor, complexity scores |
| 3 | `src/lore/experts` | author contribution ranking with decay and review bonuses |
| 4 | `src/lore/capsules` | decision/risk capsule generation |
| 5 | `src/lore/storage` | MongoDB Atlas collections and local fallback store |
| 6 | `src/lore/api` | FastAPI Bob server endpoints |
| 7 | `integrations/vscode-extension` | VS Code integration stub |
| 8 | `integrations/github-action` | GitHub Action integration stub |
| 9 | `integrations/browser-graph` | D3 graph integration stub |
| 10 | `scripts/demo.py` | demo warmup and smoke flow |

## Quick Start

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn lore.api.server:app --reload
```

Analyze a repository:

```powershell
lore-ingest --repo-path C:\path\to\repo --repo-id demo
```

Scrape GitHub metadata, PRs, issues, branches, and file metrics:

```powershell
lore-scrape-github --repo-url https://github.com/facebook/react --repo-id facebook/react --output-file extracted_info.json
```

Set `LORE_GITHUB_TOKEN` in your environment or local `.env` to avoid low unauthenticated rate limits.
Successful scrapes are saved as JSON files in `scrape_reports/`.

Temporary TypeScript backend prompt runner:

```powershell
cd p_scraper/lore-backend
npm.cmd run scrape:prompt
```

Run the TypeScript file scraper through the Python backend:

```powershell
curl -X POST http://127.0.0.1:8000/scrape/file `
  -H "Content-Type: application/json" `
  -d "{\"repository_url\":\"https://github.com/facebook/react\",\"relative_file_path\":\"packages/react/index.js\"}"
```

The API runs with an in-memory store unless `LORE_MONGO_URI` is set.

## API

- `GET /health`
- `POST /analyse`
- `POST /query`
- `POST /annotate`
- `GET /graph/{repo_id}`
- `GET /trace/{repo_id}/{file_path:path}`
- `POST /scrape/github`
- `GET /scrape/github/{repo_id}`
- `POST /scrape/file`
