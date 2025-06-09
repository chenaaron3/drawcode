// Dynamically import all lesson markdown files from the data/lessons directory
const lessonModules = import.meta.glob("./lessons/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

// Transform the file paths into lesson IDs and create the LESSONS object
export const LESSONS: Record<string, string> = {};

for (const path in lessonModules) {
  // Extract filename without extension from path like './lessons/introducing-strings.md'
  const filename = path.split("/").pop()?.replace(".md", "");
  if (filename && lessonModules[path]) {
    LESSONS[filename] = lessonModules[path] as string;
  }
}

// Helper function to get lesson content for a specific lesson
export function getLessonContent(contentPath: string): string | undefined {
  // Remove .md extension if present to match our key format
  const lessonKey = contentPath.replace(".md", "");
  return LESSONS[lessonKey];
}

// Export available lesson IDs
export const AVAILABLE_LESSON_IDS: string[] = Object.keys(LESSONS);
