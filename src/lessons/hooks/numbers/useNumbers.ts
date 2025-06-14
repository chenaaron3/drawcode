import { useEffect } from "react";

import { useLessonStore } from "@/store/lessonStore";
import {
  useCheckTerminalContainsAll,
  useTraceFinished,
} from "@/utils/taskChecks";

import content from "./numbers.md?raw";

export function useNumbers(lessonId: string) {
  // Add lesson-specific logic here
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const traceFinished = useTraceFinished();
  const isDamageCalculated = useCheckTerminalContainsAll(["74.5"]);

  useEffect(() => {
    if (lessonId !== "numbers") return;
    // Start the lesson
    startLesson(lessonId, content, [
      {
        id: "step-into-line",
        title: "Step through the code",
        description: `In this lesson, we changed the stepper to be more granular.  
Notice how the variables are stored and used in the code.  
Step through the code to complete this task.`,
      },
      {
        id: "calculate-damage",
        title: "Calculate Damage",
        description: `Let's calculate the hero's health after taking damage.  
Print the new health on line 5.
\`\`\`
print(health - damage)
\`\`\`
`,
      },
    ]);
  }, [lessonId, startLesson]);

  useEffect(() => {
    if (currentTask?.id === "step-into-line") {
      if (traceFinished) {
        completeTask();
      }
    }
    if (currentTask?.id === "calculate-damage") {
      if (isDamageCalculated) {
        completeTask();
      }
    }
  }, [currentTask, completeTask, traceFinished, isDamageCalculated]);
}
