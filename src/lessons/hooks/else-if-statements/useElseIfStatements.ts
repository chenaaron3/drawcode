import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll } from '@/utils/taskChecks';

import content from './else-if-statements.md';

export function useElseIfStatements(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const taskComplete = useTerminalContainsAll(["B"]);

  useEffect(() => {
    if (lessonId !== "else-if-statements") return;
    startLesson(lessonId, content, [
      {
        id: "assign-letter-grade",
        title: "Assign Letter Grade",
        description:
          "Write an if/elif/else statement that assigns a letter grade based on the numeric grade.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "assign-letter-grade" && taskComplete) {
      completeTask();
    }
  }, [lessonId, currentTask, taskComplete, completeTask]);
}
