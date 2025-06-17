// Utility for tracking lesson, module, and course completion in localStorage

export type LessonId = string;
export type ModuleId = string;
export type CourseId = string;

export interface LessonProgress {
  isComplete: boolean;
  completedAt: string; // ISO date
}

export interface ModuleProgress {
  isComplete: boolean;
  lessons: Record<LessonId, LessonProgress>;
}

export interface CourseProgress {
  isComplete: boolean;
  modules: Record<ModuleId, ModuleProgress>;
}

export interface CoursesProgress {
  courses: Record<CourseId, CourseProgress>;
}

export interface LastPosition {
  courseId: CourseId;
  moduleId: ModuleId;
  lessonId: LessonId;
}

const STORAGE_KEY = "coursesProgress";
const LAST_POSITION_KEY = "lastPosition";

function getCoursesProgress(): CoursesProgress {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback to empty
    }
  }
  return { courses: {} };
}

function setCoursesProgress(progress: CoursesProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export const ProgressStorage = {
  // Mark a lesson as completed (requires courseId, moduleId, lessonId)
  markLessonCompleted: (
    courseId: CourseId,
    moduleId: ModuleId,
    lessonId: LessonId
  ) => {
    const progress = getCoursesProgress();
    if (!progress.courses[courseId]) {
      progress.courses[courseId] = { isComplete: false, modules: {} };
    }
    if (!progress.courses[courseId].modules[moduleId]) {
      progress.courses[courseId].modules[moduleId] = {
        isComplete: false,
        lessons: {},
      };
    }
    if (
      !progress.courses[courseId].modules[moduleId].lessons[lessonId] ||
      !progress.courses[courseId].modules[moduleId].lessons[lessonId].isComplete
    ) {
      progress.courses[courseId].modules[moduleId].lessons[lessonId] = {
        isComplete: true,
        completedAt: new Date().toISOString(),
      };
      setCoursesProgress(progress);
    }
  },

  // Mark a module as completed
  markModuleCompleted: (courseId: CourseId, moduleId: ModuleId) => {
    const progress = getCoursesProgress();
    if (!progress.courses[courseId]) {
      progress.courses[courseId] = { isComplete: false, modules: {} };
    }
    if (!progress.courses[courseId].modules[moduleId]) {
      progress.courses[courseId].modules[moduleId] = {
        isComplete: true,
        lessons: {},
      };
    } else {
      progress.courses[courseId].modules[moduleId].isComplete = true;
    }
    setCoursesProgress(progress);
  },

  // Mark a course as completed
  markCourseCompleted: (courseId: CourseId) => {
    const progress = getCoursesProgress();
    if (!progress.courses[courseId]) {
      progress.courses[courseId] = { isComplete: true, modules: {} };
    } else {
      progress.courses[courseId].isComplete = true;
    }
    setCoursesProgress(progress);
  },

  // Get all completed lessons for a module in a course
  getCompletedLessons: (courseId: CourseId, moduleId: ModuleId): LessonId[] => {
    const progress = getCoursesProgress();
    const lessons =
      progress.courses[courseId]?.modules[moduleId]?.lessons || {};
    return Object.entries(lessons)
      .filter(([_, l]) => l.isComplete)
      .map(([lessonId]) => lessonId);
  },

  // Get all completed modules for a course
  getCompletedModules: (courseId: CourseId): ModuleId[] => {
    const progress = getCoursesProgress();
    const modules = progress.courses[courseId]?.modules || {};
    return Object.entries(modules)
      .filter(([_, m]) => m.isComplete)
      .map(([moduleId]) => moduleId);
  },

  // Get all completed courses
  getCompletedCourses: (): CourseId[] => {
    const progress = getCoursesProgress();
    return Object.entries(progress.courses)
      .filter(([_, c]) => c.isComplete)
      .map(([courseId]) => courseId);
  },

  // Check if a specific lesson is completed
  isLessonCompleted: (
    courseId: CourseId,
    moduleId: ModuleId,
    lessonId: LessonId
  ): boolean => {
    if (process.env.NODE_ENV === "development") {
      return true;
    }
    const progress = getCoursesProgress();
    return !!progress.courses[courseId]?.modules[moduleId]?.lessons[lessonId]
      ?.isComplete;
  },

  // Check if a specific module is completed
  isModuleCompleted: (courseId: CourseId, moduleId: ModuleId): boolean => {
    const progress = getCoursesProgress();
    return !!progress.courses[courseId]?.modules[moduleId]?.isComplete;
  },

  // Check if a specific course is completed
  isCourseCompleted: (courseId: CourseId): boolean => {
    const progress = getCoursesProgress();
    return !!progress.courses[courseId]?.isComplete;
  },

  // Get lesson completion date
  getLessonCompletedAt: (
    courseId: CourseId,
    moduleId: ModuleId,
    lessonId: LessonId
  ): string | null => {
    const progress = getCoursesProgress();
    return (
      progress.courses[courseId]?.modules[moduleId]?.lessons[lessonId]
        ?.completedAt || null
    );
  },

  // Reset all progress (for testing or user request)
  resetProgress: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_POSITION_KEY);
  },

  // Save the user's current position (courseId, moduleId, lessonId)
  saveLastPosition: (
    courseId: CourseId,
    moduleId: ModuleId,
    lessonId: LessonId
  ) => {
    localStorage.setItem(
      LAST_POSITION_KEY,
      JSON.stringify({ courseId, moduleId, lessonId })
    );
  },

  // Get the user's last position
  getLastPosition: (): LastPosition | null => {
    const stored = localStorage.getItem(LAST_POSITION_KEY);
    return stored ? JSON.parse(stored) : null;
  },
};
