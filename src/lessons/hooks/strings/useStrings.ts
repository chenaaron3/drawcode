import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useVariablesDefined, useVariablesPrinted } from '@/utils/taskChecks';

import content from './strings.md';

export function useStrings(lessonId: string) {
  // Add lesson-specific logic here
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const variablesDefined = useVariablesDefined({
    character_class: undefined,
    quest_name: undefined,
  });
  const variablesPrinted = useVariablesPrinted([
    "character_class",
    "quest_name",
  ]);

  useEffect(() => {
    startLesson(lessonId, content, [
      {
        id: "create-variables",
        title: "Create The Variables",
        description:
          "Create two variables named `character_class` and `quest_name`. Try using both single and double quotes.",
      },
      {
        id: "print-variables",
        title: "Print The Variables",
        description: "Print the variables `character_class` and `quest_name`.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "create-variables") {
      if (variablesDefined) {
        completeTask();
      }
    } else if (currentTask?.id === "print-variables") {
      if (variablesPrinted) {
        completeTask();
      }
    }
  }, [currentTask, completeTask, variablesDefined, variablesPrinted]);
}
