import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { AVAILABLE_PROBLEM_IDS } from '@/data/traces';

import type { TraceData, TraceLine } from "@/types/trace";
import type { AST } from "@/types/ast";
import type { Problem } from "@/types/problem";
// Helper to build node ID lookup
function buildNodeLookup(ast: AST): Map<number, AST> {
  const lookup = new Map<number, AST>();

  function traverse(node: AST) {
    if (!node || typeof node !== "object") return;

    // Add this node to lookup if it has a node_id
    if ("node_id" in node) {
      lookup.set(node.node_id, node);
    }

    // Traverse all object properties
    for (const key in node) {
      const value = node[key];
      if (Array.isArray(value)) {
        value.forEach((item) => traverse(item));
      } else if (value && typeof value === "object") {
        traverse(value);
      }
    }
  }

  traverse(ast);
  return lookup;
}

interface TraceState {
  // Data
  traceData: TraceData | null;
  lineIndex: number;
  maxLine: number;
  stepIndex: number; // Index within the current line's steps
  isPlaying: boolean;
  playSpeed: number;
  nodeLookup: Map<number, AST>; // Lookup map for AST nodes by ID
  mode: "line" | "step"; // Navigation mode

  // Animation state
  animatingVariable: string | null;
  isEvaluating: boolean; // True during before_expression, false during after_expression

  // UI state
  currentTab: "learn" | "practice" | "playground"; // Current navigation tab

  // Input overrides for current problem only
  currentProblemId: string | null;
  inputOverrides: Record<string, any>; // input name -> value for current problem

  // Code editing state
  originalCode: string | null; // Original code from trace data
  currentCode: string | null; // Currently edited code
  originalInputs: Record<string, any>; // Original inputs from trace data
  hasChanges: boolean; // Whether there are unsaved changes

  // Error state
  currentError: {
    message: string;
    type: "validation" | "general";
    invalidField?: string;
  } | null;

  // Problems data
  problemsData: Problem[];
}

interface TraceActions {
  // Navigation
  setTraceData: (data: TraceData) => void;
  setLine: (lineIndex: number) => void;
  setStep: (stepIndex: number) => void;
  next: () => void;
  prev: () => void;
  nextLine: () => void;
  prevLine: () => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  togglePlay: () => void;
  hasNext: () => boolean;
  hasPrev: () => boolean;

  // Playback
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaySpeed: (speed: number) => void;
  setMode: (mode: "line" | "step") => void;

  // Animation
  setAnimatingVariable: (variableName: string | null) => void;
  setIsEvaluating: (isEvaluating: boolean) => void;

  // UI state
  setCurrentTab: (tab: "learn" | "practice" | "playground") => void;

  // Problems
  setCurrentProblem: (problemId: string | null) => void;
  getCurrentProblemId: () => string | null;
  getCurrentProblemData: (problemId: string) => Problem | undefined;
  setProblemsData: (data: Problem[]) => void;
  getAllProblems: () => Problem[];

  // Input management
  setInputOverride: (inputName: string, value: any) => void;
  clearInputOverrides: () => void;
  getInputOverrides: () => Record<string, any>;

  // Error management
  setValidationError: (
    error: { message: string; invalidField: string } | null,
  ) => void;
  setGeneralError: (message: string) => void;
  clearError: () => void;

  // Code editing and change detection
  setCurrentCode: (code: string) => void;
  resetToOriginal: () => void;
  updateHasChanges: () => void;
  getOriginalInputs: () => Record<string, any>;
  getCurrentInputs: () => Record<string, any>;
}

type TraceStore = TraceState & TraceActions;

const initialState: TraceState = {
  traceData: null,
  lineIndex: 0,
  stepIndex: 0,
  isPlaying: false,
  playSpeed: 250,
  maxLine: 0,
  nodeLookup: new Map(),
  mode: "line",
  animatingVariable: null,
  isEvaluating: false,
  currentTab: "learn",
  currentProblemId: null,
  inputOverrides: {},
  originalCode: null,
  currentCode: null,
  originalInputs: {},
  hasChanges: false,
  currentError: null,
  problemsData: [],
};

export const useTraceStore = create<TraceStore>()(
  immer((set, get) => ({
    ...initialState,

    setTraceData: (data) =>
      set((state) => {
        state.traceData = data;
        state.maxLine = data?.trace.length ? data.trace.length - 1 : 0;
        state.lineIndex = 0;
        // Start at step 0 (first step of first line)
        state.stepIndex = 0;
        state.isPlaying = false;

        // Build node lookup when setting new trace data
        if (data?.ast) {
          state.nodeLookup = buildNodeLookup(data.ast);
        } else {
          state.nodeLookup = new Map();
        }

        // Initialize code editing state
        state.originalCode = data?.metadata.code || null;
        state.currentCode = data?.metadata.code || null;
        state.originalInputs = data?.metadata.inputs.kwargs || {};
        state.hasChanges = false;
      }),

    setLine: (lineIndex) =>
      set((state) => {
        state.lineIndex = lineIndex;
        // Reset step index when changing lines
        state.stepIndex = 0;
      }),

    setStep: (stepIndex) =>
      set((state) => {
        state.stepIndex = stepIndex;
      }),

    setIsPlaying: (isPlaying) =>
      set((state) => {
        state.isPlaying = isPlaying;
      }),

    setPlaySpeed: (speed) =>
      set((state) => {
        state.playSpeed = speed;
      }),

    setMode: (mode) =>
      set((state) => {
        state.mode = mode;
      }),

    setAnimatingVariable: (variableName) =>
      set((state) => {
        state.animatingVariable = variableName;
      }),

    setIsEvaluating: (isEvaluating) =>
      set((state) => {
        state.isEvaluating = isEvaluating;
      }),

    setCurrentTab: (tab) =>
      set((state) => {
        state.currentTab = tab;
      }),

    next: () =>
      set((state) => {
        if (state.mode === "line") {
          if (state.lineIndex < state.maxLine) {
            state.lineIndex += 1;
            state.stepIndex = 0;
          } else {
            // On the last line, step through remaining steps if any
            const currentSteps = state.traceData?.trace[state.lineIndex]?.steps;
            if (currentSteps && state.stepIndex < currentSteps.length - 1) {
              // Step to the end of the line
              state.stepIndex = currentSteps.length - 1;
            } else {
              // At the end of trace, stop playing
              state.isPlaying = false;
            }
          }
        } else if (state.mode === "step") {
          const currentSteps = state.traceData?.trace[state.lineIndex]?.steps;
          if (currentSteps && state.stepIndex < currentSteps.length - 1) {
            state.stepIndex += 1;
          } else if (state.lineIndex < state.maxLine) {
            // Move to next line if at end of current line's steps
            state.lineIndex += 1;
            state.stepIndex = 0;
          } else {
            // At the end of trace, stop playing
            state.isPlaying = false;
          }
        }
      }),

    prev: () =>
      set((state) => {
        if (state.mode === "line") {
          if (state.stepIndex > 0) {
            state.stepIndex = 0;
          } else if (state.lineIndex > 0) {
            state.lineIndex -= 1;
          }
        } else if (state.mode === "step") {
          if (state.stepIndex > 0) {
            state.stepIndex -= 1;
          } else if (state.lineIndex > 0) {
            // Move to previous line if at start of current line's steps
            state.lineIndex -= 1;
            const prevSteps = state.traceData?.trace[state.lineIndex]?.steps;
            state.stepIndex = prevSteps ? prevSteps.length - 1 : 0;
          }
        }
      }),

    nextLine: () =>
      set((state) => {
        if (state.lineIndex < state.maxLine) {
          state.lineIndex += 1;
          state.stepIndex = 0;
        }
      }),

    prevLine: () =>
      set((state) => {
        if (state.lineIndex > 0) {
          state.lineIndex -= 1;
          state.stepIndex = 0;
        }
      }),

    nextStep: () =>
      set((state) => {
        const currentSteps = state.traceData?.trace[state.lineIndex]?.steps;
        if (currentSteps && state.stepIndex < currentSteps.length - 1) {
          state.stepIndex += 1;
        } else if (state.lineIndex < state.maxLine) {
          // Move to next line if at end of current line's steps
          state.lineIndex += 1;
          state.stepIndex = 0;
        }
      }),

    prevStep: () =>
      set((state) => {
        if (state.stepIndex > 0) {
          state.stepIndex -= 1;
        } else if (state.lineIndex > 0) {
          // Move to previous line if at start of current line's steps
          state.lineIndex -= 1;
          const prevSteps = state.traceData?.trace[state.lineIndex]?.steps;
          state.stepIndex = prevSteps ? prevSteps.length - 1 : 0;
        }
      }),

    reset: () =>
      set((state) => {
        if (!state.isPlaying) {
          state.lineIndex = 0;
          state.stepIndex = 0;
        }
      }),

    togglePlay: () =>
      set((state) => {
        if (state.lineIndex < state.maxLine || !state.isPlaying) {
          state.isPlaying = !state.isPlaying;
        }
      }),

    setCurrentProblem: (problemId) =>
      set((state) => {
        state.currentProblemId = problemId;
        state.inputOverrides = {};
      }),

    getCurrentProblemId: () => {
      const state = get();
      return state.currentProblemId;
    },

    setInputOverride: (inputName, value) =>
      set((state) => {
        state.inputOverrides[inputName] = value;
        // Update hasChanges whenever inputs change
        const codeChanged = state.currentCode !== state.originalCode;
        const inputsChanged =
          JSON.stringify(state.inputOverrides) !== JSON.stringify({});
        state.hasChanges = codeChanged || inputsChanged;
      }),

    clearInputOverrides: () =>
      set((state) => {
        state.inputOverrides = {};
      }),

    getInputOverrides: () => {
      const state = get();
      return state.inputOverrides;
    },

    setValidationError: (error) =>
      set((state) => {
        if (error) {
          state.currentError = {
            message: error.message,
            type: "validation",
            invalidField: error.invalidField,
          };
        } else {
          state.currentError = null;
        }
      }),

    setGeneralError: (message) =>
      set((state) => {
        state.currentError = {
          message,
          type: "general",
        };
      }),

    clearError: () =>
      set((state) => {
        state.currentError = null;
      }),

    setProblemsData: (problems) =>
      set((state) => {
        state.problemsData = problems;
      }),

    getAllProblems: () => {
      const state = get();
      // Fitler based on AVAILABLE_PROBLEM_IDS, sort based by problem number
      return state.problemsData
        .filter((problem) => AVAILABLE_PROBLEM_IDS.includes(problem.id))
        .sort((a, b) => a.number - b.number);
    },

    getCurrentProblemData: (problemId) => {
      const state = get();
      return state.problemsData.find((problem) => problem.id === problemId);
    },

    hasNext: () => {
      const state = get();
      if (state.mode === "line") {
        // If not on the last line, we can always go to next line
        if (state.lineIndex < state.maxLine) {
          return true;
        }
        // If on the last line, check if there are more steps on this line
        const currentSteps = state.traceData?.trace[state.lineIndex]?.steps;
        return !!(currentSteps && state.stepIndex < currentSteps.length - 1);
      } else if (state.mode === "step") {
        const currentSteps = state.traceData?.trace[state.lineIndex]?.steps;
        if (currentSteps && state.stepIndex < currentSteps.length - 1) {
          return true;
        }
        // Check if we can move to next line
        return state.lineIndex < state.maxLine;
      }
      return false;
    },

    hasPrev: () => {
      const state = get();
      if (state.mode === "line") {
        return state.lineIndex > 0 || state.stepIndex > 0;
      } else if (state.mode === "step") {
        // Check if we can move to previous step within current line
        if (state.stepIndex > 0) {
          return true;
        }
        // Check if we can move to previous line
        return state.lineIndex > 0;
      }
      return false;
    },

    setCurrentCode: (code) =>
      set((state) => {
        state.currentCode = code;
        // Update hasChanges whenever code changes
        const codeChanged = state.currentCode !== state.originalCode;
        const inputsChanged =
          JSON.stringify(state.inputOverrides) !== JSON.stringify({});
        state.hasChanges = codeChanged || inputsChanged;
      }),

    resetToOriginal: () =>
      set((state) => {
        state.currentCode = state.originalCode;
        state.inputOverrides = {};
        state.hasChanges = false;
      }),

    updateHasChanges: () =>
      set((state) => {
        const codeChanged = state.currentCode !== state.originalCode;
        const inputsChanged =
          JSON.stringify(state.inputOverrides) !== JSON.stringify({});
        state.hasChanges = codeChanged || inputsChanged;
      }),

    getOriginalInputs: () => {
      const state = get();
      return state.originalInputs;
    },

    getCurrentInputs: () => {
      const state = get();
      return state.inputOverrides;
    },
  })),
);

// Selectors
export const selectCurrentLine = (state: TraceState): TraceLine | null => {
  return state.traceData?.trace[state.lineIndex] ?? null;
};
