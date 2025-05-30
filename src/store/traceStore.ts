import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { TraceData, TraceLine } from "../types/trace";
import type { AST } from "../types/ast";

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

  // Input overrides for current problem only
  currentProblemId: string | null;
  inputOverrides: Record<string, any>; // input name -> value for current problem

  // Problems data
  problemsData: any[];
}

interface TraceActions {
  // Setters
  setTraceData: (data: TraceData | null) => void;
  setLine: (lineIndex: number) => void;
  setStep: (stepIndex: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaySpeed: (speed: number) => void;
  setMode: (mode: "line" | "step") => void;
  setAnimatingVariable: (variableName: string | null) => void;
  setIsEvaluating: (isEvaluating: boolean) => void;

  // Actions
  next: () => void; // Unified next function based on mode
  prev: () => void; // Unified prev function based on mode
  nextLine: () => void;
  prevLine: () => void;
  nextStep: () => void; // Step to next expression within line
  prevStep: () => void; // Step to previous expression within line
  reset: () => void;
  togglePlay: () => void;

  // Input override management
  setInputOverride: (inputName: string, value: any) => void;
  clearInputOverrides: () => void;
  getInputOverrides: () => Record<string, any>;

  // Problems data management
  setProblemsData: (problems: any[]) => void;
  getCurrentProblemData: (problemId: string) => any;
  setCurrentProblem: (problemId: string) => void;
  getCurrentProblemId: () => string | null;

  // Helpers
  hasNext: () => boolean; // Check if there are more steps available
}

type TraceStore = TraceState & TraceActions;

const initialState: TraceState = {
  traceData: null,
  lineIndex: 0,
  stepIndex: 0,
  isPlaying: false,
  playSpeed: 1000,
  maxLine: 0,
  nodeLookup: new Map(),
  mode: "step",
  animatingVariable: null,
  isEvaluating: false,
  currentProblemId: null,
  inputOverrides: {},
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
        state.stepIndex = 0;
        state.isPlaying = false;
        // Build node lookup when setting new trace data
        if (data?.ast) {
          state.nodeLookup = buildNodeLookup(data.ast);
        } else {
          state.nodeLookup = new Map();
        }
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

    next: () =>
      set((state) => {
        if (state.mode === "line") {
          if (state.lineIndex < state.maxLine) {
            state.lineIndex += 1;
            state.stepIndex = 0;
          } else {
            // At the end of trace, stop playing
            state.isPlaying = false;
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
          if (state.lineIndex > 0) {
            state.lineIndex -= 1;
            state.stepIndex = 0;
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
      }),

    clearInputOverrides: () =>
      set((state) => {
        state.inputOverrides = {};
      }),

    getInputOverrides: () => {
      const state = get();
      return state.inputOverrides;
    },

    setProblemsData: (problems) =>
      set((state) => {
        state.problemsData = problems;
      }),

    getCurrentProblemData: (problemId) => {
      const state = get();
      return state.problemsData.find((problem) => problem.id === problemId);
    },

    hasNext: () => {
      const state = get();
      if (state.mode === "line") {
        return state.lineIndex < state.maxLine;
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
  }))
);

// Selectors
export const selectCurrentLine = (state: TraceState): TraceLine | null =>
  state.traceData?.trace[state.lineIndex] ?? null;
