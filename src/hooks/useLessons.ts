import { useEffect, useState } from 'react';

// Import the lessons data
import lessonsData from '@/data/lessons.json';
import { useLessonStore } from '@/store/lessonStore';

import type { Curriculum, Module, Lesson } from "@/types/lesson";
export function useLessons() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    curriculum,
    loadCurriculum,
    selectModule,
    selectLesson,
    currentModule,
    currentLesson,
  } = useLessonStore();

  // Load curriculum data on mount
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate and load the curriculum data
      const curriculumData = lessonsData as Curriculum;

      if (!curriculumData.modules || curriculumData.modules.length === 0) {
        throw new Error("No modules found in curriculum data");
      }

      loadCurriculum(curriculumData);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load lessons:", err);
      setError(err instanceof Error ? err.message : "Failed to load lessons");
      setIsLoading(false);
    }
  }, [loadCurriculum]);

  // Helper functions
  const getModuleById = (moduleId: string): Module | undefined => {
    return curriculum?.modules.find((m) => m.id === moduleId);
  };

  const getLessonById = (
    lessonId: string
  ): { lesson: Lesson; module: Module } | undefined => {
    if (!curriculum) return undefined;

    for (const module of curriculum.modules) {
      const lesson = module.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return { lesson, module };
      }
    }
    return undefined;
  };

  const getNextLesson = (currentLessonId: string): Lesson | undefined => {
    const currentInfo = getLessonById(currentLessonId);
    if (!currentInfo) return undefined;

    const { lesson: currentLesson, module } = currentInfo;
    const currentIndex = module.lessons.findIndex(
      (l) => l.id === currentLessonId
    );

    // Try next lesson in same module
    if (currentIndex < module.lessons.length - 1) {
      return module.lessons[currentIndex + 1];
    }

    // Try first lesson of next module
    if (curriculum) {
      const moduleIndex = curriculum.modules.findIndex(
        (m) => m.id === module.id
      );
      if (moduleIndex < curriculum.modules.length - 1) {
        const nextModule = curriculum.modules[moduleIndex + 1];
        return nextModule.lessons[0];
      }
    }

    return undefined;
  };

  const getPreviousLesson = (currentLessonId: string): Lesson | undefined => {
    const currentInfo = getLessonById(currentLessonId);
    if (!currentInfo) return undefined;

    const { lesson: currentLesson, module } = currentInfo;
    const currentIndex = module.lessons.findIndex(
      (l) => l.id === currentLessonId
    );

    // Try previous lesson in same module
    if (currentIndex > 0) {
      return module.lessons[currentIndex - 1];
    }

    // Try last lesson of previous module
    if (curriculum) {
      const moduleIndex = curriculum.modules.findIndex(
        (m) => m.id === module.id
      );
      if (moduleIndex > 0) {
        const previousModule = curriculum.modules[moduleIndex - 1];
        return previousModule.lessons[previousModule.lessons.length - 1];
      }
    }

    return undefined;
  };

  const getLessonsForModule = (moduleId: string): Lesson[] => {
    const module = getModuleById(moduleId);
    return module?.lessons || [];
  };

  const getAllModules = (): Module[] => {
    return curriculum?.modules || [];
  };

  const validateLessonPrerequisites = (lessonId: string): boolean => {
    const lessonInfo = getLessonById(lessonId);
    if (!lessonInfo || !lessonInfo.lesson.prerequisites) return true;

    const userProgress = useLessonStore.getState().userProgress;
    const completedLessons = userProgress?.completedLessons || [];

    return lessonInfo.lesson.prerequisites.every((prereqId) =>
      completedLessons.includes(prereqId)
    );
  };

  const getAvailableLessons = (): Lesson[] => {
    if (!curriculum) return [];

    const allLessons: Lesson[] = [];
    curriculum.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        if (validateLessonPrerequisites(lesson.id)) {
          allLessons.push(lesson);
        }
      });
    });

    return allLessons;
  };

  const navigateToModule = (moduleId: string) => {
    selectModule(moduleId);
  };

  const navigateToLesson = (lessonId: string) => {
    selectLesson(lessonId);
  };

  return {
    // Data
    curriculum,
    currentModule,
    currentLesson,
    isLoading,
    error,

    // Helper functions
    getModuleById,
    getLessonById,
    getNextLesson,
    getPreviousLesson,
    getLessonsForModule,
    getAllModules,
    validateLessonPrerequisites,
    getAvailableLessons,

    // Navigation
    navigateToModule,
    navigateToLesson,
  };
}

export default useLessons;
