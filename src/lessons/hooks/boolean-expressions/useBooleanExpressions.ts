import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useVariablesDefined } from '@/utils/taskChecks';

import content from './boolean-expressions.md';

export function useBooleanExpressions(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const task1Complete = useVariablesDefined({ first_statement: "Yes" });
  const task2Complete = useVariablesDefined({ second_statement: "Yes" });
  const task3Complete = useVariablesDefined({ third_statement: "No" });

  useEffect(() => {
    if (lessonId !== "boolean-expressions") return;
    startLesson(lessonId, content, [
      {
        id: "evaluate-earth-statement",
        title: "Evaluate Earth Statement",
        description:
          "Examine the statement about the Earth and determine if it's a Boolean expression.",
      },
      {
        id: "evaluate-moon-statement",
        title: "Evaluate Moon Statement",
        description:
          "Consider the statement about the Moon and determine if it's a Boolean expression.",
      },
      {
        id: "evaluate-ice-cream-statement",
        title: "Evaluate Ice Cream Statement",
        description:
          "Analyze the statement about chocolate ice cream and decide if it's a Boolean expression.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "evaluate-earth-statement" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "evaluate-moon-statement" && task2Complete) {
      completeTask();
    }
    if (currentTask?.id === "evaluate-ice-cream-statement" && task3Complete) {
      completeTask();
    }
  }, [
    lessonId,
    currentTask,
    task1Complete,
    task2Complete,
    task3Complete,
    completeTask,
  ]);
}
