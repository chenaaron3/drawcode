import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useVariablesDefined } from '@/utils/taskChecks';

import content from './empty-variables.md';

export function useEmptyVariables(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const variablesDefined = useVariablesDefined({ score: null });

  useEffect(() => {
    if (lessonId !== "empty-variables") return;
    // Start the lesson
    startLesson(lessonId, content, [
      {
        id: "define-variables",
        title: "Defining an Empty Variable",
        description: "Set `name` to None",
      },
    ]);
  }, [lessonId, startLesson]);

  // Check if the user defined the required variables
  useEffect(() => {
    if (currentTask?.id === "define-variables") {
      if (variablesDefined) {
        completeTask();
      }
    }
  }, [currentTask, completeTask, variablesDefined]);
}
