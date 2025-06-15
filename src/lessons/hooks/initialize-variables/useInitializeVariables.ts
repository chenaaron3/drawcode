import { useEffect } from "react";

import { useLessonStore } from "@/store/lessonStore";
import { useTraceFinished } from "@/utils/taskChecks";

import content from "./initialize-variables.md?raw";

export function useInitializeVariables(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const traceFinished = useTraceFinished();

  useEffect(() => {
    if (lessonId !== "initialize-variables") return;
    // Start the lesson
    startLesson(lessonId, content, [
      {
        id: "initialize-attributes",
        title: "Initialize the attributes",
        description:
          "Set `level` to 5, `strength` to 42.1, and `role` to 'Warrior'",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "initialize-attributes") {
      if (traceFinished) {
        completeTask();
      }
    }
  }, [currentTask, completeTask, traceFinished]);
}
