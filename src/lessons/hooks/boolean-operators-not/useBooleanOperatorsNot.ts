import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll, useVariablesDefined } from '@/utils/taskChecks';

import content from './boolean-operators-not.md';

export function useBooleanOperatorsNot(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const task1Complete = useVariablesDefined({
    statement_one: false,
    statement_two: true,
  });
  const task2Complete = useTerminalContainsAll([
    "You do not have enough credits to graduate.",
    "Your GPA is not high enough to graduate.",
    "You do not meet either requirement to graduate!",
  ]);

  useEffect(() => {
    if (lessonId !== "boolean-operators-not") return;
    startLesson(lessonId, content, [
      {
        id: "set-boolean-statements",
        title: "Set Boolean Statements",
        description:
          "Set the variables statement_one and statement_two equal to the results of the given boolean expressions.",
      },
      {
        id: "graduation-requirements-check",
        title: "Graduation Requirements Check",
        description:
          "Return to the if statement and add checks using and and not statements to determine if a student can graduate.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "set-boolean-statements" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "graduation-requirements-check" && task2Complete) {
      completeTask();
    }
  }, [currentTask, task1Complete, task2Complete, completeTask]);
}
