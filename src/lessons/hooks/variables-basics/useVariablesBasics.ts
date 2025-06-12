import { useEffect } from "react";

import { useLessonStore } from "@/store/lessonStore";

import type { LessonHookResult } from "@/types/lesson";
const LESSON_CONTENT = `# Variables Basics 📦

Now that you've met your hero, let's dive deeper into variables - the building blocks of programming!

## What Are Variables?

Variables are like labeled containers that store information. Think of them as boxes with names on them where you can put different things.

\`\`\`python
# These are all variables
name = "Alice"
age = 25
height = 5.6
is_student = True
\`\`\`

## Variable Types

Python has several basic types of data:

- **Strings** (text): \`"Hello World"\`
- **Integers** (whole numbers): \`42\`
- **Floats** (decimal numbers): \`3.14\`
- **Booleans** (True/False): \`True\` or \`False\`

## Variable Rules

1. Start with a letter or underscore
2. Can contain letters, numbers, and underscores
3. Case sensitive (\`Name\` and \`name\` are different)
4. No spaces allowed

## Try Different Variables

Experiment with creating variables of different types and see how Python handles them!`;

export function useVariablesBasics(lessonId: string): LessonHookResult {
  const {
    setContent,
    setLoading,
    setError,
    startLesson,
    addTask,
    completeTask,
    activeTasks,
  } = useLessonStore();

  useEffect(() => {
    if (lessonId !== "variables-basics") return;

    const initializeLesson = async () => {
      try {
        setLoading(true);
        setError(null);

        startLesson(lessonId);
        setContent(LESSON_CONTENT);

        // Add tasks for this lesson
        addTask({
          id: "create-string-var",
          type: "code",
          title: "Create a String Variable",
          description:
            'Create a variable called "favorite_color" with your favorite color',
        });

        addTask({
          id: "create-number-var",
          type: "code",
          title: "Create a Number Variable",
          description:
            'Create a variable called "lucky_number" with your lucky number',
        });

        addTask({
          id: "variable-types-quiz",
          type: "quiz",
          title: "Variable Types Quiz",
          description: "Test your knowledge of Python variable types",
        });
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load lesson"
        );
      } finally {
        setLoading(false);
      }
    };

    initializeLesson();
  }, [lessonId, setContent, setLoading, setError, startLesson, addTask]);

  return {
    isReady: !useLessonStore((state) => state.isLoading),
    error: useLessonStore((state) => state.error),
  };
}
