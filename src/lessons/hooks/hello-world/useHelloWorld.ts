import { useEffect } from "react";

import { useLessonStore } from "@/store/lessonStore";
import { useTraceFinished } from "@/utils/taskChecks";

import content from "./hello-world.md?raw";

export function useHelloWorld(lessonId: string) {
  // Add lesson-specific logic here
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const traceFinished = useTraceFinished();

  useEffect(() => {
    if (lessonId !== "hello-world") return;
    // Start the lesson
    startLesson(lessonId, content, [
      {
        id: "run-program",
        title: "Run the program",
        description: "Run the program to see the output",
      },
    ]);
  }, [lessonId, startLesson]);

  // Check if the user stepped
  useEffect(() => {
    if (currentTask?.id === "run-program") {
      if (traceFinished) {
        completeTask();
      }
    }
  }, [currentTask, completeTask, traceFinished]);
}
