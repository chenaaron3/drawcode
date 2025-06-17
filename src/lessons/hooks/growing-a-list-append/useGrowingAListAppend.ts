import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll, useVariablesDefined } from '@/utils/taskChecks';

import content from './growing-a-list-append.md';

export function useGrowingAListAppend(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const task1Complete = useTerminalContainsAll(["daisies", "periwinkle"]);
  const task2Complete = useVariablesDefined({
    orders: ["daisies", "periwinkle", "tulips"],
  });
  const task3Complete = useVariablesDefined({
    orders: ["daisies", "periwinkle", "tulips", "roses"],
  });
  const task4Complete = useTerminalContainsAll([
    "daisies",
    "periwinkle",
    "tulips",
    "roses",
  ]);

  useEffect(() => {
    if (lessonId !== "growing-a-list-append") return;
    startLesson(lessonId, content, [
      {
        id: "inspect-orders",
        title: "Inspect Initial Orders",
        description: "Use print to inspect the orders Jiho has received today.",
      },
      {
        id: "append-tulips",
        title: "Append Tulips",
        description:
          "Jiho just received a new order for 'tulips'. Use append to add this string to orders.",
      },
      {
        id: "append-roses",
        title: "Append Roses",
        description:
          "Another order has come in! Use append to add 'roses' to orders.",
      },
      {
        id: "inspect-updated-orders",
        title: "Inspect Updated Orders",
        description: "Use print to inspect the orders Jiho has received today.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "inspect-orders" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "append-tulips" && task2Complete) {
      completeTask();
    }
    if (currentTask?.id === "append-roses" && task3Complete) {
      completeTask();
    }
    if (currentTask?.id === "inspect-updated-orders" && task4Complete) {
      completeTask();
    }
  }, [
    lessonId,
    currentTask,
    task1Complete,
    task2Complete,
    task3Complete,
    task4Complete,
  ]);
}
