import { useEffect, useMemo } from "react";

import lessonModulesData from "../data/lesson-modules.json";
import lessonProblemsData from "../data/lesson-problems.json";
import { ProgressStorage } from "../utils/progressStorage";

import type { Lesson, LessonModule } from "../types/lesson";

export interface LessonNavigationInfo {
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
  currentIndex: number;
  totalLessons: number;
}

export function useLessonNavigation(
  currentCourseId: string,
  currentModuleId: string | undefined,
  currentLessonId: string | null
): LessonNavigationInfo & {
  isLessonCompleted: boolean;
  markLessonCompleted: () => void;
} {
  // Get all lessons in order for the current module
  const orderedLessons = useMemo(() => {
    if (!currentModuleId) return [];
    const modules = lessonModulesData.modules as LessonModule[];
    const module = modules.find((m) => m.id === currentModuleId);
    if (!module) return [];
    return module.lessonIds
      .map((id) =>
        (lessonProblemsData as Lesson[]).find((lesson) => lesson.id === id)
      )
      .filter(Boolean) as Lesson[];
  }, [currentModuleId]);

  // Get navigation info
  const navigationInfo = useMemo(() => {
    if (!currentLessonId) {
      return {
        previousLesson: null,
        nextLesson: null,
        currentIndex: -1,
        totalLessons: orderedLessons.length,
      };
    }

    const currentIndex = orderedLessons.findIndex(
      (l) => l.id === currentLessonId
    );

    return {
      previousLesson:
        currentIndex > 0 ? orderedLessons[currentIndex - 1] : null,
      nextLesson:
        currentIndex < orderedLessons.length - 1
          ? orderedLessons[currentIndex + 1]
          : null,
      currentIndex,
      totalLessons: orderedLessons.length,
    };
  }, [currentLessonId, orderedLessons]);

  let isLessonCompleted = false;
  let markLessonCompleted = () => {};
  if (currentCourseId && currentModuleId && currentLessonId) {
    isLessonCompleted = ProgressStorage.isLessonCompleted(
      currentCourseId,
      currentModuleId,
      currentLessonId
    );
    markLessonCompleted = () => {
      ProgressStorage.markLessonCompleted(
        currentCourseId,
        currentModuleId,
        currentLessonId
      );
    };
  }

  // Save last position on navigation
  useEffect(() => {
    if (currentCourseId && currentModuleId && currentLessonId) {
      ProgressStorage.saveLastPosition(
        currentCourseId,
        currentModuleId,
        currentLessonId
      );
    }
  }, [currentCourseId, currentModuleId, currentLessonId]);

  return {
    ...navigationInfo,
    isLessonCompleted,
    markLessonCompleted,
  };
}
