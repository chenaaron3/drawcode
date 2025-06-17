import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll, useTraceFinished } from '@/utils/taskChecks';

import content from './if-statement.md';

export function useIfStatement(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const task1Complete = useTraceFinished();
  const task2Complete = useTerminalContainsAll(["Get off my computer, Dave!"]);
  const task3Complete = useTerminalContainsAll([
    "I know it is you, Dave! Go away!",
  ]);

  useEffect(() => {
    if (lessonId !== "if-statement") return;
    startLesson(lessonId, content, [
      {
        id: "enter-username",
        title: "Enter a User Name",
        description:
          "In script.py, there is an if statement. Enter a user name in the field for user_name and try running the program.",
      },
      {
        id: "fix-syntax-error",
        title: "Fix the Syntax Error",
        description:
          "Oh no! We got a SyntaxError! Read through the error message carefully and see if you can find the error. Then, fix it, and run the code again.",
      },
      {
        id: "add-second-if-statement",
        title: "Add a Second If Statement",
        description:
          "Set your user_name to be angela_catlady_87. Update the program with a second if statement so it checks for Angela’s user name as well and prints 'I know it is you, Dave! Go away!' in response.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "enter-username" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "fix-syntax-error" && task2Complete) {
      completeTask();
    }
    if (currentTask?.id === "add-second-if-statement" && task3Complete) {
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
