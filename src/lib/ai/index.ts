export type { AiPlanPreferences, AiPlanResult } from './plan';
export { buildPlanSuggestionPrompt, suggestPlan } from './plan';

export type { AiImportResult } from './import';
export { importSessions } from './import';

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
