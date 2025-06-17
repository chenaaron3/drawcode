import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll, useVariablesDefined } from '@/utils/taskChecks';

import content from './boolean-operators-and.md';

export function useBooleanOperatorsAnd(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const task1Complete = useVariablesDefined({
    statement_one: false,
    statement_two: true,
  });
  const task2Complete = useTerminalContainsAll([
    "You meet the requirements to graduate!",
  ]);

  useEffect(() => {
    if (lessonId !== "boolean-operators-and") return;
    startLesson(lessonId, content, [
      {
        id: "define-statements",
        title: "Define Boolean Statements",
        description:
          "Set the variables statement_one and statement_two equal to the results of the given boolean expressions.",
      },
      {
        id: "check-graduation-requirements",
        title: "Check Graduation Requirements",
        description:
          "Rewrite the if statement to check if a student meets both requirements to graduate using an and statement.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "define-statements" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "check-graduation-requirements" && task2Complete) {
      completeTask();
    }
  }, [lessonId, currentTask, task1Complete, task2Complete, completeTask]);
}
