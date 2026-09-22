export * as v1 from './v1';
export * as v2 from './v2';

// current points to the active production version
export { sessionDebriefSystem as SESSION_DEBRIEF_SYSTEM_PROMPT } from './v2';
export const version = 2;
export const description = 'Acknowledge skipped exercises and their reasons; no medical advice';
