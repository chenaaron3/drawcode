import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';

import lessonCoursesData from '@/data/lesson-courses.json';
import lessonModulesData from '@/data/lesson-modules.json';
import lessonProblemsData from '@/data/lesson-problems.json';
import { getCourseById, getLessonById } from '@/lib/lessons';
import { useProgressStore } from '@/store/progressStore';
import { useTraceStore } from '@/store/traceStore';

import type { Lesson, LessonCourse, LessonModule } from "@/types/lesson";

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
  getUnlockedLesson: () => Lesson | null;
}

export function useLessonNavigation(): LessonNavigationInfo &
  LessonNavigationActions {
  const router = useRouter();
  const progressStore = useProgressStore();
  const { setCurrentProblem } = useTraceStore();

  // Extract current course/module/lesson from the router path
  const courseId = router.query.course as string;
  const moduleId = router.query.module as string;
  const lessonId = router.query.lesson as string;

  // Get current lesson context
  const currentInfo = lessonId ? getLessonById(lessonId) : undefined;

  // Compute navigation info (next/previous lesson) based on current context
  let navigationInfo = {
    nextLesson: undefined as Lesson | undefined,
    previousLesson: undefined as Lesson | undefined,
  };
  if (currentInfo) {
    const { course, lesson } = currentInfo;
    // Flatten all lessons in the course in order
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const idx = allLessons.findIndex((l) => l.id === lesson.id);
    navigationInfo.previousLesson = idx > 0 ? allLessons[idx - 1] : undefined;
    navigationInfo.nextLesson =
      idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : undefined;
  }

  // Route-based navigation for next/previous lesson
  let gotoNextLesson = () => {
    if (navigationInfo.nextLesson) {
      const info = getLessonById(navigationInfo.nextLesson.id);
      if (info) {
        router.push(
          `/lesson/${info.course.id}/${info.module.id}/${info.lesson.id}`,
        );
      }
    }
  };
  let gotoPreviousLesson = () => {
    if (navigationInfo.previousLesson) {
      const info = getLessonById(navigationInfo.previousLesson.id);
      if (info) {
        router.push(
          `/lesson/${info.course.id}/${info.module.id}/${info.lesson.id}`,
        );
      }
    }
  };

  // Get all lessons in order for the current course
  const orderedLessons = useMemo(() => {
    if (!courseId) return [];
    const courses = lessonCoursesData as LessonCourse[];
    const course = courses.find((c) => c.id === courseId);
    if (!course) return [];
    let modules = lessonModulesData as LessonModule[];
    modules = modules.filter((m) => course.moduleIds.includes(m.id));
    return modules
      .flatMap((module) =>
        module.lessonIds.map((id) =>
          (lessonProblemsData as Lesson[]).find((lesson) => lesson.id === id),
        ),
      )
      .filter(Boolean) as Lesson[];
  }, [courseId]);

  // Get navigation info
  const navigationInfoMemo = useMemo(() => {
    if (!lessonId) {
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

    const currentIndex = orderedLessons.findIndex((l) => l.id === lessonId);

    return {
      currentLesson: orderedLessons[currentIndex] ?? null,
      currentModule: currentInfo?.module,
      currentCourse: currentInfo?.course,
      currentCourseId: courseId,
      currentModuleId: moduleId,
      currentLessonId: lessonId,
      previousLesson:
        currentIndex > 0 ? orderedLessons[currentIndex - 1] : null,
      nextLesson:
        currentIndex < orderedLessons.length - 1
          ? orderedLessons[currentIndex + 1]
          : null,
      currentIndex,
      totalLessons: orderedLessons.length,
    };
  }, [lessonId, orderedLessons, currentInfo, courseId, moduleId]);

  // Mark lesson completed
  let isLessonCompleted = false;
  let markLessonCompleted = () => {};
  if (courseId && moduleId && lessonId) {
    isLessonCompleted = progressStore.isLessonCompleted(
      courseId,
      moduleId,
      lessonId,
    );
    markLessonCompleted = () => {
      progressStore.markLessonCompleted(courseId, moduleId, lessonId);
    };
  }

  // Save last position on navigation
  useEffect(() => {
    if (courseId && moduleId && lessonId) {
      progressStore.saveLastPosition(courseId, moduleId, lessonId);
    }
  }, [courseId, moduleId, lessonId]);

  // Goto default lesson: last position if available, else first lesson of first module of first course
  function gotoDefaultLesson() {
    const lastPosition = progressStore.getLastPosition();
    if (lastPosition) {
      router.push(
        `/lesson/${lastPosition.courseId}/${lastPosition.moduleId}/${lastPosition.lessonId}`,
      );
      return;
    }
    const course = getCourseById(courseId);
    if (!course || !course.modules.length) return;
    const module = course.modules[0];
    if (!module || !module.lessons.length) return;
    const lesson = module.lessons[0];
    if (!lesson) return;
    router.push(`/lesson/${course.id}/${module.id}/${lesson.id}`);
  }

  let getUnlockedLesson = () => {
    // Find the first lesson that is not completed
    const firstUnlockedLesson = orderedLessons.find((l) => {
      let moduleId = lessonModulesData.find((m) =>
        m.lessonIds.includes(l.id),
      )?.id;
      if (moduleId !== undefined) {
        return !progressStore.isLessonCompleted(courseId, moduleId, l.id);
      }
    });
    if (firstUnlockedLesson) {
      return firstUnlockedLesson;
    }
    return null;
  };

  // @ts-expect-error idk
  return {
    ...navigationInfoMemo,
    isLessonCompleted,
    markLessonCompleted,
    gotoNextLesson,
    gotoPreviousLesson,
    gotoDefaultLesson,
    getUnlockedLesson,
  };
}
