import { beforeEach, describe, expect, it, vi } from 'vitest';

const callLlm = vi.fn();
vi.mock('./client', () => ({ callLlm: (...args: unknown[]) => callLlm(...args) }));

import { generateSessionDebrief } from './debrief';
import type { AiContext } from './context';
import type { LlmConfig, WorkoutSession } from '../types';

const config: LlmConfig = { provider: 'openai', apiKey: 'sk-test', model: 'gpt-4o-mini' };

function ctx(over: Partial<AiContext> = {}): AiContext {
  return {
    language: null,
    profile: {},
    activePlans: [],
    recentSessions: [],
    progression: [],
    exerciseHistoryNames: [],
    evaluation: [],
    ...over,
  };
}

function finished(over: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 's1',
    startedAt: '2026-06-07T09:00:00.000Z',
    completedAt: '2026-06-07T10:00:00.000Z',
    exercises: [],
    evaluation: {
      overall: 'underperformed',
      counts: { overdone: 1, matched: 3, underperformed: 1, missed: 0, extra: 0 },
      totalVolumeKg: 4200,
      rating: 3,
      v: 1,
    },
    planDaySnapshot: {
      planName: 'PPL',
      day: { id: 'd1', name: 'Push', weekdays: [1], coreExercises: [], optionalExercises: [] },
      capturedAt: '2026-06-07T10:00:00.000Z',
    },
    ...over,
  };
}

beforeEach(() => {
  callLlm.mockReset();
});

describe('generateSessionDebrief', () => {
  it('returns the trimmed text and the config model on success', async () => {
    callLlm.mockResolvedValue(
      JSON.stringify({ debrief: 'You pushed bench two sets long. Start with squat next time.' }),
    );
    const result = await generateSessionDebrief(config, ctx(), finished());
    expect(result).toEqual({
      text: 'You pushed bench two sets long. Start with squat next time.',
      model: 'gpt-4o-mini',
    });
    expect(callLlm).toHaveBeenCalledTimes(1);
  });

  it('truncates a response longer than three sentences', async () => {
    callLlm.mockResolvedValue(JSON.stringify({ debrief: 'One. Two. Three. Four. Five.' }));
    const { text } = await generateSessionDebrief(config, ctx(), finished());
    expect(text).toBe('One. Two. Three.');
  });

  it('rejects an empty debrief string', async () => {
    callLlm.mockResolvedValue(JSON.stringify({ debrief: '   ' }));
    await expect(generateSessionDebrief(config, ctx(), finished())).rejects.toThrow(
      /missing the debrief/i,
    );
  });

  it('rejects a missing debrief field', async () => {
    callLlm.mockResolvedValue(JSON.stringify({ notDebrief: 'x' }));
    await expect(generateSessionDebrief(config, ctx(), finished())).rejects.toThrow(
      /missing the debrief/i,
    );
  });

  it('rejects a non-JSON response', async () => {
    callLlm.mockResolvedValue('not json at all');
    await expect(generateSessionDebrief(config, ctx(), finished())).rejects.toThrow(/parse JSON/i);
  });

  it('passes the evaluation summary into the prompt for a plan session', async () => {
    callLlm.mockResolvedValue(JSON.stringify({ debrief: 'ok. ok. ok.' }));
    await generateSessionDebrief(config, ctx(), finished());
    const userMessage = callLlm.mock.calls[0][2] as string;
    expect(userMessage).toContain('overall: underperformed');
    expect(userMessage).toContain('1 overdone');
    expect(userMessage).toContain('Push');
  });

  it('frames a no-plan session around volume and rating, not plan deviation', async () => {
    callLlm.mockResolvedValue(JSON.stringify({ debrief: 'ok. ok. ok.' }));
    const noPlan = finished({
      planDaySnapshot: undefined,
      evaluation: {
        overall: 'no-plan',
        counts: { overdone: 0, matched: 0, underperformed: 0, missed: 0, extra: 3 },
        totalVolumeKg: 5000,
        rating: 4,
        v: 1,
      },
    });
    await generateSessionDebrief(config, ctx(), noPlan);
    const userMessage = callLlm.mock.calls[0][2] as string;
    expect(userMessage).toContain('no plan');
    expect(userMessage).toContain('overall: no-plan');
    expect(userMessage).toContain('total volume: 5000 kg');
    expect(userMessage).toContain('session rating: 4/5');
  });
});
