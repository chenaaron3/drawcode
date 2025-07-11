import { useEffect, useRef } from 'react';

import { selectCurrentLine, useTraceStore } from '@/store/traceStore';

import { useAugmentedSteps } from './useAugmentedSteps';
import useTerminalOutput from './useTerminalOutput';

export function useSoundEffects() {
  // Subscribe to both lineIndex and stepIndex
  const lineIndex = useTraceStore((state) => state.lineIndex);
  const stepIndex = useTraceStore((state) => state.stepIndex);
  const currentLine = useTraceStore(selectCurrentLine);
  const steps = useAugmentedSteps();

  // Ref to hold the audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (lineIndex == 0 && stepIndex == 0) {
      return;
    }
    // Play the tick sound
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/tap.wav");
    }
    // Set volume to 30% before playing
    audioRef.current.volume = 0.1;
    // Always reset to start for rapid playback
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  }, [lineIndex, stepIndex]);

  const { hasOutputChanged } = useTerminalOutput();
  useEffect(() => {
    if (hasOutputChanged) {
      const audio = new Audio("/audio/beep.wav");
      audio.volume = 0.3;
      audio.play();
    }
  }, [hasOutputChanged]);

  useEffect(() => {
    if (steps == null) {
      return;
    }
    const currentStep = steps[stepIndex];
    if (currentStep == undefined) {
      return;
    }
    const firstStep = steps[0];
    if (firstStep == undefined) {
      return;
    }
    const is_last_step = stepIndex === steps.length - 1;
    const is_if_statement = firstStep.ast?.type === "If";
    if (is_last_step && is_if_statement && currentStep.value !== undefined) {
      if (currentStep.value) {
        const audio = new Audio("/audio/success.wav");
        audio.volume = 0.3;
        audio.play();
      } else {
        const audio = new Audio("/audio/nope.mp3");
        audio.volume = 1;
        audio.play();
      }
    }
  }, [currentLine, stepIndex]);
}
