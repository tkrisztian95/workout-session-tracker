import { readdirSync, readFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { importSessions } from '../src/lib/ai/import';
import type { AiContext } from '../src/lib/ai/context';
import type { Locale } from '../src/lib/i18n';
import { scoreFixture, type FixtureResult, type ExpectedSession } from './score';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, 'fixtures');
const PROMPTS_DIR = join(__dirname, 'prompts');

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

type PromptVersion = {
  name: string;
  description: string;
  prompt: string;
};

async function loadPrompts(): Promise<PromptVersion[]> {
  const files = readdirSync(PROMPTS_DIR)
    .filter((f) => f.endsWith('.ts'))
    .sort();

  const versions: PromptVersion[] = [];
  for (const file of files) {
    const url = pathToFileURL(join(PROMPTS_DIR, file)).href;
    const mod = await import(url);
    versions.push({
      name: basename(file, '.ts'),
      description: mod.description ?? '',
      prompt: mod.prompt,
    });
  }
  return versions;
}

async function runFixture(
  file: string,
  fixture: Fixture,
  version: PromptVersion,
): Promise<FixtureResult> {
  const { notes, language, existingNames } = fixture.input;

  // The eval runner does not depend on localStorage. Build a synthetic envelope
  // containing only the inputs notes-import actually reads (`language`,
  // `exerciseHistoryNames`); everything else stays empty.
  const ctx: AiContext = {
    language: (language as Locale) || null,
    profile: {},
    activePlans: [],
    recentSessions: [],
    progression: [],
    exerciseHistoryNames: existingNames,
  };

  let actual;
  try {
    actual = await importSessions(config, ctx, notes, version.prompt);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { fixture: file, score: 0, sessions: [], errors: [`API error: ${msg}`] };
  }

  return scoreFixture(file, fixture.expected, actual);
}

const fixtureFiles = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.json'));

if (fixtureFiles.length === 0) {
  console.log('No fixture files found in evals/fixtures/');
  process.exit(0);
}

const fixtures = fixtureFiles.map((file) => ({
  file,
  data: JSON.parse(readFileSync(join(FIXTURES_DIR, file), 'utf-8')) as Fixture,
}));

const prompts = await loadPrompts();

if (prompts.length === 0) {
  console.log('No prompt files found in evals/prompts/');
  process.exit(0);
}

console.log(`Running ${fixtureFiles.length} fixture(s) × ${prompts.length} prompt version(s)\n`);

// results[promptName][fixtureFile] = FixtureResult
const results: Record<string, Record<string, FixtureResult>> = {};

for (const version of prompts) {
  results[version.name] = {};
  console.log(`── ${version.name}${version.description ? `: ${version.description}` : ''}`);

  for (const { file, data } of fixtures) {
    process.stdout.write(`   ${file} ... `);
    const result = await runFixture(file, data, version);
    results[version.name][file] = result;
    console.log(`${result.score}%`);

    for (const session of result.sessions) {
      for (const ex of session.exerciseResults) {
        if (!ex.matched) continue;
        const failing = Object.entries(ex.fields).filter(([, c]) => !c.pass);
        if (failing.length > 0) {
          console.log(`     "${ex.expectedName}" field mismatches:`);
          for (const [field, check] of failing) {
            console.log(
              `       ${field}: expected ${JSON.stringify(check.expected)}, got ${JSON.stringify(check.actual)}`,
            );
          }
        }
      }
    }
    for (const e of result.errors) {
      console.log(`     ✗ ${e}`);
    }
  }
  console.log();
}

// Comparison table
const col = 12; // width per prompt column
const labelWidth = Math.max(...fixtureFiles.map((f) => f.length), 'fixture'.length) + 2;
const divider = '─'.repeat(labelWidth + prompts.length * col);

console.log(divider);
const header = 'fixture'.padEnd(labelWidth) + prompts.map((p) => p.name.padStart(col)).join('');
console.log(header);
console.log(divider);

for (const file of fixtureFiles) {
  const row =
    file.padEnd(labelWidth) +
    prompts.map((p) => `${results[p.name][file].score}%`.padStart(col)).join('');
  console.log(row);
}

console.log(divider);

const avgRow =
  'average'.padEnd(labelWidth) +
  prompts
    .map((p) => {
      const scores = fixtureFiles.map((f) => results[p.name][f].score);
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      return `${avg}%`.padStart(col);
    })
    .join('');
console.log(avgRow);
