import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll, useVariablesDefined } from '@/utils/taskChecks';

import content from './growing-a-list-plus.md';

export function useGrowingAListPlus(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();

  const task1Complete = useVariablesDefined({
    new_orders: ["lilac", "iris"],
  });
  const task2Complete = useVariablesDefined({
    orders_combined: [
      "daisy",
      "buttercup",
      "snapdragon",
      "gardenia",
      "lily",
      "lilac",
      "iris",
    ],
  });
  const task3Complete = useTerminalContainsAll([
    'TypeError: can only concatenate list (not "int") to list',
  ]);

  useEffect(() => {
    if (lessonId !== "growing-a-list-plus") return;
    startLesson(lessonId, content, [
      {
        id: "create-new-orders",
        title: "Create New Orders",
        description:
          "Jiho is updating a list of orders. He just received orders for 'lilac' and 'iris'. Create a list called new_orders that contains our new orders.",
      },
      {
        id: "combine-orders",
        title: "Combine Orders",
        description:
          "Use + to create a new list called orders_combined that combines orders with new_orders.",
      },
      {
        id: "fix-broken-prices",
        title: "Fix Broken Prices",
        description:
          "Remove the # and whitespace in front of the list broken_prices. Fix the command by inserting brackets ([ and ]) so that it will run without errors.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "create-new-orders" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "combine-orders" && task2Complete) {
      completeTask();
    }
    if (currentTask?.id === "fix-broken-prices" && task3Complete) {
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
