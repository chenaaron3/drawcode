import { useEffect } from "react";

import { useLessonStore } from "@/store/lessonStore";
import { useTraceStore } from "@/store/traceStore";
import { useTutorialStore } from "@/store/tutorialStore";
import { useCheckTerminalContainsAll } from "@/utils/taskChecks";

import content from "./voice-of-the-hero.md?raw";

export function useVoiceOfTheHero(lessonId: string) {
  // Add lesson-specific logic here
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const { traceData } = useTraceStore();
  const { startTutorial } = useTutorialStore();

  const isVictoryOrDeathPrinted = useCheckTerminalContainsAll([
    "Victory or death!",
  ]);
  const isDungeonAwaitsPrinted = useCheckTerminalContainsAll([
    "The dungeon awaits!",
  ]);

  useEffect(() => {
    if (lessonId !== "voice-of-the-hero") return;
    // Start the lesson
    startLesson(lessonId, content, [
      // Check that the user prints "Victory or death!"
      {
        id: "print-victory-or-death",
        title: "Print Greeting",
        description: "Print the greeting `Victory or death!`",
        callback: () => {
          // Show tutorial for the console
          startTutorial([
            {
              id: "terminal-panel",
              title: "Console Output",
              content: "Your print statements will appear here.",
              targetSelector: '[data-tutorial="terminal-panel"]',
              position: "left",
            },
          ]);
        },
      },
      // Print another message The dungeon awaits!
      {
        id: "print-dungeon-awaits",
        title: "Print Another Message",
        description:
          "Add a print statement to print the message `The dungeon awaits!`",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "print-victory-or-death") {
      if (isVictoryOrDeathPrinted) {
        completeTask();
      }
    } else if (currentTask?.id === "print-dungeon-awaits") {
      if (isDungeonAwaitsPrinted) {
        completeTask();
      }
    }
  }, [
    currentTask,
    completeTask,
    traceData,
    isVictoryOrDeathPrinted,
    isDungeonAwaitsPrinted,
  ]);
}
