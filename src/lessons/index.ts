import type { LessonHook } from "@/types/lesson";

import { useBooleanIntroduction } from "./hooks/boolean-introduction/useBooleanIntroduction";
import { useChangingNumbers } from "./hooks/changing-numbers/useChangingNumbers";
import { useEmptyVariables } from "./hooks/empty-variables/useEmptyVariables";
import { useExponents } from "./hooks/exponents/useExponents";
import { useHelloWorld } from "./hooks/hello-world/useHelloWorld";
import { useInitializeVariables } from "./hooks/initialize-variables/useInitializeVariables";
import { useNumbers } from "./hooks/numbers/useNumbers";
import { useQuestNotes } from "./hooks/quest-notes/useQuestNotes";
import { useStrings } from "./hooks/strings/useStrings";

export const lessonHooks: Record<string, LessonHook> = {
  "hello-world": useHelloWorld,
  numbers: useNumbers,
  strings: useStrings,
  "quest-notes": useQuestNotes,
  "boolean-introduction": useBooleanIntroduction,
  "empty-variables": useEmptyVariables,
  "initialize-variables": useInitializeVariables,
  "changing-numbers": useChangingNumbers,
  exponents: useExponents,
};

// Check if a lesson has a hook implementation
export function hasLessonHook(lessonId: string): boolean {
  return lessonId in lessonHooks;
}

// Get lesson hook
export function getLessonHook(lessonId: string): LessonHook | null {
  return lessonHooks[lessonId] || null;
}

// Debug: List all registered hooks
export function getRegisteredLessons(): string[] {
  return Object.keys(lessonHooks);
}
