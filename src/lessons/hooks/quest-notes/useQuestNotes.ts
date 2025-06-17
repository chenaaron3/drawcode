import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTraceStore } from '@/store/traceStore';

import questNotes from './quest-notes.md';

export function useQuestNotes(lessonId: string) {
  // Add lesson-specific logic here
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const { traceData } = useTraceStore();

  useEffect(() => {
    if (lessonId !== "quest-notes") return;
    // Start the lesson
    startLesson(lessonId, questNotes, [
      {
        id: "make-first-comment",
        title: "Write a comment",
        description:
          "Write a comment on line 2 describing why you want to learn Python! Save the code to complete the task.",
        callback: () => {},
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "make-first-comment") {
      // Split the code into lines and see if there are more than 1 comment
      const lines = traceData?.metadata.code.split("\n");
      const commentCount = lines?.filter((line) => line.startsWith("#")).length;
      if (commentCount && commentCount > 1) {
        completeTask();
      }
    }
  }, [currentTask, traceData, completeTask]);
}
