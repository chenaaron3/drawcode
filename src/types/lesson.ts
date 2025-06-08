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
  code: string; // The lesson code to execute
  entrypoint: string;
  inputs: Record<string, any>;
  tags: string[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
}

export interface UserLessonProgress {
  moduleProgress: Record<
    string,
    {
      moduleId: string;
      completed: boolean;
      lessonsCompleted: number;
      totalLessons: number;
    }
  >;
  lessonProgress: Record<string, LessonProgress>;
}
