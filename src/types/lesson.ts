import type { ManualRelationship } from "./trace";

// EDGE methodology step types
export type LessonStepType = "explain" | "demonstrate" | "guide" | "enable";

// Quiz question types for the Guide phase
export type QuizQuestionType =
  | "multiple_choice"
  | "variable_prediction"
  | "output_prediction"
  | "fill_in_blank"
  | "true_false";

export interface QuizOption {
  text: string;
  correct: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options?: QuizOption[]; // For multiple choice
  correctAnswer?: string | number | boolean; // For other types
  explanation: string;
  stepIndex?: number; // Which debugger step triggers this quiz
  variableName?: string; // For variable prediction questions
}

// Tooltip that appears during demonstration
export interface Tooltip {
  id: string;
  stepIndex: number; // Which debugger step triggers this tooltip
  content: string;
  anchorLine?: number; // Which line to anchor tooltip to
  position?: "top" | "bottom" | "left" | "right";
  duration?: number; // Auto-hide after milliseconds (optional)
}

// Individual lesson step following EDGE methodology
export interface LessonStep {
  id: string;
  type: LessonStepType;
  title: string;
  content: string;

  // For "demonstrate" steps
  tooltips?: Tooltip[];
  autoPlay?: boolean; // Whether to auto-advance through debugger steps

  // For "guide" steps
  quiz?: QuizQuestion;

  // For "enable" steps
  editableCode?: string; // Code that learner can modify
  hints?: string[];

  // General
  duration?: number; // Expected time to complete step
}

// Individual lesson within a module
export interface Lesson {
  id: string;
  title: string;
  description: string;
  module: string; // Module ID this lesson belongs to
  order: number; // Order within the module

  // Lesson content following EDGE
  steps: LessonStep[];

  // Code execution (similar to Problem)
  code: string;
  entrypoint: string;
  inputs: Record<string, any>;
  special_inputs?: Array<{
    key: string;
    type: string;
    output_key: string;
  }>;

  // Debugger integration
  manualRelationships?: ManualRelationship[];

  // Learning metadata
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number; // Minutes
  prerequisites?: string[]; // Lesson IDs that should be completed first
  tags: string[];

  // Progress tracking
  isCompleted?: boolean;
  completedAt?: Date;
  attemptCount?: number;
  bestScore?: number; // Quiz score percentage
}

// Module containing multiple lessons
export interface Module {
  id: string;
  title: string;
  description: string;
  icon?: string; // Icon name for UI
  order: number; // Order in curriculum

  // Lessons in this module
  lessons: Lesson[];

  // Module metadata
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number; // Total minutes for all lessons
  tags: string[];

  // Progress tracking
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
}

// Complete curriculum structure
export interface Curriculum {
  version: string;
  title: string;
  description: string;
  modules: Module[];

  // Overall progress
  totalLessons: number;
  completedLessons: number;
  overallProgress: number; // Percentage
}

// Lesson session state for active learning
export interface LessonSession {
  lessonId: string;
  currentStepIndex: number;
  startedAt: Date;

  // Quiz tracking
  quizAnswers: Record<string, any>; // Quiz ID -> answer
  quizScores: Record<string, number>; // Quiz ID -> score percentage

  // Code modifications in "enable" steps
  modifiedCode?: string;

  // Progress state
  isCompleted: boolean;
  completedSteps: string[]; // Step IDs
}

// User progress across all lessons
export interface UserProgress {
  userId?: string;
  completedLessons: string[];
  lessonProgress: Record<string, LessonSession>; // Lesson ID -> session
  achievements: string[]; // Achievement IDs
  totalTime: number; // Minutes spent learning
  createdAt: Date;
  updatedAt: Date;
}

// Lesson player state for UI
export interface LessonPlayerState {
  currentLesson: Lesson | null;
  currentModule: Module | null;
  currentStep: LessonStep | null;
  currentStepIndex: number;

  // UI state
  isPlaying: boolean;
  showHints: boolean;
  isEditMode: boolean; // "enable" step editing mode

  // Integration with debugger
  debuggerMode: "lesson" | "free"; // Lesson-guided vs free exploration
  syncWithDebugger: boolean; // Whether to sync step with debugger state
}
