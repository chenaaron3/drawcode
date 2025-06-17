import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll } from '@/utils/taskChecks';

import content from './string-concatenation.md';

export function useStringConcatenation(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const taskComplete = useTerminalContainsAll([
    "The wind, which had hitherto carried us along with amazing rapidity, sank at sunset to a light breeze; the soft air just ruffled the water and caused a pleasant motion among the trees as we approached the shore, from which it wafted the most delightful scent of flowers and hay.",
  ]);

  useEffect(() => {
    if (lessonId !== "string-concatenation") return;
    startLesson(lessonId, content, [
      {
        id: "concatenate-strings",
        title: "Concatenate Strings",
        description:
          "Concatenate the strings and save the message they form in the variable message. Now uncomment the print statement and run your code to see the result in the terminal!",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "concatenate-strings" && taskComplete) {
      completeTask();
    }
  }, [lessonId, currentTask, taskComplete, completeTask]);
}
