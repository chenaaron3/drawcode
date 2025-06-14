import { useEffect } from "react";

import { useLessonStore } from "@/store/lessonStore";
import { useTraceFinished } from "@/utils/taskChecks";

import content from "./boolean-introduction.md?raw";

export function useBooleanIntroduction(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const traceFinished = useTraceFinished();

  useEffect(() => {
    if (lessonId !== "boolean-introduction") return;
    startLesson(lessonId, content, [
      {
        id: "assign-boolean",
        title: "Assign Boolean values",
        description: "Assign boolean values to the variables",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "assign-boolean") {
      if (traceFinished) {
        completeTask();
      }
    }
  }, [currentTask, completeTask, traceFinished]);
}