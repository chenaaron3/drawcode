import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface ProgressState {
  // Progress data
  coursesProgress: CoursesProgress;
  lastPosition: LastPosition | null;

  // Actions
  markLessonCompleted: (
    courseId: CourseId,
    moduleId: ModuleId,
    lessonId: LessonId,
  ) => void;
  markModuleCompleted: (courseId: CourseId, moduleId: ModuleId) => void;
  markCourseCompleted: (courseId: CourseId) => void;
  getCompletedLessons: (courseId: CourseId, moduleId: ModuleId) => LessonId[];
  getCompletedModules: (courseId: CourseId) => ModuleId[];
  getCompletedCourses: () => CourseId[];
  isLessonCompleted: (
    courseId: CourseId,
    moduleId: ModuleId,
    lessonId: LessonId,
  ) => boolean;
  isModuleCompleted: (courseId: CourseId, moduleId: ModuleId) => boolean;
  isCourseCompleted: (courseId: CourseId) => boolean;
  getLessonCompletedAt: (
    courseId: CourseId,
    moduleId: ModuleId,
    lessonId: LessonId,
  ) => string | null;
  resetProgress: () => void;
  saveLastPosition: (
    courseId: CourseId,
    moduleId: ModuleId,
    lessonId: LessonId,
  ) => void;
  getLastPosition: () => LastPosition | null;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      coursesProgress: { courses: {} },
      lastPosition: null,

      markLessonCompleted: (courseId, moduleId, lessonId) => {
        set((state) => {
          const progress = { ...state.coursesProgress };
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
            !progress.courses[courseId].modules[moduleId].lessons[lessonId]
              .isComplete
          ) {
            progress.courses[courseId].modules[moduleId].lessons[lessonId] = {
              isComplete: true,
              completedAt: new Date().toISOString(),
            };
          }
          return { coursesProgress: progress };
        });
      },

      markModuleCompleted: (courseId, moduleId) => {
        set((state) => {
          const progress = { ...state.coursesProgress };
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
          return { coursesProgress: progress };
        });
      },

      markCourseCompleted: (courseId) => {
        set((state) => {
          const progress = { ...state.coursesProgress };
          if (!progress.courses[courseId]) {
            progress.courses[courseId] = { isComplete: true, modules: {} };
          } else {
            progress.courses[courseId].isComplete = true;
          }
          return { coursesProgress: progress };
        });
      },

      getCompletedLessons: (courseId, moduleId) => {
        const state = get();
        const lessons =
          state.coursesProgress.courses[courseId]?.modules[moduleId]?.lessons ||
          {};
        return Object.entries(lessons)
          .filter(([_, l]) => l.isComplete)
          .map(([lessonId]) => lessonId);
      },

      getCompletedModules: (courseId) => {
        const state = get();
        const modules = state.coursesProgress.courses[courseId]?.modules || {};
        return Object.entries(modules)
          .filter(([_, m]) => m.isComplete)
          .map(([moduleId]) => moduleId);
      },

      getCompletedCourses: () => {
        const state = get();
        return Object.entries(state.coursesProgress.courses)
          .filter(([_, c]) => c.isComplete)
          .map(([courseId]) => courseId);
      },

      isLessonCompleted: (courseId, moduleId, lessonId) => {
        // if (process.env.NODE_ENV === "development") {
        //   return true;
        // }
        const state = get();
        return !!state.coursesProgress.courses[courseId]?.modules[moduleId]
          ?.lessons[lessonId]?.isComplete;
      },

      isModuleCompleted: (courseId, moduleId) => {
        const state = get();
        return !!state.coursesProgress.courses[courseId]?.modules[moduleId]
          ?.isComplete;
      },

      isCourseCompleted: (courseId) => {
        const state = get();
        return !!state.coursesProgress.courses[courseId]?.isComplete;
      },

      getLessonCompletedAt: (courseId, moduleId, lessonId) => {
        const state = get();
        return (
          state.coursesProgress.courses[courseId]?.modules[moduleId]?.lessons[
            lessonId
          ]?.completedAt || null
        );
      },

      resetProgress: () => {
        set({ coursesProgress: { courses: {} }, lastPosition: null });
      },

      saveLastPosition: (courseId, moduleId, lessonId) => {
        set({ lastPosition: { courseId, moduleId, lessonId } });
      },

      getLastPosition: () => {
        const state = get();
        return state.lastPosition;
      },
    }),
    {
      name: "courses-progress",
      partialize: (state) => ({
        coursesProgress: state.coursesProgress,
        lastPosition: state.lastPosition,
      }),
    },
  ),
);
