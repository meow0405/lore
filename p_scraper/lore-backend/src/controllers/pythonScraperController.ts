import * as path from 'path';
import { spawn } from 'child_process';

export interface PythonScraperOptions {
  maxFiles?: number;
  timeoutMs?: number;
}

export interface PythonScraperResult {
  ok: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    stderr?: string;
    stdout?: string;
  };
}

const GITHUB_REPO_URL_PATTERN = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/;

export function isValidGitHubRepoUrl(input: string): boolean {
  return GITHUB_REPO_URL_PATTERN.test(input.trim());
}

function repoRootFromBackend(): string {
  return path.resolve(process.cwd(), '..', '..');
}

function pythonPathEnv(repoRoot: string): string {
  const srcPath = path.join(repoRoot, 'src');
  const existing = process.env.PYTHONPATH;
  return existing ? `${srcPath}${path.delimiter}${existing}` : srcPath;
}

function classifyPythonFailure(stderr: string, stdout: string): { code: string; message: string } {
  const combined = `${stderr}\n${stdout}`.toLowerCase();
  if (combined.includes('rate limit') || combined.includes('api rate limit exceeded')) {
    return {
      code: 'GITHUB_RATE_LIMIT',
      message: 'GitHub API rate limit was hit. Set LORE_GITHUB_TOKEN in .env or try again later.'
    };
  }
  if (combined.includes('repository not found') || combined.includes('not found or inaccessible')) {
    return {
      code: 'REPOSITORY_NOT_FOUND',
      message: 'The GitHub repository could not be found or is not accessible.'
    };
  }
  if (combined.includes('modulenotfounderror')) {
    return {
      code: 'PYTHON_DEPENDENCY_ERROR',
      message: 'Python backend dependencies are missing. Run pip install -e ".[dev]" from the repo root.'
    };
  }
  return {
    code: 'SCRAPER_FAILED',
    message: 'The Python GitHub scraper failed.'
  };
}

export function runPythonGitHubScraper(
  repositoryUrl: string,
  options: PythonScraperOptions = {}
): Promise<PythonScraperResult> {
  const normalizedUrl = repositoryUrl.trim();
  if (!isValidGitHubRepoUrl(normalizedUrl)) {
    return Promise.resolve({
      ok: false,
      error: {
        code: 'INVALID_GITHUB_URL',
        message: 'Enter a valid GitHub repository URL, for example https://github.com/owner/repo.'
      }
    });
  }

  const repoRoot = repoRootFromBackend();
  const pythonExecutable = process.env.PYTHON || 'python';
  const maxFiles = String(options.maxFiles ?? 30);
  const timeoutMs = options.timeoutMs ?? 120000;

  return new Promise((resolve) => {
    const child = spawn(
      pythonExecutable,
      [
        '-m',
        'lore.ingestion.github_cli',
        '--repo-url',
        normalizedUrl,
        '--max-files',
        maxFiles
      ],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          PYTHONPATH: pythonPathEnv(repoRoot)
        },
        windowsHide: true
      }
    );

    let stdout = '';
    let stderr = '';
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      resolve({
        ok: false,
        error: {
          code: 'SCRAPER_TIMEOUT',
          message: `The scraper timed out after ${timeoutMs}ms.`,
          stdout,
          stderr
        }
      });
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on('error', (error: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve({
        ok: false,
        error: {
          code: 'PYTHON_PROCESS_ERROR',
          message: error.message,
          stdout,
          stderr
        }
      });
    });

    child.on('close', (code: number | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      if (code !== 0) {
        const failure = classifyPythonFailure(stderr, stdout);
        resolve({
          ok: false,
          error: {
            ...failure,
            stdout,
            stderr
          }
        });
        return;
      }

      try {
        resolve({ ok: true, data: JSON.parse(stdout) });
      } catch {
        resolve({
          ok: false,
          error: {
            code: 'INVALID_SCRAPER_JSON',
            message: 'The scraper completed but did not return valid JSON.',
            stdout,
            stderr
          }
        });
      }
    });
  });
}
