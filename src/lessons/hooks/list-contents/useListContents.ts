import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useVariablesDefined } from '@/utils/taskChecks';

import content from './list-contents.md';

export function useListContents(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const task1Complete = useVariablesDefined({
    ints_and_strings: [1, 2, 3, "four", "five", "Six"],
  });
  const task2Complete = useVariablesDefined({
    sam_height_and_testscore: ["Sam", 67, 85.5, true],
  });

  useEffect(() => {
    if (lessonId !== "list-contents") return;
    startLesson(lessonId, content, [
      {
        id: "add-string-to-list",
        title: "Add String to List",
        description:
          "Add any additional string to the end of the list ints_and_strings.",
      },
      {
        id: "create-sam-list",
        title: "Create Sam's Details List",
        description:
          "Create a new list called sam_height_and_testscore with the specified elements.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "add-string-to-list" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "create-sam-list" && task2Complete) {
      completeTask();
    }
  }, [lessonId, currentTask, task1Complete, task2Complete, completeTask]);
}
