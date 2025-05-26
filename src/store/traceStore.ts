import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type {
  AugmentedTraceStep,
  TraceData,
  TraceLine,
  TraceStep,
} from "../types/trace";
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
  line: number;
  stepIndex: number; // Index within the current line's steps
  isPlaying: boolean;
  playSpeed: number;
  maxLine: number;
  nodeLookup: Map<number, AST>; // Lookup map for AST nodes by ID
}

interface TraceActions {
  // Setters
  setTraceData: (data: TraceData | null) => void;
  setLine: (line: number) => void;
  setStepIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaySpeed: (speed: number) => void;

  // Actions
  next: () => void;
  prev: () => void;
  nextExpression: () => void; // Step to next expression within line
  prevExpression: () => void; // Step to previous expression within line
  reset: () => void;
  togglePlay: () => void;
}

type TraceStore = TraceState & TraceActions;

const initialState: TraceState = {
  traceData: null,
  line: 0,
  stepIndex: 0,
  isPlaying: false,
  playSpeed: 1000,
  maxLine: 0,
  nodeLookup: new Map(),
};

export const useTraceStore = create<TraceStore>()(
  immer((set) => ({
    ...initialState,

    setTraceData: (data) =>
      set((state) => {
        state.traceData = data;
        state.maxLine = data?.trace.length ? data.trace.length - 1 : 0;
        // Build node lookup when setting new trace data
        if (data?.ast) {
          state.nodeLookup = buildNodeLookup(data.ast);
        } else {
          state.nodeLookup = new Map();
        }
      }),

    setLine: (line) =>
      set((state) => {
        state.line = line;
        // Reset step index when changing lines
        state.stepIndex = 0;
      }),

    setStepIndex: (index) =>
      set((state) => {
        state.stepIndex = index;
      }),

    setIsPlaying: (isPlaying) =>
      set((state) => {
        state.isPlaying = isPlaying;
      }),

    setPlaySpeed: (speed) =>
      set((state) => {
        state.playSpeed = speed;
      }),

    next: () =>
      set((state) => {
        if (!state.isPlaying && state.line < state.maxLine) {
          state.line += 1;
          state.stepIndex = 0;
        }
      }),

    prev: () =>
      set((state) => {
        if (!state.isPlaying && state.line > 0) {
          state.line -= 1;
          state.stepIndex = 0;
        }
      }),

    nextExpression: () =>
      set((state) => {
        const currentSteps = state.traceData?.trace[state.line]?.steps;
        if (
          !state.isPlaying &&
          currentSteps &&
          state.stepIndex < currentSteps.length - 1
        ) {
          state.stepIndex += 1;
        } else if (!state.isPlaying && state.line < state.maxLine) {
          // Move to next line if at end of current line's steps
          state.line += 1;
          state.stepIndex = 0;
        }
      }),

    prevExpression: () =>
      set((state) => {
        if (!state.isPlaying && state.stepIndex > 0) {
          state.stepIndex -= 1;
        } else if (!state.isPlaying && state.line > 0) {
          // Move to previous line if at start of current line's steps
          state.line -= 1;
          const prevSteps = state.traceData?.trace[state.line]?.steps;
          state.stepIndex = prevSteps ? prevSteps.length - 1 : 0;
        }
      }),

    reset: () =>
      set((state) => {
        if (!state.isPlaying) {
          state.line = 0;
          state.stepIndex = 0;
        }
      }),

    togglePlay: () =>
      set((state) => {
        if (state.line < state.maxLine || !state.isPlaying) {
          state.isPlaying = !state.isPlaying;
        }
      }),
  }))
);

// Selectors
export const selectCurrentLine = (state: TraceState): TraceLine | null =>
  state.traceData?.trace[state.line] ?? null;

export const selectCurrentSteps = (
  state: TraceState
): AugmentedTraceStep[] | null => {
  debugger;
  // Join the steps of the current line with the ast lookup
  const currentLine = state.traceData?.trace[state.line];
  if (!currentLine?.steps) return null;

  return currentLine.steps.map((step) => ({
    ...step,
    ast: state.nodeLookup.get(step.node_id)!,
  }));
};
