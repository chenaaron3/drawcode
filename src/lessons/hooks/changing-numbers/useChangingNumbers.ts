import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll, useVariablesDefined } from '@/utils/taskChecks';

import content from './changing-numbers.md';
import quiltDimensions from './quilt-dimensions.md';

export function useChangingNumbers(lessonId: string) {
  // Add lesson-specific logic here
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const task1Complete = useVariablesDefined({
    quilt_width: 8,
    quilt_length: 12,
  });
  const task2Complete = useTerminalContainsAll(["96"]);
  const task3Complete = useTerminalContainsAll(["64"]);

  useEffect(() => {
    if (lessonId !== "changing-numbers") return;
    // Start the lesson
    startLesson(lessonId, content, [
      {
        id: "quilt-dimensions",
        title: "Set Quilt Dimensions",
        description: quiltDimensions,
      },
      {
        id: "calculate-squares",
        title: "Calculate Total Squares",
        description:
          "Print out the number of squares you’ll need to create the quilt!",
      },
      {
        id: "update-quilt-length",
        title: "Update Quilt Length",
        description:
          "It turns out that quilt required a little more material than you have on hand! Let’s only make the quilt 8 squares long. How many squares will you need for this quilt instead?",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "quilt-dimensions" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "calculate-squares" && task2Complete) {
      completeTask();
    }
    if (currentTask?.id === "update-quilt-length" && task3Complete) {
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
