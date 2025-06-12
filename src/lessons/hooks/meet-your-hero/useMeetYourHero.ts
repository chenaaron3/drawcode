import { useEffect } from "react";

import { useLessonStore } from "@/store/lessonStore";
import { useTraceStore } from "@/store/traceStore";
import { useTutorialStore } from "@/store/tutorialStore";

import meetYourHero from "./meet-your-hero.md?raw";

import type { LessonHookResult } from "@/types/lesson";
export function useMeetYourHero(lessonId: string): LessonHookResult {
  const { setContent, startLesson, addTask, completeTask, currentTask } =
    useLessonStore();
  const { hasNext } = useTraceStore();
  const { startTutorial } = useTutorialStore();

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
    };
    initializeLesson();
  }, [lessonId, setContent, startLesson, addTask, startTutorial]);

  // Check if the user stepped
  useEffect(() => {
    if (currentTask?.id === "run-initial-code") {
      console.log("hasNext", hasNext());
      if (!hasNext()) {
        completeTask();
      }
    }
  }, [currentTask, completeTask, hasNext()]);

  return {
    isReady: !useLessonStore((state) => state.isLoading),
    error: useLessonStore((state) => state.error),
  };
}
