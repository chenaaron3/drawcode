import coursesData from '@/data/lesson-courses.json';
import modulesData from '@/data/lesson-modules.json';
import problemsData from '@/data/lesson-problems.json';

import type { LessonCourse, LessonModule, Lesson } from "@/types/lesson";

// Extended types for nested structure
export interface LinkedLessonModule extends LessonModule {
  lessons: Lesson[];
}

export interface LinkedLessonCourse extends LessonCourse {
  modules: LinkedLessonModule[];
}

// Build lookup maps for fast access
const problemsMap: Record<string, Lesson> = Object.fromEntries(
  (problemsData as unknown as Lesson[]).map((p) => [p.id, p]),
);

const modulesRaw = modulesData as unknown as LessonModule[];
const modulesMap: Record<string, LinkedLessonModule> = Object.fromEntries(
  modulesRaw.map((m) => [
    m.id,
    {
      ...m,
      lessons: m.lessonIds
        .map((lid) => problemsMap[lid])
        .filter((l): l is Lesson => Boolean(l)),
    },
  ]),
);

const coursesRaw = coursesData as unknown as LessonCourse[];
const coursesMap: Record<string, LinkedLessonCourse> = Object.fromEntries(
  coursesRaw.map((c) => [
    c.id,
    {
      ...c,
      modules: c.moduleIds
        .map((mid) => modulesMap[mid])
        .filter((m): m is LinkedLessonModule => Boolean(m)),
    },
  ]),
);

// Exported functions
export function getAllCourses(): LinkedLessonCourse[] {
  return Object.values(coursesMap);
}

export function getCourseById(
  courseId: string,
): LinkedLessonCourse | undefined {
  return coursesMap[courseId];
}

export function getModuleById(
  moduleId: string,
): LinkedLessonModule | undefined {
  return modulesMap[moduleId];
}

export function getLessonById(lessonId: string):
  | {
      lesson: Lesson;
      module: LinkedLessonModule;
      course: LinkedLessonCourse;
    }
  | undefined {
  // Find the module containing this lesson
  const mod = Object.values(modulesMap).find((m) =>
    m.lessonIds.includes(lessonId),
  );
  if (!mod) return undefined;
  const course = Object.values(coursesMap).find((c) =>
    c.moduleIds.includes(mod.id),
  );
  if (!course) return undefined;
  const lesson = problemsMap[lessonId];
  if (!lesson) return undefined;
  return { lesson, module: mod, course };
}
