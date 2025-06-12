import { useEffect } from "react";

import { useLessonStore } from "@/store/lessonStore";
import { useTraceStore } from "@/store/traceStore";
import { useTutorialStore } from "@/store/tutorialStore";

import meetYourHero from "./meet-your-hero.md?raw";

export function useMeetYourHero(lessonId: string) {
  const { setContent, startLesson, addTask, completeTask, currentTask } =
    useLessonStore();
  const { hasNext, traceData } = useTraceStore();
  const { startTutorial } = useTutorialStore();

  const finishedtrace = !hasNext();

  useEffect(() => {
    if (lessonId !== "meet-your-hero") return;

    const initializeLesson = async () => {
      // Start the lesson
      startLesson(lessonId);
      // Set the content
      setContent(meetYourHero);

      // Add initial tasks
      addTask({
        id: "run-initial-code",
        title: "Take Your First Step",
        description: "Click the Forward Button ⏩️ to step through the code",
        callback: () => {},
      });
      addTask({
        id: "change-hero-name",
        title: "Change The Hero's Name",
        description:
          "Update `hero_name` to your name. Run the code again and see what happens!",
        callback: () => {},
      });
    };
    initializeLesson();
  }, [lessonId, setContent, startLesson, addTask, startTutorial]);

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
