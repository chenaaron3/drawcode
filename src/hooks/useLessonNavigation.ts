import { useEffect, useMemo } from "react";

import { useTraceStore } from "@/store/traceStore";

import lessonCoursesData from "../data/lesson-courses.json";
import lessonModulesData from "../data/lesson-modules.json";
import lessonProblemsData from "../data/lesson-problems.json";
import { ProgressStorage } from "../utils/progressStorage";

import type { Lesson, LessonCourse, LessonModule } from "../types/lesson";
export interface LessonNavigationInfo {
  currentLesson: Lesson | null;
  currentModule: LessonModule | null;
  currentCourse: LessonCourse | null;
  currentCourseId: string | null;
  currentModuleId: string | null;
  currentLessonId: string | null;
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
  currentIndex: number;
  totalLessons: number;
  isLessonCompleted: boolean;
}

export interface LessonNavigationActions {
  markLessonCompleted: () => void;
  gotoNextLesson: () => void;
  gotoPreviousLesson: () => void;
  gotoDefaultLesson: () => void;
}

export function useLessonNavigation(): LessonNavigationInfo &
  LessonNavigationActions {
  const { setCurrentProblem, getCurrentProblemId } = useTraceStore();
  const courses = lessonCoursesData.courses;
  // Default to the first course (intro-to-python)
  const currentCourse = courses[0];
  // Filter modules and lessons for the current course
  let modules = lessonModulesData.modules as LessonModule[];
  modules = modules.filter((m) => currentCourse.moduleIds.includes(m.id));
  const currentLessonId = getCurrentProblemId();
  const currentModule =
    modules.find((module) =>
      module.lessonIds.includes(currentLessonId ?? "")
    ) || null;
  const currentModuleId = currentModule ? currentModule.id : null;
  const currentCourseId = currentCourse.id;

  // Get all lessons in order for the current course
  const orderedLessons = useMemo(() => {
    if (!currentCourseId) return [];
    const courses = lessonCoursesData.courses as LessonCourse[];
    const course = courses.find((c) => c.id === currentCourseId);
    if (!course) return [];
    let modules = lessonModulesData.modules as LessonModule[];
    modules = modules.filter((m) => course.moduleIds.includes(m.id));
    return modules
      .flatMap((module) =>
        module.lessonIds.map((id) =>
          (lessonProblemsData as Lesson[]).find((lesson) => lesson.id === id)
        )
      )
      .filter(Boolean) as Lesson[];
  }, [currentModuleId]);

  // Get navigation info
  const navigationInfo = useMemo(() => {
    if (!currentLessonId) {
      return {
        currentLesson: null,
        currentModule: null,
        currentCourse: null,
        currentCourseId: null,
        currentModuleId: null,
        currentLessonId: null,
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
      currentLesson: orderedLessons[currentIndex],
      currentModule: currentModule,
      currentCourse: currentCourse,
      currentCourseId: currentCourseId,
      currentModuleId: currentModuleId,
      currentLessonId: currentLessonId,
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

  // Goto default lesson: last position if available, else first lesson of first module of first course
  const gotoDefaultLesson = () => {
    const lastPosition = ProgressStorage.getLastPosition();
    if (
      lastPosition &&
      lastPosition.lessonId &&
      orderedLessons.find((l) => l.id === lastPosition.lessonId)
    ) {
      setCurrentProblem(lastPosition.lessonId);
      return;
    }
    setCurrentProblem(orderedLessons[0]?.id);
  };

  let gotoNextLesson = () => {
    if (navigationInfo.nextLesson) {
      setCurrentProblem(navigationInfo.nextLesson.id);
    }
  };
  let gotoPreviousLesson = () => {
    if (navigationInfo.previousLesson) {
      setCurrentProblem(navigationInfo.previousLesson.id);
    }
  };

  return {
    ...navigationInfo,
    isLessonCompleted,
    markLessonCompleted,
    gotoNextLesson,
    gotoPreviousLesson,
    gotoDefaultLesson,
  };
}
