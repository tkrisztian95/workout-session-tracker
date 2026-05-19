export * as v1 from './v1';
export * as v2 from './v2';

// current points to the active production versions
export { adjustPlanSystem as adjustCurrent, swapExerciseSystem as swapCurrent } from './v2';
