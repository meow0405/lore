import uvicorn
from fastapi import FastAPI, HTTPException

from lore import __version__
from lore.api.schemas import (
    AnalyseRequest,
    AnnotateRequest,
    FileScrapeRequest,
    GitHubScrapeRequest,
    QueryRequest,
    to_annotation,
)
from lore.core.config import get_settings
from lore.ingestion.file_scraper import FileScraperError, run_file_scraper
from lore.ingestion.github_scraper import GitHubScraper, GitHubScraperError
from lore.ingestion.report_writer import save_snapshot_report
from lore.storage.factory import get_store

app = FastAPI(title="Lore Bob Server", version=__version__)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "lore", "version": __version__}


@app.post("/analyse")
async def analyse(request: AnalyseRequest) -> dict:
    store = get_store()
    feature = await store.get_file_feature(request.repo_id, request.file_path)
    experts = await store.get_experts(request.repo_id, request.file_path)
    capsule = await store.get_capsule(request.repo_id, request.file_path)
    if feature is None and capsule is None:
        raise HTTPException(status_code=404, detail="No analysis found for this file.")
    return {"feature": feature, "experts": experts, "capsule": capsule}


@app.post("/query")
async def query(request: QueryRequest) -> dict:
    store = get_store()
    capsule = await store.get_capsule(request.repo_id, request.file_path)
    if capsule is None:
        raise HTTPException(status_code=404, detail="No capsule found for this file.")
    return {
        "answer": capsule.summary,
        "question": request.question,
        "risks": capsule.risks,
        "confidence": capsule.confidence,
    }


@app.post("/annotate")
async def annotate(request: AnnotateRequest) -> dict:
    annotation = to_annotation(request)
    await get_store().add_annotation(annotation)
    return {"status": "saved", "annotation": annotation}


@app.post("/scrape/github")
async def scrape_github(request: GitHubScrapeRequest) -> dict:
    settings = get_settings()
    try:
        if request.repository_url:
            scraper = GitHubScraper.from_url(
                request.repository_url,
                token=settings.github_token,
                min_interval_seconds=settings.github_min_interval_seconds,
                max_retries=settings.github_max_retries,
                rate_limit_wait_cap_seconds=settings.github_rate_limit_wait_cap_seconds,
            )
        elif request.owner and request.repo:
            scraper = GitHubScraper(
                request.owner,
                request.repo,
                token=settings.github_token,
                min_interval_seconds=settings.github_min_interval_seconds,
                max_retries=settings.github_max_retries,
                rate_limit_wait_cap_seconds=settings.github_rate_limit_wait_cap_seconds,
            )
        else:
            raise GitHubScraperError("Provide repository_url, or both owner and repo.")
        snapshot = scraper.scrape(repo_id=request.repo_id, max_files=request.max_files)
    except GitHubScraperError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    await get_store().save_github_snapshot(snapshot)
    output_file, file_paths = save_snapshot_report(snapshot)
    return {
        "status": "saved",
        "output_file": str(output_file),
        "file_report_count": len(file_paths),
        "file_reports_dir": str(file_paths[0].parent) if file_paths else None,
        "snapshot": snapshot,
    }


@app.get("/scrape/github/{repo_id:path}")
async def get_github_snapshot(repo_id: str) -> dict:
    snapshot = await get_store().get_github_snapshot(repo_id)
    if snapshot is None:
        raise HTTPException(status_code=404, detail="No GitHub snapshot found for this repo.")
    return snapshot.model_dump()


@app.post("/scrape/file")
async def scrape_file(request: FileScrapeRequest) -> dict:
    try:
        return run_file_scraper(
            repository_url=request.repository_url,
            relative_file_path=request.relative_file_path,
            workspace_base=request.workspace_base,
            output_file=request.output_file,
            timeout_seconds=request.timeout_seconds,
        )
    except FileScraperError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/graph/{repo_id}")
async def graph(repo_id: str) -> dict:
    return (await get_store().get_graph(repo_id)).model_dump()


@app.get("/trace/{repo_id}/{file_path:path}")
async def trace(repo_id: str, file_path: str) -> dict:
    store = get_store()
    feature = await store.get_file_feature(repo_id, file_path)
    capsule = await store.get_capsule(repo_id, file_path)
    experts = await store.get_experts(repo_id, file_path)
    if feature is None:
        raise HTTPException(status_code=404, detail="No trace found for this file.")
    return {"feature": feature, "capsule": capsule, "experts": experts}


def run() -> None:
    uvicorn.run("lore.api.server:app", host="0.0.0.0", port=8000, reload=True)
