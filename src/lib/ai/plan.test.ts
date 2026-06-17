import { describe, expect, it } from 'vitest';
import { buildPlanSuggestionPrompt } from './plan';
import type { AiContext } from './context';

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

describe('buildPlanSuggestionPrompt', () => {
  it('omits the goals section when no preferences are given', () => {
    const prompt = buildPlanSuggestionPrompt(makeCtx());
    expect(prompt).not.toContain('My goals for this plan:');
  });

  it('includes free-form notes in the goals section', () => {
    const prompt = buildPlanSuggestionPrompt(makeCtx(), { notes: 'kettlebell only' });
    expect(prompt).toContain('My goals for this plan:');
    expect(prompt).toContain('Additional notes: kettlebell only');
  });

  it('trims whitespace and skips blank notes', () => {
    expect(buildPlanSuggestionPrompt(makeCtx(), { notes: '  ' })).not.toContain(
      'Additional notes:',
    );
    expect(buildPlanSuggestionPrompt(makeCtx(), { notes: '  no jumping  ' })).toContain(
      'Additional notes: no jumping',
    );
  });

  it('combines notes with the structured preferences', () => {
    const prompt = buildPlanSuggestionPrompt(makeCtx(), {
      focus: 'Strength',
      daysPerWeek: '3',
      goal: 'Build muscle',
      notes: 'kettlebell only',
    });
    expect(prompt).toContain('Focus: Strength');
    expect(prompt).toContain('Training days per week: 3');
    expect(prompt).toContain('Goal: Build muscle');
    expect(prompt).toContain('Additional notes: kettlebell only');
  });
});
