import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { parseTraceAST } from '../utils/astParser';

import type { TraceData, TraceEntry, TraceStep } from "../types/trace";
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
  step: number;
  stepIndex: number; // Index within the current line's steps
  isPlaying: boolean;
  playSpeed: number;
  maxStep: number;
  maxStepIndex: number; // Max index within current line's steps
  nodeLookup: Map<number, AST>; // Lookup map for AST nodes by ID
}

interface TraceActions {
  // Setters
  setTraceData: (data: TraceData | null) => void;
  setStep: (step: number) => void;
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
  step: 0,
  stepIndex: 0,
  isPlaying: false,
  playSpeed: 1000,
  maxStep: 0,
  maxStepIndex: 0,
  nodeLookup: new Map(),
};

export const useTraceStore = create<TraceStore>()(
  immer((set) => ({
    ...initialState,

    setTraceData: (data) =>
      set((state) => {
        state.traceData = data;
        state.maxStep = data?.trace.length ? data.trace.length - 1 : 0;
        state.maxStepIndex = data?.trace[0]?.steps.length
          ? data.trace[0].steps.length - 1
          : 0;
        // Build node lookup when setting new trace data
        if (data?.ast) {
          state.nodeLookup = buildNodeLookup(data.ast);
        } else {
          state.nodeLookup = new Map();
        }
      }),

    setStep: (step) =>
      set((state) => {
        state.step = step;
        // Reset step index when changing lines
        state.stepIndex = 0;
        state.maxStepIndex = state.traceData?.trace[step]?.steps.length
          ? state.traceData.trace[step].steps.length - 1
          : 0;
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
        if (!state.isPlaying && state.step < state.maxStep) {
          state.step += 1;
          state.stepIndex = 0;
          state.maxStepIndex = state.traceData?.trace[state.step]?.steps.length
            ? state.traceData.trace[state.step].steps.length - 1
            : 0;
        }
      }),

    prev: () =>
      set((state) => {
        if (!state.isPlaying && state.step > 0) {
          state.step -= 1;
          state.stepIndex = 0;
          state.maxStepIndex = state.traceData?.trace[state.step]?.steps.length
            ? state.traceData.trace[state.step].steps.length - 1
            : 0;
        }
      }),

    nextExpression: () =>
      set((state) => {
        if (!state.isPlaying && state.stepIndex < state.maxStepIndex) {
          state.stepIndex += 1;
        } else if (!state.isPlaying && state.step < state.maxStep) {
          // Move to next line if at end of current line's steps
          state.step += 1;
          state.stepIndex = 0;
          state.maxStepIndex = state.traceData?.trace[state.step]?.steps.length
            ? state.traceData.trace[state.step].steps.length - 1
            : 0;
        }
      }),

    prevExpression: () =>
      set((state) => {
        if (!state.isPlaying && state.stepIndex > 0) {
          state.stepIndex -= 1;
        } else if (!state.isPlaying && state.step > 0) {
          // Move to previous line if at start of current line's steps
          state.step -= 1;
          state.maxStepIndex = state.traceData?.trace[state.step]?.steps.length
            ? state.traceData.trace[state.step].steps.length - 1
            : 0;
          state.stepIndex = state.maxStepIndex;
        }
      }),

    reset: () =>
      set((state) => {
        if (!state.isPlaying) {
          state.step = 0;
          state.stepIndex = 0;
          state.maxStepIndex = state.traceData?.trace[0]?.steps.length
            ? state.traceData.trace[0].steps.length - 1
            : 0;
        }
      }),

    togglePlay: () =>
      set((state) => {
        if (state.step < state.maxStep || !state.isPlaying) {
          state.isPlaying = !state.isPlaying;
        }
      }),
  }))
);

// Selectors
export const selectCurrentLine = (state: TraceState): TraceEntry | null =>
  state.traceData?.trace[state.step] ?? null;

export const selectCurrentStep = (state: TraceState): TraceStep | null =>
  state.traceData?.trace[state.step]?.steps[state.stepIndex] ?? null;

export const selectAST = (state: TraceState): AST | null => {
  const currentStep = selectCurrentStep(state);
  if (currentStep?.node_id !== undefined) {
    return state.nodeLookup.get(currentStep.node_id) ?? null;
  }
  return null;
};
