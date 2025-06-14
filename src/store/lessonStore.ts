import { create } from "zustand";

import type { LessonTask } from "@/types/lesson";
export interface LessonState {
  // Current lesson
  currentLessonId: string | null;
  content: string;
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;

  // Tasks
  currentTask: LessonTask | null;
  allTasks: LessonTask[];
  completedTasks: LessonTask[];
  completedTaskCount: number;

  // Progress
  lessonProgress: Record<
    string,
    {
      completed: boolean;
    }
  >;
}

export interface LessonActions {
  // Content management
  setContent: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Lesson management
  startLesson: (
    lessonId: string,
    content: string,
    tasks: Omit<LessonTask, "completed" | "completedAt">[]
  ) => void;
  completeLesson: () => void;

  // Task management
  addTask: (task: Omit<LessonTask, "completed" | "completedAt">) => void;
  completeTask: () => void;
  clearTasks: () => void;
  finishAllTasks: () => void;

  // Reset
  reset: () => void;
}

const initialState: LessonState = {
  currentLessonId: null,
  content: "",
  isLoading: false,
  isComplete: false,
  error: null,
  currentTask: null,
  allTasks: [],
  completedTasks: [],
  completedTaskCount: 0,
  lessonProgress: {},
};

export const useLessonStore = create<LessonState & LessonActions>(
  (set, get) => ({
    ...initialState,

    // Content management
    setContent: (content) => set({ content }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // Lesson management
    startLesson: (lessonId, content, tasks) => {
      set({
        isComplete: false,
        currentLessonId: lessonId,
        currentTask: tasks[0],
        allTasks: tasks,
        completedTasks: [],
        completedTaskCount: 0,
        error: null,
        content: content,
      });
    },

    completeLesson: () => {
      const state = get();
      set({
        isComplete: true,
        lessonProgress: {
          ...state.lessonProgress,
          [state.currentLessonId!]: {
            completed: true,
          },
        },
      });
    },

    // Task management
    addTask: (taskData) => {
      const task: LessonTask = {
        ...taskData,
        completed: false,
      };

      set((state) => {
        const newAllTasks = [...state.allTasks, task];
        return {
          allTasks: newAllTasks,
          // Set as current task if no current task exists
          currentTask: state.currentTask || task,
        };
      });
    },

    completeTask: () => {
      set((state) => {
        if (!state.currentTask) {
          return state;
        }

        const completedTask: LessonTask = {
          ...state.currentTask,
          completed: true,
          completedAt: new Date(),
        };

        const newCompletedCount = state.completedTaskCount + 1;
        const remainingTasks = state.allTasks.slice(newCompletedCount);
        const nextTask = remainingTasks.length > 0 ? remainingTasks[0] : null;

        // If the task has a callback, call it
        if (state.currentTask?.callback) {
          state.currentTask.callback();
        }

        return {
          completedTasks: [...state.completedTasks, completedTask],
          completedTaskCount: newCompletedCount,
          currentTask: nextTask,
        };
      });
    },

    clearTasks: () =>
      set({
        currentTask: null,
        allTasks: [],
        completedTasks: [],
        completedTaskCount: 0,
      }),

    finishAllTasks: () => {
      set({
        completedTasks: get().allTasks,
        completedTaskCount: get().allTasks.length,
        isComplete: true,
      });
    },

    // Reset
    reset: () => set(initialState),
  })
);
