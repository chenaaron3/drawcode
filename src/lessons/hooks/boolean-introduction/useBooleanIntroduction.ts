import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useVariablesDefined } from '@/utils/taskChecks';

import content from './boolean-introduction.md';

export function useBooleanIntroduction(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const variablesDefined = useVariablesDefined({ is_warrior: true });

  useEffect(() => {
    if (lessonId !== "boolean-introduction") return;
    startLesson(lessonId, content, [
      {
        id: "assign-boolean",
        title: "Assign Boolean values",
        description:
          "Create a boolean variable called `is_warrior` and assign it the value `True`",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "assign-boolean") {
      if (variablesDefined) {
        completeTask();
      }
    }
  }, [currentTask, completeTask, variablesDefined]);
}
