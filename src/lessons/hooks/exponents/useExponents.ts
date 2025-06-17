import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll } from '@/utils/taskChecks';

import content from './exponents.md';

export function useExponents(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const task1Complete = useTerminalContainsAll(["36", "49", "64"]);
  const task2Complete = useTerminalContainsAll(["1296"]);

  useEffect(() => {
    if (lessonId !== "exponents") return;
    startLesson(lessonId, content, [
      {
        id: "square-quilts",
        title: "Square Quilts",
        description:
          "Using the exponent operator, print out how many squares you’ll need for a 6x6 quilt, a 7x7 quilt, and an 8x8 quilt.",
      },
      {
        id: "popular-quilts",
        title: "Popular Quilts",
        description:
          "Your 6x6 quilts have become so popular that 6 people have each requested 6 quilts. Print out how many total tiles you would need to make 6 6x6 quilts for 6 people.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "square-quilts" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "popular-quilts" && task2Complete) {
      completeTask();
    }
  }, [lessonId, currentTask, task1Complete, task2Complete, completeTask]);
}
