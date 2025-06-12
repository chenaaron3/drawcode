import type { LessonHook } from "@/types/lesson";

// Manual imports - more reliable for deployment
import { useMeetYourHero } from "./hooks/meet-your-hero/useMeetYourHero";

// Manual registry of lesson hooks - more reliable for GitHub Pages deployment
export const lessonHooks: Record<string, LessonHook> = {
  "meet-your-hero": useMeetYourHero,
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
