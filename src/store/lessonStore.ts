import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  Curriculum,
  Module,
  Lesson,
  LessonStep,
  LessonSession,
  UserProgress,
  LessonPlayerState,
} from "@/types/lesson";

interface LessonState extends LessonPlayerState {
  // Data
  curriculum: Curriculum | null;
  userProgress: UserProgress | null;
  currentSession: LessonSession | null;

  // Actions - Navigation
  loadCurriculum: (curriculum: Curriculum) => void;
  selectModule: (moduleId: string) => void;
  selectLesson: (lessonId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;

  // Actions - Progress
  startLesson: (lessonId: string) => void;
  completeStep: (stepId: string) => void;
  completeLesson: () => void;
  submitQuizAnswer: (quizId: string, answer: any) => void;
  updateModifiedCode: (code: string) => void;

  // Actions - UI State
  setPlaying: (isPlaying: boolean) => void;
  setShowHints: (showHints: boolean) => void;
  setEditMode: (isEditMode: boolean) => void;
  setDebuggerMode: (mode: "lesson" | "free") => void;
  setSyncWithDebugger: (sync: boolean) => void;

  // Actions - Progress Management
  resetLesson: () => void;
  resetAllProgress: () => void;

  // Selectors
  getCurrentQuiz: () => any | null;
  getModuleProgress: (moduleId: string) => number;
  canAdvanceToNextStep: () => boolean;
  isLessonCompleted: (lessonId: string) => boolean;
}

export const useLessonStore = create<LessonState>()(
  persist(
    (set, get) => ({
      // Initial state
      curriculum: null,
      userProgress: null,
      currentSession: null,
      currentLesson: null,
      currentModule: null,
      currentStep: null,
      currentStepIndex: 0,
      isPlaying: false,
      showHints: false,
      isEditMode: false,
      debuggerMode: "lesson",
      syncWithDebugger: true,

      // Navigation actions
      loadCurriculum: (curriculum: Curriculum) => {
        set({ curriculum });

        // Initialize user progress if not exists
        const state = get();
        if (!state.userProgress) {
          const userProgress: UserProgress = {
            completedLessons: [],
            lessonProgress: {},
            achievements: [],
            totalTime: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set({ userProgress });
        }
      },

      selectModule: (moduleId: string) => {
        const state = get();
        const module = state.curriculum?.modules.find((m) => m.id === moduleId);
        if (module) {
          set({
            currentModule: module,
            currentLesson: null,
            currentStep: null,
            currentStepIndex: 0,
          });
        }
      },

      selectLesson: (lessonId: string) => {
        const state = get();
        let foundLesson: Lesson | undefined;
        let foundModule: Module | undefined;

        // Find lesson across all modules
        if (state.curriculum) {
          for (const module of state.curriculum.modules) {
            const lesson = module.lessons.find((l) => l.id === lessonId);
            if (lesson) {
              foundLesson = lesson;
              foundModule = module;
              break;
            }
          }
        }

        if (foundLesson && foundModule) {
          set({
            currentModule: foundModule,
            currentLesson: foundLesson,
            currentStep: foundLesson.steps[0] || null,
            currentStepIndex: 0,
          });
        }
      },

      nextStep: () => {
        const state = get();
        const lesson = state.currentLesson;
        if (!lesson) return;

        const nextIndex = state.currentStepIndex + 1;
        if (nextIndex < lesson.steps.length) {
          set({
            currentStepIndex: nextIndex,
            currentStep: lesson.steps[nextIndex],
          });
        }
      },

      previousStep: () => {
        const state = get();
        const lesson = state.currentLesson;
        if (!lesson) return;

        const prevIndex = state.currentStepIndex - 1;
        if (prevIndex >= 0) {
          set({
            currentStepIndex: prevIndex,
            currentStep: lesson.steps[prevIndex],
          });
        }
      },

      goToStep: (stepIndex: number) => {
        const state = get();
        const lesson = state.currentLesson;
        if (!lesson || stepIndex < 0 || stepIndex >= lesson.steps.length)
          return;

        set({
          currentStepIndex: stepIndex,
          currentStep: lesson.steps[stepIndex],
        });
      },

      // Progress actions
      startLesson: (lessonId: string) => {
        const state = get();

        // Create new session
        const session: LessonSession = {
          lessonId,
          currentStepIndex: 0,
          startedAt: new Date(),
          quizAnswers: {},
          quizScores: {},
          isCompleted: false,
          completedSteps: [],
        };

        // Update user progress
        const updatedProgress = {
          ...state.userProgress!,
          lessonProgress: {
            ...state.userProgress?.lessonProgress,
            [lessonId]: session,
          },
          updatedAt: new Date(),
        };

        set({
          currentSession: session,
          userProgress: updatedProgress,
        });
      },

      completeStep: (stepId: string) => {
        const state = get();
        if (!state.currentSession) return;

        const updatedSession = {
          ...state.currentSession,
          completedSteps: [...state.currentSession.completedSteps, stepId],
        };

        const updatedProgress = {
          ...state.userProgress!,
          lessonProgress: {
            ...state.userProgress?.lessonProgress,
            [state.currentSession.lessonId]: updatedSession,
          },
          updatedAt: new Date(),
        };

        set({
          currentSession: updatedSession,
          userProgress: updatedProgress,
        });
      },

      completeLesson: () => {
        const state = get();
        if (!state.currentSession || !state.currentLesson) return;

        const lessonId = state.currentLesson.id;

        // Mark session as completed
        const completedSession = {
          ...state.currentSession,
          isCompleted: true,
        };

        // Add to completed lessons if not already there
        const completedLessons = state.userProgress?.completedLessons || [];
        if (!completedLessons.includes(lessonId)) {
          completedLessons.push(lessonId);
        }

        const updatedProgress = {
          ...state.userProgress!,
          completedLessons,
          lessonProgress: {
            ...state.userProgress?.lessonProgress,
            [lessonId]: completedSession,
          },
          updatedAt: new Date(),
        };

        set({
          currentSession: completedSession,
          userProgress: updatedProgress,
        });
      },

      submitQuizAnswer: (quizId: string, answer: any) => {
        const state = get();
        if (!state.currentSession) return;

        const updatedSession = {
          ...state.currentSession,
          quizAnswers: {
            ...state.currentSession.quizAnswers,
            [quizId]: answer,
          },
        };

        const updatedProgress = {
          ...state.userProgress!,
          lessonProgress: {
            ...state.userProgress?.lessonProgress,
            [state.currentSession.lessonId]: updatedSession,
          },
          updatedAt: new Date(),
        };

        set({
          currentSession: updatedSession,
          userProgress: updatedProgress,
        });
      },

      updateModifiedCode: (code: string) => {
        const state = get();
        if (!state.currentSession) return;

        const updatedSession = {
          ...state.currentSession,
          modifiedCode: code,
        };

        set({ currentSession: updatedSession });
      },

      // UI State actions
      setPlaying: (isPlaying: boolean) => set({ isPlaying }),
      setShowHints: (showHints: boolean) => set({ showHints }),
      setEditMode: (isEditMode: boolean) => set({ isEditMode }),
      setDebuggerMode: (mode: "lesson" | "free") => set({ debuggerMode: mode }),
      setSyncWithDebugger: (sync: boolean) => set({ syncWithDebugger: sync }),

      // Reset actions
      resetLesson: () => {
        const state = get();
        if (!state.currentLesson) return;

        const lessonId = state.currentLesson.id;

        // Reset session
        const resetSession: LessonSession = {
          lessonId,
          currentStepIndex: 0,
          startedAt: new Date(),
          quizAnswers: {},
          quizScores: {},
          isCompleted: false,
          completedSteps: [],
        };

        const updatedProgress = {
          ...state.userProgress!,
          lessonProgress: {
            ...state.userProgress?.lessonProgress,
            [lessonId]: resetSession,
          },
          updatedAt: new Date(),
        };

        set({
          currentSession: resetSession,
          userProgress: updatedProgress,
          currentStepIndex: 0,
          currentStep: state.currentLesson.steps[0] || null,
        });
      },

      resetAllProgress: () => {
        const userProgress: UserProgress = {
          completedLessons: [],
          lessonProgress: {},
          achievements: [],
          totalTime: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set({
          userProgress,
          currentSession: null,
          currentStepIndex: 0,
        });
      },

      // Selectors
      getCurrentQuiz: () => {
        const state = get();
        const step = state.currentStep;
        return step?.type === "guide" ? step.quiz : null;
      },

      getModuleProgress: (moduleId: string) => {
        const state = get();
        const module = state.curriculum?.modules.find((m) => m.id === moduleId);
        if (!module) return 0;

        const completedLessons = module.lessons.filter((lesson) =>
          state.userProgress?.completedLessons.includes(lesson.id)
        ).length;

        return (completedLessons / module.lessons.length) * 100;
      },

      canAdvanceToNextStep: () => {
        const state = get();
        const step = state.currentStep;

        // For guide steps, check if quiz is answered
        if (step?.type === "guide" && step.quiz) {
          return !!state.currentSession?.quizAnswers[step.quiz.id];
        }

        // For other steps, can always advance
        return true;
      },

      isLessonCompleted: (lessonId: string) => {
        const state = get();
        return state.userProgress?.completedLessons.includes(lessonId) || false;
      },
    }),
    {
      name: "lesson-store",
      // Only persist user progress, not current UI state
      partialize: (state) => ({
        userProgress: state.userProgress,
        debuggerMode: state.debuggerMode,
      }),
    }
  )
);

// Selectors for easier use in components
export const selectCurrentQuiz = () =>
  useLessonStore((state) => state.getCurrentQuiz());
export const selectCanAdvance = () =>
  useLessonStore((state) => state.canAdvanceToNextStep());
export const selectModuleProgress = (moduleId: string) =>
  useLessonStore((state) => state.getModuleProgress(moduleId));
export const selectIsLessonCompleted = (lessonId: string) =>
  useLessonStore((state) => state.isLessonCompleted(lessonId));
