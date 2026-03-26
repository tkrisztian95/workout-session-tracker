import type { AiImportResult } from '../src/lib/ai/import';

export type ExpectedExercise = {
  name: string;
  type: 'sets-reps' | 'sets-duration' | 'duration';
  sets?: number;
  reps?: number;
  duration?: number;
  weightKg?: number;
  category?: string;
};

export type ExpectedSession = {
  date: string;
  durationMins?: number;
  exercises: ExpectedExercise[];
};

export type FieldCheck = { expected: unknown; actual: unknown; pass: boolean };

export type ExerciseResult = {
  expectedName: string;
  matched: boolean;
  fields: Record<string, FieldCheck>;
};

export type SessionResult = {
  expectedDate: string;
  dateMatch: boolean;
  durationMatch: boolean;
  exerciseResults: ExerciseResult[];
};

export type FixtureResult = {
  fixture: string;
  score: number; // 0–100
  sessions: SessionResult[];
  errors: string[];
};

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

function scoreSession(expected: ExpectedSession, actual: AiImportResult): SessionResult {
  const dateMatch = expected.date === actual.date;
  const durationMatch =
    expected.durationMins === undefined ||
    Math.abs(expected.durationMins - actual.durationMins) <= 10;

  const exerciseResults: ExerciseResult[] = expected.exercises.map((exp) => {
    const match = actual.exercises.find((a) => normalize(a.name) === normalize(exp.name));

    if (!match) {
      return { expectedName: exp.name, matched: false, fields: {} };
    }

    const fields: Record<string, FieldCheck> = {};

    fields.type = { expected: exp.type, actual: match.type, pass: exp.type === match.type };

    if (exp.sets !== undefined) {
      fields.sets = { expected: exp.sets, actual: match.sets, pass: exp.sets === match.sets };
    }
    if (exp.reps !== undefined) {
      fields.reps = { expected: exp.reps, actual: match.reps, pass: exp.reps === match.reps };
    }
    if (exp.duration !== undefined) {
      fields.duration = {
        expected: exp.duration,
        actual: match.duration,
        pass: match.duration !== undefined && Math.abs(exp.duration - match.duration) <= 5,
      };
    }
    if (exp.weightKg !== undefined) {
      fields.weightKg = {
        expected: exp.weightKg,
        actual: match.weightKg,
        pass: match.weightKg !== undefined && Math.abs(exp.weightKg - match.weightKg) <= 0.5,
      };
    }
    if (exp.category !== undefined) {
      fields.category = {
        expected: exp.category,
        actual: match.category,
        pass: match.category !== undefined && normalize(exp.category) === normalize(match.category),
      };
    }

    return { expectedName: exp.name, matched: true, fields };
  });

  return { expectedDate: expected.date, dateMatch, durationMatch, exerciseResults };
}

export function scoreFixture(
  fixtureName: string,
  expected: ExpectedSession[],
  actual: AiImportResult[],
): FixtureResult {
  const errors: string[] = [];
  const sessions: SessionResult[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  // Session count
  totalChecks++;
  if (expected.length === actual.length) {
    passedChecks++;
  } else {
    errors.push(`Session count: expected ${expected.length}, got ${actual.length}`);
  }

  for (const exp of expected) {
    const match = actual.find((a) => a.date === exp.date) ?? actual[0];

    if (!match) {
      errors.push(`No session found for date ${exp.date}`);
      continue;
    }

    const result = scoreSession(exp, match);
    sessions.push(result);

    // Date
    totalChecks++;
    if (result.dateMatch) passedChecks++;
    else errors.push(`Date: expected ${exp.date}, got ${match.date}`);

    // Duration
    if (exp.durationMins !== undefined) {
      totalChecks++;
      if (result.durationMatch) passedChecks++;
      else errors.push(`Duration: expected ${exp.durationMins}, got ${match.durationMins}`);
    }

    // Exercise count
    totalChecks++;
    if (exp.exercises.length === match.exercises.length) {
      passedChecks++;
    } else {
      errors.push(
        `Exercise count: expected ${exp.exercises.length}, got ${match.exercises.length}`,
      );
    }

    for (const exResult of result.exerciseResults) {
      totalChecks++; // name match
      if (exResult.matched) {
        passedChecks++;
        for (const check of Object.values(exResult.fields)) {
          totalChecks++;
          if (check.pass) passedChecks++;
        }
      } else {
        errors.push(`Exercise not found: "${exResult.expectedName}"`);
      }
    }
  }

  const score = totalChecks === 0 ? 0 : Math.round((passedChecks / totalChecks) * 100);
  return { fixture: fixtureName, score, sessions, errors };
}
