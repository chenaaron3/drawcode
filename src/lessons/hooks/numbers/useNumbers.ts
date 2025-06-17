import { useEffect } from 'react';

import { useLessonStore } from '@/store/lessonStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { useTerminalContainsAll, useTraceFinished } from '@/utils/taskChecks';

import content from './numbers.md';

export function useNumbers(lessonId: string) {
  // Add lesson-specific logic here
  const { startLesson, completeTask, currentTask } = useLessonStore();
  const traceFinished = useTraceFinished();
  const isDamageCalculated = useTerminalContainsAll(["74.5"]);
  const { startTutorial } = useTutorialStore();

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
        callback: () => {
          startTutorial([
            {
              id: "settings",
              title: "Settings",
              content:
                "You can change the stepping mode in the settings. Line mode navigates line by line. Step mode goes deeper in between the lines so you can see exactly how data is being used.",
              targetSelector: '[data-tutorial="settings-button"]',
              position: "bottom",
            },
          ]);
        },
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
