import { useEffect } from "react";

import { useLessonStore } from "@/store/lessonStore";

import content from "./hero-names-and-text.md?raw";

export function useHeroNamesAndText(lessonId: string) {
  // Add lesson-specific logic here
  const { startLesson } = useLessonStore();

  useEffect(() => {
    if (lessonId !== "hero-names-and-text") return;
    // Start the lesson
    startLesson(lessonId, content, [
      {
        id: "hero-names-and-text-1",
        title: "Print Your Hero's Name",
        description: "Print your hero's name using the `print()` command.",
      },
    ]);
  }, [lessonId, startLesson]);
}
