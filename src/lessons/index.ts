import type { LessonHook } from "@/types/lesson";

// Dynamically import all lesson hooks
// This will find all files matching the pattern and import them at build time
const hookModules = import.meta.glob("./hooks/**/use*.ts", {
  eager: true,
});

// Registry of lesson hooks - automatically populated
export const lessonHooks: Record<string, LessonHook> = {};

// Process the imported modules
for (const path in hookModules) {
  const module = hookModules[path] as any;

  // Extract lesson ID from the file path
  // Pattern: ./hooks/meet-your-hero/useMeetYourHero.ts -> meet-your-hero
  const pathMatch = path.match(/\/hooks\/([^\/]+)\//);
  if (pathMatch) {
    const lessonId = pathMatch[1];

    // Look for exported hook function (should start with 'use')
    const hookFunction = Object.values(module).find(
      (exp: any) => typeof exp === "function" && exp.name.startsWith("use")
    ) as LessonHook;

    if (hookFunction) {
      lessonHooks[lessonId] = hookFunction;
      console.log(`Registered lesson hook: ${lessonId}`);
    }
  }
}

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
