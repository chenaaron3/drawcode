import type { LessonHook } from "@/types/lesson";

import { useHelloWorld } from "./hooks/hello-world/useHelloWorld";
import { useNumbers } from "./hooks/numbers/useNumbers";
import { useQuestNotes } from "./hooks/quest-notes/useQuestNotes";
// Manual imports - more reliable for deployment
import { useStrings } from "./hooks/strings/useStrings";

export const lessonHooks: Record<string, LessonHook> = {
  "hello-world": useHelloWorld,
  numbers: useNumbers,
  strings: useStrings,
  "quest-notes": useQuestNotes,
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
