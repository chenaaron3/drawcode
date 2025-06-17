import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll } from '@/utils/taskChecks';

import content from './relational-operators-ii.md';

export function useRelationalOperatorsII(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const task1Complete = useTerminalContainsAll(["These numbers are the same"]);
  const task2Complete = useTerminalContainsAll([
    "You have enough credits to graduate!",
  ]);

  useEffect(() => {
    if (lessonId !== "relational-operators-ii") return;
    startLesson(lessonId, content, [
      {
        id: "check-equality",
        title: "Check Equality",
        description:
          'Create an if statement that checks if x and y are equal. Print "These numbers are the same" if so.',
      },
      {
        id: "check-graduation-eligibility",
        title: "Check Graduation Eligibility",
        description:
          'Write an if statement that checks if the student has enough credits to graduate. Print "You have enough credits to graduate!" if they do.',
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "check-equality" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "check-graduation-eligibility" && task2Complete) {
      completeTask();
    }
  }, [lessonId, currentTask, task1Complete, task2Complete, completeTask]);
}
