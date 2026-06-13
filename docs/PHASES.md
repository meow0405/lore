# Phase-Wise Build Plan

## Phase 0: Preparation
- Configure GitHub token, MongoDB Atlas URI, and demo repositories.
- Assign owners for ML, backend, extension, and frontend.
- Verify PyDriller, FastAPI, and MongoDB connectivity.

## Phase 1: Repository Intelligence Ingestion
- Use `lore.ingestion.repository.ingest_repository`.
- Store raw commits with changed file metadata.
- Use `lore.ingestion.github_scraper.GitHubScraper` for GitHub API metadata,
  root file metrics, PRs, issues, branches, and dependency-change signals.

## Phase 2: Feature Engineering
- Use `lore.features.scoring.compute_file_features`.
- Produces commit frequency, bus factor, recency, coupling, complexity, and danger labels.

## Phase 3: Expert Ranker
- Use `lore.experts.ranker.rank_experts`.
- Applies 90-day decay and configurable review bonus.

## Phase 4: Why Synthesizer
- Use `lore.capsules.synthesizer.synthesize_capsules`.
- Creates confidence-scored risk capsules for each file.

## Phase 5: MongoDB Atlas Design
- Collections: `file_features`, `capsules`, `expert_scores`, `annotations`, `graph_nodes`.
- Additional collection: `github_snapshots`.
- Core index: `repo_id + file_path`.

## Phase 6: FastAPI Bob Server
- Start with `uvicorn lore.api.server:app --reload`.
- Endpoints match the build guide.
- GitHub metadata endpoints: `POST /scrape/github`, `GET /scrape/github/{repo_id}`.

## Phases 7-9: Integrations
- Integration folders contain stubs to connect VS Code, GitHub Actions, and D3 graph views.

## Phase 10: Demo
- Use `python scripts/demo.py` to load demo data into the active store.
