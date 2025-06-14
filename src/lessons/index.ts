import type { LessonHook } from "@/types/lesson";

// Manual imports - more reliable for deployment
import { useMeetYourHero } from "./hooks/meet-your-hero/useMeetYourHero";
import { useQuestNotes } from "./hooks/quest-notes/useQuestNotes";
import { useVoiceOfTheHero } from "./hooks/voice-of-the-hero/useVoiceOfTheHero";

export const lessonHooks: Record<string, LessonHook> = {
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
