import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AiContext } from './context';
import type { LlmConfig } from '../types';
import { buildYoutubeDayPrompt, parseYoutubeDay } from './youtubeDay';
import { AiValidationError } from './index';

vi.mock('./client', () => ({
  callLlm: vi.fn(),
}));
import { callLlm } from './client';

const config: LlmConfig = { provider: 'openai', apiKey: 'sk-test', model: 'gpt-4o-mini' };

function makeCtx(): AiContext {
  return {
    language: null,
    profile: {},
    activePlans: [],
    recentSessions: [],
    progression: [],
    exerciseHistoryNames: [],
  };
}

const video = { title: 'Full Body Workout', description: '3x10 Squats\n3x12 Push-ups' };

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(callLlm).mockReset();
});

describe('buildYoutubeDayPrompt', () => {
  it('includes the title and description', () => {
    const prompt = buildYoutubeDayPrompt(makeCtx(), video);
    expect(prompt).toContain('Full Body Workout');
    expect(prompt).toContain('3x10 Squats');
  });

  it('caps an overlong description', () => {
    const long = 'x'.repeat(10000);
    const prompt = buildYoutubeDayPrompt(makeCtx(), { title: 't', description: long });
    expect(prompt).not.toContain('x'.repeat(6001));
  });
});

describe('parseYoutubeDay', () => {
  it('parses a valid day and assigns exercise ids', async () => {
    vi.mocked(callLlm).mockResolvedValue(
      JSON.stringify({
        valid: true,
        name: 'Full Body',
        weekdays: [],
        coreExercises: [
          { name: 'Squat', type: 'sets-reps', sets: 3, reps: 10, role: 'core', muscle: 'quads' },
        ],
        optionalExercises: [],
      }),
    );

    const day = await parseYoutubeDay(config, makeCtx(), video);
    expect(day.name).toBe('Full Body');
    expect(day.coreExercises).toHaveLength(1);
    expect(day.coreExercises[0].id).toBeTruthy();
    expect(day.coreExercises[0].muscle).toBe('quads');
  });

  it('normalizes a repsPerSet scheme and drops reps', async () => {
    vi.mocked(callLlm).mockResolvedValue(
      JSON.stringify({
        valid: true,
        name: 'Pyramid',
        coreExercises: [
          {
            name: 'Bench',
            type: 'sets-reps',
            reps: 10,
            repsPerSet: [15, 12, 8, 4],
            role: 'core',
          },
        ],
      }),
    );

    const day = await parseYoutubeDay(config, makeCtx(), video);
    const ex = day.coreExercises[0];
    expect(ex.repsPerSet).toEqual([15, 12, 8, 4]);
    expect(ex.sets).toBe(4);
    expect(ex.reps).toBeUndefined();
  });

  it('throws AiValidationError when the video is not a workout', async () => {
    vi.mocked(callLlm).mockResolvedValue(
      JSON.stringify({ valid: false, validationError: 'Not a workout video.' }),
    );
    await expect(parseYoutubeDay(config, makeCtx(), video)).rejects.toBeInstanceOf(
      AiValidationError,
    );
  });

  it('falls back to the video title when no name is given', async () => {
    vi.mocked(callLlm).mockResolvedValue(
      JSON.stringify({ valid: true, coreExercises: [], optionalExercises: [] }),
    );
    const day = await parseYoutubeDay(config, makeCtx(), video);
    expect(day.name).toBe('Full Body Workout');
  });

  it('filters out-of-range weekdays', async () => {
    vi.mocked(callLlm).mockResolvedValue(
      JSON.stringify({ valid: true, name: 'D', weekdays: [1, 9, -2, 6], coreExercises: [] }),
    );
    const day = await parseYoutubeDay(config, makeCtx(), video);
    expect(day.weekdays).toEqual([1, 6]);
  });
});
