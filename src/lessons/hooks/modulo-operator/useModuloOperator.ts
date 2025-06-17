import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTerminalContainsAll, useVariablesDefined } from '@/utils/taskChecks';

import content from './modulo-operator.md';

export function useModuloOperator(lessonId: string) {
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const task1Complete = [
    useVariablesDefined({ first_order_remainder: 9 }),
    useTerminalContainsAll(["9"]),
  ].every(Boolean);
  const task2Complete = useVariablesDefined({
    first_order_coupon: "no",
  });
  const task3Complete = [
    useVariablesDefined({
      second_order_remainder: 0,
    }),
    useTerminalContainsAll(["0"]),
  ].every(Boolean);
  const task4Complete = useVariablesDefined({
    second_order_coupon: "yes",
  });

  useEffect(() => {
    if (lessonId !== "modulo-operator") return;
    startLesson(lessonId, content, [
      {
        id: "first-order-remainder",
        title: "Calculate First Order Remainder",
        description:
          "Create a new variable, first_order_remainder and set it equal to 269 modulo 10. Then, print out first_order_remainder to find out if that customer will receive a discount.",
      },
      {
        id: "first-order-coupon",
        title: "Determine First Order Coupon",
        description:
          "Look at the printed value of first_order_remainder. Was the remainder 0, meaning that the customer should receive a coupon for this order? Create a new variable called first_order_coupon and assign to it a value of 'yes' if the order should get a coupon. Otherwise, give first_order_coupon the value of 'no'.",
      },
      {
        id: "second-order-remainder",
        title: "Calculate Second Order Remainder",
        description:
          "Here comes the second order of the day, #270! Let's see if they will get a discount! Find the remainder by calculating 270 modulo 10 and store the result in a new variable named second_order_remainder. Then, print out second_order_remainder.",
      },
      {
        id: "second-order-coupon",
        title: "Determine Second Order Coupon",
        description:
          "Based on the printed value of second_order_remainder, should the customer receive a coupon for this order? Create a new variable named second_order_coupon and give it a value of 'yes' if the order should get a coupon. Otherwise, give second_order_coupon the value of 'no'.",
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "first-order-remainder" && task1Complete) {
      completeTask();
    }
    if (currentTask?.id === "first-order-coupon" && task2Complete) {
      completeTask();
    }
    if (currentTask?.id === "second-order-remainder" && task3Complete) {
      completeTask();
    }
    if (currentTask?.id === "second-order-coupon" && task4Complete) {
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
