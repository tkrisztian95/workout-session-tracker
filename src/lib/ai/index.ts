export type { AiPlanPreferences, AiPlanResult } from './plan';
export { buildPlanSuggestionPrompt, suggestPlan } from './plan';

export type { AiImportResult } from './import';
export { importSessions } from './import';

export type { AiAdjustResult, AiSwapResult } from './adjust';
export { adjustPlan, swapExercise } from './adjust';

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
