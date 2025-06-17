import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll } from '@/utils/taskChecks';

import content from './list-methods.md';

export function useListMethods(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const task1Complete = useTerminalContainsAll(["[1, 2, 3, 4, 5]"]);
  const task2Complete = useTerminalContainsAll(["[1, 2, 3, 4]"]);

  useEffect(() => {
    if (lessonId !== "list-methods") return;
    startLesson(lessonId, content, [
      {
        id: "append-method",
        title: "Use Append Method",
        description:
          "Use the .append() method to add an element to the end of the list.",
      },
      {
        id: "remove-method",
        title: "Use Remove Method",
        description:
          "Use the .remove() method to remove an element from the list.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "append-method" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "remove-method" && task2Complete) {
      completeTask();
    }
  }, [currentTask, task1Complete, task2Complete, completeTask]);
}
