import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { TraceData, TraceEntry } from "../types/trace";

interface TraceState {
  // Data
  traceData: TraceData | null;
  step: number;
  isPlaying: boolean;
  playSpeed: number;
  maxStep: number;
}

interface TraceActions {
  // Setters
  setTraceData: (data: TraceData | null) => void;
  setStep: (step: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaySpeed: (speed: number) => void;

  // Actions
  next: () => void;
  prev: () => void;
  reset: () => void;
  togglePlay: () => void;
}

type TraceStore = TraceState & TraceActions;

const initialState: TraceState = {
  traceData: null,
  step: 0,
  isPlaying: false,
  playSpeed: 1000,
  maxStep: 0,
};

export const useTraceStore = create<TraceStore>()(
  immer((set) => ({
    ...initialState,

    setTraceData: (data) =>
      set((state) => {
        state.traceData = data;
        state.maxStep = data?.trace.length ? data.trace.length - 1 : 0;
      }),

    setStep: (step) =>
      set((state) => {
        state.step = step;
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
        }
      }),

    prev: () =>
      set((state) => {
        if (!state.isPlaying && state.step > 0) {
          state.step -= 1;
        }
      }),

    reset: () =>
      set((state) => {
        if (!state.isPlaying) {
          state.step = 0;
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
export const selectCurrent = (state: TraceState): TraceEntry | null =>
  state.traceData?.trace[state.step] ?? null;
