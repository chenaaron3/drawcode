import { useMemo } from 'react';

import lessonModulesData from '../data/lesson-modules.json';
import lessonProblemsData from '../data/lesson-problems.json';
import { useTraceStore } from '../store/traceStore';

import type { Lesson, LessonModule } from "../types/lesson";

export interface LessonNavigationInfo {
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
  currentIndex: number;
  totalLessons: number;
}

export function useLessonNavigation(): LessonNavigationInfo {
  const { currentProblemId } = useTraceStore();

  // Get all lessons in order (following the module structure)
  const orderedLessons = useMemo(() => {
    const modules = lessonModulesData.modules as LessonModule[];
    const orderedIds: string[] = [];

    modules.forEach((module) => {
      orderedIds.push(...module.lessonIds);
    });

    return orderedIds
      .map((id) =>
        (lessonProblemsData as Lesson[]).find((lesson) => lesson.id === id)
      )
      .filter(Boolean) as Lesson[];
  }, []);

  // Get navigation info
  const navigationInfo = useMemo(() => {
    if (!currentProblemId) {
      return {
        previousLesson: null,
        nextLesson: null,
        currentIndex: -1,
        totalLessons: orderedLessons.length,
      };
    }

    const currentIndex = orderedLessons.findIndex(
      (l) => l.id === currentProblemId
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
  }, [currentProblemId, orderedLessons]);

  return navigationInfo;
}
