import { useCallback, useEffect, useState } from 'react';

export interface UserProgress {
  completedProblems: string[];
  lastUpdated: string;
}

const PROGRESS_STORAGE_KEY = "leetcode-roadmap-progress";

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>({
    completedProblems: [],
    lastUpdated: new Date().toISOString(),
  });

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed);
      }
    } catch (error) {
      console.error("Failed to load progress from localStorage:", error);
    }
  }, []);

  // Save progress to localStorage whenever it changes
  const saveProgress = useCallback((newProgress: UserProgress) => {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error("Failed to save progress to localStorage:", error);
    }
  }, []);

  // Mark a problem as completed
  const markProblemCompleted = useCallback(
    (problemId: string) => {
      setProgress((currentProgress) => {
        if (currentProgress.completedProblems.includes(problemId)) {
          return currentProgress; // Already completed
        }

        const newProgress = {
          completedProblems: [...currentProgress.completedProblems, problemId],
          lastUpdated: new Date().toISOString(),
        };

        saveProgress(newProgress);
        return newProgress;
      });
    },
    [saveProgress],
  );

  // Mark a problem as not completed (toggle off)
  const markProblemIncomplete = useCallback(
    (problemId: string) => {
      setProgress((currentProgress) => {
        const newProgress = {
          completedProblems: currentProgress.completedProblems.filter(
            (id) => id !== problemId,
          ),
          lastUpdated: new Date().toISOString(),
        };

        saveProgress(newProgress);
        return newProgress;
      });
    },
    [saveProgress],
  );

  // Toggle problem completion status
  const toggleProblemCompletion = useCallback(
    (problemId: string) => {
      if (progress.completedProblems.includes(problemId)) {
        markProblemIncomplete(problemId);
      } else {
        markProblemCompleted(problemId);
      }
    },
    [progress.completedProblems, markProblemCompleted, markProblemIncomplete],
  );

  // Check if a problem is completed
  const isProblemCompleted = useCallback(
    (problemId: string) => {
      return progress.completedProblems.includes(problemId);
    },
    [progress.completedProblems],
  );

  // Get completion percentage for a pattern
  const getPatternCompletion = useCallback(
    (patternProblemIds: string[]) => {
      if (!patternProblemIds || patternProblemIds.length === 0) return 0;

      const completedCount = patternProblemIds.filter((id) =>
        progress.completedProblems.includes(id),
      ).length;

      return Math.round((completedCount / patternProblemIds.length) * 100);
    },
    [progress.completedProblems],
  );

  // Get total progress statistics
  const getProgressStats = useCallback(
    (allProblemIds: string[]) => {
      const totalProblems = allProblemIds.length;
      const completedCount = progress.completedProblems.length;
      const completionPercentage =
        totalProblems > 0
          ? Math.round((completedCount / totalProblems) * 100)
          : 0;

      return {
        totalProblems,
        completedCount,
        completionPercentage,
      };
    },
    [progress.completedProblems],
  );

  // Clear all progress
  const clearProgress = useCallback(() => {
    const emptyProgress = {
      completedProblems: [],
      lastUpdated: new Date().toISOString(),
    };
    saveProgress(emptyProgress);
  }, [saveProgress]);

  return {
    progress,
    markProblemCompleted,
    markProblemIncomplete,
    toggleProblemCompletion,
    isProblemCompleted,
    getPatternCompletion,
    getProgressStats,
    clearProgress,
  };
}
