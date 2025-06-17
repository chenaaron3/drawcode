import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll } from '@/utils/taskChecks';

import content from './boolean-variables.md';

export function useBooleanVariables(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();

  const task1Complete = useTerminalContainsAll(["<class 'str'>"]);
  const task2Complete = useTerminalContainsAll(["<class 'bool'>"]);

  useEffect(() => {
    if (lessonId !== "boolean-variables") return;
    startLesson(lessonId, content, [
      {
        id: "create-string-variable",
        title: "Create String Variable",
        description:
          'Create a variable named my_baby_bool and set it equal to the string "true". Check its type.',
      },
      {
        id: "create-boolean-variable",
        title: "Create Boolean Variable",
        description:
          "Create a variable named my_baby_bool_two and set it equal to True. Check its type.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "create-string-variable" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "create-boolean-variable" && task2Complete) {
      completeTask();
    }
  }, [lessonId, currentTask, task1Complete, task2Complete, completeTask]);
}
