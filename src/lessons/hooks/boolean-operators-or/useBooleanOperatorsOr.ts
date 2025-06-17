import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll, useVariablesDefined } from '@/utils/taskChecks';

import content from './boolean-operators-or.md';

export function useBooleanOperatorsOr(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const task1Complete = useVariablesDefined({
    statement_one: true,
    statement_two: true,
  });
  const task2Complete = useTerminalContainsAll([
    "You have met at least one of the requirements.",
  ]);

  useEffect(() => {
    if (lessonId !== "boolean-operators-or") return;
    startLesson(lessonId, content, [
      {
        id: "evaluate-boolean-expressions",
        title: "Evaluate Boolean Expressions",
        description:
          "Set the variables statement_one and statement_two equal to the results of the given boolean expressions.",
      },
      {
        id: "check-graduation-requirements",
        title: "Check Graduation Requirements",
        description:
          "Write an if statement that checks if a student either has 120 or more credits or a GPA 2.0 or higher.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "evaluate-boolean-expressions" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "check-graduation-requirements" && task2Complete) {
      completeTask();
    }
  }, [lessonId, currentTask, task1Complete, task2Complete, completeTask]);
}
