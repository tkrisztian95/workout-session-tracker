import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { importSessions } from '../src/lib/ai/import.ts';
import { scoreFixture, type FixtureResult, type ExpectedSession } from './score.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, 'fixtures');

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

if (!apiKey) {
  console.error('Error: OPENAI_API_KEY env var is required');
  process.exit(1);
}

const config = { provider: 'openai' as const, apiKey, model };

type Fixture = {
  description?: string;
  input: {
    notes: string;
    language: string;
    existingNames: string[];
  };
  expected: ExpectedSession[];
};

async function runFixture(file: string): Promise<FixtureResult> {
  const raw = readFileSync(join(FIXTURES_DIR, file), 'utf-8');
  const fixture: Fixture = JSON.parse(raw);
  const { notes, language, existingNames } = fixture.input;

  console.log(`\nRunning: ${file}${fixture.description ? ` — ${fixture.description}` : ''}`);

  let actual;
  try {
    actual = await importSessions(notes, language, existingNames, config);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { fixture: file, score: 0, sessions: [], errors: [`API error: ${msg}`] };
  }

  const result = scoreFixture(file, fixture.expected, actual);

  // Per-exercise detail
  for (const session of result.sessions) {
    for (const ex of session.exerciseResults) {
      if (!ex.matched) continue;
      const failing = Object.entries(ex.fields).filter(([, c]) => !c.pass);
      if (failing.length > 0) {
        console.log(`  "${ex.expectedName}" field mismatches:`);
        for (const [field, check] of failing) {
          console.log(
            `    ${field}: expected ${JSON.stringify(check.expected)}, got ${JSON.stringify(check.actual)}`,
          );
        }
      }
    }
  }

  return result;
}

const files = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.json'));

if (files.length === 0) {
  console.log('No fixture files found in evals/fixtures/');
  process.exit(0);
}

const results: FixtureResult[] = [];
for (const file of files) {
  results.push(await runFixture(file));
}

// Summary
console.log('\n' + '─'.repeat(60));
console.log('RESULTS');
console.log('─'.repeat(60));

for (const r of results) {
  const filled = Math.round(r.score / 5);
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
  console.log(`${r.score.toString().padStart(3)}%  ${bar}  ${r.fixture}`);
  for (const e of r.errors) {
    console.log(`       ✗ ${e}`);
  }
}

const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
console.log('─'.repeat(60));
console.log(`Overall: ${avg}%  (${results.length} fixture${results.length !== 1 ? 's' : ''})`);
