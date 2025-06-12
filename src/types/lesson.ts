// Lesson types matching the existing problem structure

export interface LessonModule {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: number; // in minutes
  prerequisites: string[]; // moduleIds
  lessonIds: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  solution: string; // The lesson code to execute
  entrypoint: string;
  inputs: Record<string, any>;
  contentPath: string; // Path to the markdown content file
  mode?: "line" | "step"; // Optional mode override for this lesson
  time: number; // Estimated time in minutes
}

// New interface for TypeScript-based lessons
export interface LessonContent {
  id: string;
  content: string; // Markdown content as a string
  // Future expansion - we can add conditions, exercises, etc. here later
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
}

export interface LessonTask {
  id: string;
  title: string;
  description: string;
  callback?: () => void;
  completed: boolean;
  completedAt?: Date;
}

// Hook-based lesson system
export interface LessonHookResult {
  isReady: boolean;
  error: string | null;
}

export type LessonHook = (lessonId: string) => LessonHookResult;
