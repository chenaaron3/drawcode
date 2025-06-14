import { useEffect } from "react";

import { useLessonStore } from "@/store/lessonStore";
import { useTraceStore } from "@/store/traceStore";
import { useTutorialStore } from "@/store/tutorialStore";

import meetYourHero from "./meet-your-hero.md?raw";

export function useMeetYourHero(lessonId: string) {
  const { startLesson, addTask, completeTask, currentTask } = useLessonStore();
  const { hasNext, traceData } = useTraceStore();
  const { startTutorial } = useTutorialStore();

  const finishedtrace = !hasNext();

  useEffect(() => {
    if (lessonId !== "meet-your-hero") return;

    const initializeLesson = async () => {
      // Start the lesson
      startLesson(lessonId, meetYourHero, [
        {
          id: "run-initial-code",
          title: "Take Your First Step",
          description: `Click the Forward Button ⏩️ to step through the code line by line.  
  You can also click the Play Button ▶️ to automatically step through the code.`,
          callback: () => {},
        },
        {
          id: "change-hero-name",
          title: "Change The Hero's Name",
          description:
            "Update `Xaden` to your name. Run the code again and see what happens!",
          callback: () => {},
        },
      ]);
    };
    initializeLesson();
  }, [lessonId, startLesson, addTask, startTutorial]);

  // Check if the user stepped
  useEffect(() => {
    if (currentTask?.id === "run-initial-code") {
      if (finishedtrace) {
        completeTask();
      }
    } else if (currentTask?.id === "change-hero-name") {
      if (
        finishedtrace &&
        traceData?.metadata.finalLocals["hero_name"] !== "Xaden"
      ) {
        completeTask();
      }
    }
  }, [currentTask, completeTask, finishedtrace]);
}
