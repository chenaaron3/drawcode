import { create } from "zustand";

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetSelector: string;
  position: "top" | "bottom" | "left" | "right";
  action?: string; // Optional action description
  highlight?: {
    padding?: number;
    borderRadius?: number;
  };
}

interface TutorialState {
  isActive: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  hasSeenTutorial: boolean;
  startTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
}

const tutorialSteps: TutorialStep[] = [
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
    position: "bottom",
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
];

export const useTutorialStore = create<TutorialState>((set, get) => ({
  isActive: false,
  currentStepIndex: 0,
  steps: tutorialSteps,
  hasSeenTutorial: localStorage.getItem("pythonquest-tutorial-seen") === "true",

  startTutorial: () => {
    set({
      isActive: true,
      currentStepIndex: 0,
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
      hasSeenTutorial: true,
    });
    localStorage.setItem("pythonquest-tutorial-seen", "true");
  },

  completeTutorial: () => {
    set({
      isActive: false,
      hasSeenTutorial: true,
    });
    localStorage.setItem("pythonquest-tutorial-seen", "true");
  },
}));
