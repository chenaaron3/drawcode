import { useEffect } from "react";

import { useLessonStore } from "@/store/lessonStore";
import { useTraceStore } from "@/store/traceStore";

import questNotes from "./quest-notes.md?raw";

export function useQuestNotes(lessonId: string) {
  // Add lesson-specific logic here
  const { setContent, startLesson, addTask, completeTask, currentTask } =
    useLessonStore();
  const { traceData, setCurrentProblem } = useTraceStore();

  useEffect(() => {
    if (lessonId !== "quest-notes") return;

    const initializeLesson = async () => {
      // Start the lesson
      startLesson(lessonId, questNotes, [
        {
          id: "make-first-comment",
          title: "Write a comment",
          description:
            "Write a comment describing the first quest you want to embark on in your programming adventure!",
          callback: () => {},
        },
      ]);
    };
    initializeLesson();
  }, [lessonId, setContent, startLesson, addTask, setCurrentProblem]);

  useEffect(() => {
    if (currentTask?.id === "make-first-comment") {
      // Split the code into lines and see if there are more than 1 comment
      const lines = traceData?.metadata.code.split("\n");
      const commentCount = lines?.filter((line) => line.startsWith("#")).length;
      if (commentCount && commentCount > 1) {
        completeTask();
      }
    }
  }, [currentTask, traceData]);
}
