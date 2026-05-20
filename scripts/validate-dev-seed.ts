/**
 * Validates the dev-seed JSON corpus against the JSON Schemas in
 * `src/lib/dev-seed-data/schemas/`. Run via `npm run validate:seed`.
 *
 * Exits with code 1 if any file is missing or fails validation; prints the
 * AJV error path + message so the offending field is easy to locate.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, '..');
const DATA_DIR = join(REPO_ROOT, 'src/lib/dev-seed-data');
const SCHEMAS_DIR = join(DATA_DIR, 'schemas');

interface Target {
  label: string;
  schemaPath: string;
  dataPath: string;
}

const TARGETS: Target[] = [
  {
    label: 'plans/ppl.json',
    schemaPath: join(SCHEMAS_DIR, 'plan.schema.json'),
    dataPath: join(DATA_DIR, 'plans/ppl.json'),
  },
  {
    label: 'plans/upper-lower.json',
    schemaPath: join(SCHEMAS_DIR, 'plan.schema.json'),
    dataPath: join(DATA_DIR, 'plans/upper-lower.json'),
  },
  {
    label: 'plans/full-body.json',
    schemaPath: join(SCHEMAS_DIR, 'plan.schema.json'),
    dataPath: join(DATA_DIR, 'plans/full-body.json'),
  },
  {
    label: 'sessions.json',
    schemaPath: join(SCHEMAS_DIR, 'sessions.schema.json'),
    dataPath: join(DATA_DIR, 'sessions.json'),
  },
  {
    label: 'profile.json',
    schemaPath: join(SCHEMAS_DIR, 'profile.schema.json'),
    dataPath: join(DATA_DIR, 'profile.json'),
  },
];

function loadJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function main(): void {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validators = new Map<string, ReturnType<typeof ajv.compile>>();
  let failed = 0;

  for (const target of TARGETS) {
    let validate = validators.get(target.schemaPath);
    if (!validate) {
      const schema = loadJson(target.schemaPath);
      validate = ajv.compile(schema as object);
      validators.set(target.schemaPath, validate);
    }
    const data = loadJson(target.dataPath);
    const ok = validate(data);
    if (ok) {
      console.log(`✓ ${target.label}`);
    } else {
      failed++;
      console.error(`✗ ${target.label}`);
      for (const err of validate.errors ?? []) {
        console.error(`    ${err.instancePath || '(root)'}  ${err.message}`);
      }
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} file(s) failed validation.`);
    process.exit(1);
  }
  console.log(`\nAll ${TARGETS.length} files valid.`);
}

main();
