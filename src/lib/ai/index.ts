export type { AiPlanPreferences, AiPlanResult } from './plan';
export { buildPlanSuggestionPrompt, suggestPlan } from './plan';

export type { AiImportResult } from './import';
export { importSessions } from './import';

export type { AiAdjustResult, AiSwapResult } from './adjust';
export { adjustPlan, swapExercise } from './adjust';

export type { AiSuggestResult, SessionExerciseRef } from './suggest';
export { suggestExercise } from './suggest';

export type { SessionDebriefResult } from './debrief';
export { generateSessionDebrief } from './debrief';

export type {
  AiContext,
  AiFeature,
  ContextProfile,
  SessionSummary,
  SessionSummaryExercise,
  ContextPreferences,
  ContextLikes,
  SessionEvaluation,
} from './context';
export {
  buildAiContext,
  summariseSessionToSummary,
  formatSessionSummaryLine,
  formatProfilePreamble,
  formatRecentSessions,
  formatLanguageInstruction,
  RECENT_SESSIONS_LIMIT,
} from './context';

/**
 * Error thrown when AI agent input is rejected as not fitness-relevant.
 */
export class AiValidationError extends Error {
  reason: string;
  constructor(reason: string) {
    super(reason);
    this.reason = reason;
    this.name = 'AiValidationError';
  }
}
