import { useEffect } from "react";

import { useLessonStore } from "@/store/lessonStore";
import {
  useTerminalContainsAll,
} from "@/utils/taskChecks";

import content from "./plus-equals.md?raw";

export function usePlusEquals(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const taskComplete = useTerminalContainsAll(["The total price is 109"]);

  useEffect(() => {
    if (lessonId !== "plus-equals") return;
    startLesson(lessonId, content, [
      {
        id: "update-total-price",
        title: "Update Total Price",
        description: "Use the += operator to update the total_price to include the prices of nice_sweater and fun_books.",
      }
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "update-total-price" && taskComplete) {
      completeTask();
    }
  }, [lessonId, currentTask, taskComplete]);
}