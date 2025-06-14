import type { LessonHook } from "@/types/lesson";

import { useHelloWorld } from "./hooks/hello-world/useHelloWorld";
// Manual imports - more reliable for deployment
import { useMeetYourHero } from "./hooks/meet-your-hero/useMeetYourHero";
import { useNumbers } from "./hooks/numbers/useNumbers";
import { useQuestNotes } from "./hooks/quest-notes/useQuestNotes";
import { useVoiceOfTheHero } from "./hooks/voice-of-the-hero/useVoiceOfTheHero";

export const lessonHooks: Record<string, LessonHook> = {
  "hello-world": useHelloWorld,
  numbers: useNumbers,
  "meet-your-hero": useMeetYourHero,
  "quest-notes": useQuestNotes,
  "voice-of-the-hero": useVoiceOfTheHero,
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
