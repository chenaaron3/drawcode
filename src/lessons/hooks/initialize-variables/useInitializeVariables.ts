import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useVariablesDefined, useVariablesPrinted } from '@/utils/taskChecks';

import content from './initialize-variables.md';

export function useInitializeVariables(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const variablesDefined = useVariablesDefined({
    level: 5,
    strength: 42.1,
    role: "Warrior",
  });
  const variablesPrinted = useVariablesPrinted(["level", "strength", "role"]);

  useEffect(() => {
    if (lessonId !== "initialize-variables") return;
    // Start the lesson
    startLesson(lessonId, content, [
      {
        id: "initialize-attributes",
        title: "Initialize the attributes",
        description:
          "Set `level` to `5`, `strength` to `42.1`, and `role` to `'Warrior'`",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "initialize-attributes") {
      if (variablesDefined && variablesPrinted) {
        completeTask();
      }
    }
  }, [currentTask, completeTask, variablesDefined, variablesPrinted]);
}
