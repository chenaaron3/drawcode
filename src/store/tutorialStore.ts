import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { TutorialStep } from "@/types/tutorial";

interface TutorialState {
  isActive: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  hasSeenTutorial: Record<string, boolean>;
  startTutorial: (tutorialSteps?: TutorialStep[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  advertiseTutorial: (page: string) => void;
  completeTutorial: () => void;
}

const sandboxTutorial: TutorialStep[] = [
  {
    id: "sandbox",
    title: "Sandbox mode",
    content:
      "This is the sandbox mode where you can experiment with your code.",
    targetSelector: '[data-tutorial="logo"]',
    position: "right",
  },
  {
    id: "share",
    title: "Share your code",
    content:
      "You can share your code with others by clicking the share button.",
    targetSelector: '[data-tutorial="settings-button"]',
    position: "right",
  },
];

const lessonTutorial: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Python Quest! 🎉",
    content:
      "Python Quest helps you learn programming by watching code come to life. Think of it like watching a movie of your code, step by step!",
    targetSelector: '[data-tutorial="logo"]',
    position: "right",
  },
  {
    id: "code-panel",
    title: "The Code Window",
    content:
      "This is where the magic happens! Here you can see the Python code that tells the computer what to do. Don't worry if it looks confusing at first.",
    targetSelector: '[data-tutorial="code-panel"]',
    position: "left",
  },
  {
    id: "step-controls",
    title: "Control Time ⏯️",
    content:
      "These buttons let you step through your code like a video player. You can go forward, backward, or play it automatically to see what happens.",
    targetSelector: '[data-tutorial="step-controls"]',
    position: "left",
  },
  {
    id: "variables-panel",
    title: "The Computer's Memory 🧠",
    content:
      'This shows what the computer is "thinking" - all the information it\'s storing and working with. Watch how values change as code runs!',
    targetSelector: '[data-tutorial="variables-panel"]',
    position: "top",
  },
  {
    id: "console-panel",
    title: "Console Output",
    content: "This shows what the program is printing to the console.",
    targetSelector: '[data-tutorial="terminal-panel"]',
    position: "bottom",
  },
];

const tutorialMapping = {
  sandbox: sandboxTutorial,
  lesson: lessonTutorial,
};

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentStepIndex: 0,
      steps: [],
      hasSeenTutorial: {},

      startTutorial: (tutorialSteps: TutorialStep[] = []) => {
        set({
          isActive: true,
          currentStepIndex: 0,
          steps: tutorialSteps,
        });
      },

      nextStep: () => {
        const { currentStepIndex, steps } = get();
        if (currentStepIndex < steps.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        } else {
          get().completeTutorial();
        }
      },

      previousStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 });
        }
      },

      skipTutorial: () => {
        set({
          isActive: false,
        });
      },

      advertiseTutorial: (page: string) => {
        const { hasSeenTutorial } = get();
        const tutorialSteps =
          tutorialMapping[page as keyof typeof tutorialMapping];

        if (tutorialSteps && !hasSeenTutorial[page]) {
          set({
            isActive: true,
            currentStepIndex: 0,
            steps: tutorialSteps,
            hasSeenTutorial: {
              ...hasSeenTutorial,
              [page]: true,
            },
          });
        }
      },

      completeTutorial: () => {
        set({
          isActive: false,
        });
      },
    }),
    {
      name: "tutorial-storage",
      partialize: (state) => ({
        hasSeenTutorial: state.hasSeenTutorial,
      }),
    },
  ),
);
