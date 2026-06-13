import * as readline from 'readline';
import { runPythonGitHubScraper } from '../controllers/pythonScraperController';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main(): Promise<void> {
  console.log('Lore GitHub Scraper Bridge');
  console.log('Paste a GitHub repository URL. Type "exit" to stop.\n');

  while (true) {
    const input = (await ask('github repo> ')).trim();
    if (!input) continue;
    if (['exit', 'quit', 'q'].includes(input.toLowerCase())) break;

    console.log('\n[SCRAPER] Running Python GitHub scraper...\n');
    const result = await runPythonGitHubScraper(input, {
      maxFiles: Number(process.env.LORE_SCRAPER_MAX_FILES ?? 30),
      timeoutMs: Number(process.env.LORE_SCRAPER_TIMEOUT_MS ?? 120000)
    });

    if (result.ok) {
      console.log(JSON.stringify(result.data, null, 2));
      const outputFile = (result.data as { output_file?: string }).output_file;
      if (outputFile) {
        console.log(`\n[SCRAPER] JSON saved to: ${outputFile}`);
      }
    } else {
      console.error(JSON.stringify(result.error, null, 2));
    }
    console.log('');
  }

  rl.close();
}

main().catch((error: Error) => {
  console.error(JSON.stringify({
    code: 'CLI_FATAL_ERROR',
    message: error.message
  }, null, 2));
  rl.close();
  process.exit(1);
});
