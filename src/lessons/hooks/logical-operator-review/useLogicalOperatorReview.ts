import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll } from '@/utils/taskChecks';

import content from './logical-operator-review.md';

export function useLogicalOperatorReview(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const taskComplete = useTerminalContainsAll(["Your weight:", "433.9"]);

  useEffect(() => {
    if (lessonId !== "logical-operator-review") return;
    startLesson(lessonId, content, [
      {
        id: "calculate-weight",
        title: "Calculate Weight on Planet",
        description:
          "Write a program that calculates Codey’s weight on a different planet using logical operators.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "calculate-weight" && taskComplete) {
      completeTask();
    }
  }, [lessonId, currentTask, taskComplete, completeTask]);
}
