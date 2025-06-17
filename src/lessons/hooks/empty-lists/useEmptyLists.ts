import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useVariablesDefined } from '@/utils/taskChecks';

import content from './empty-lists.md';

export function useEmptyLists(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const taskComplete = useVariablesDefined({
    my_empty_list: [],
  });

  useEffect(() => {
    if (lessonId !== "empty-lists") return;
    startLesson(lessonId, content, [
      {
        id: "create-empty-list",
        title: "Create an Empty List",
        description:
          "Create an empty list and call it my_empty_list. Don’t put anything in the list just yet.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "create-empty-list" && taskComplete) {
      completeTask();
    }
  }, [lessonId, currentTask, taskComplete, completeTask]);
}
