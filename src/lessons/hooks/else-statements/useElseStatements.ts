import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll, useVariablesDefined } from '@/utils/taskChecks';

import content from './else-statements.md';

export function useElseStatements(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const taskComplete = [
    useTerminalContainsAll(["You do not meet the requirements to graduate."]),
    useVariablesDefined({
      credits: 120,
      gpa: 1.9,
    }),
  ].every(Boolean);

  useEffect(() => {
    if (lessonId !== "else-statements") return;
    startLesson(lessonId, content, [
      {
        id: "add-else-statement",
        title: "Add Else Statement",
        description:
          "Add an else statement to the existing if statement to handle the case where graduation requirements are not met.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "add-else-statement" && taskComplete) {
      completeTask();
    }
  }, [lessonId, currentTask, taskComplete, completeTask]);
}
