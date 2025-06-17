import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll, useVariablesDefined } from '@/utils/taskChecks';

import content from './what-is-a-list.md';

export function useWhatIsAList(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();

  const task1Complete = useVariablesDefined({
    heights: [61, 70, 67, 64, 65],
  });

  const task2Complete = useTerminalContainsAll([
    "SyntaxError: invalid syntax",
    "broken_heights = [65, 71, 59, 62]",
  ]);

  useEffect(() => {
    if (lessonId !== "what-is-a-list") return;
    startLesson(lessonId, content, [
      {
        id: "add-height",
        title: "Add Chloe's Height",
        description:
          "Examine the existing list heights. A new student, Chloe, is 65 inches tall. Add Chloe’s height to the end of the list heights.",
      },
      {
        id: "fix-broken-heights",
        title: "Fix Broken Heights List",
        description:
          "Remove the # in front of the definition of the list broken_heights and add commas so that it runs without errors.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "add-height" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "fix-broken-heights" && task2Complete) {
      completeTask();
    }
  }, [lessonId, currentTask, task1Complete, task2Complete, completeTask]);
}
