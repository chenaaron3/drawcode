import ReactGA from "react-ga4";

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = "G-T2LR4YQ3RZ";

  if (measurementId) {
    ReactGA.initialize(measurementId, {});
    console.log("Google Analytics initialized");
  } else {
    console.warn("Google Analytics Measurement ID not found");
  }
};

// Track page views
export const trackPageView = (page: string, title?: string) => {
  ReactGA.send({
    hitType: "pageview",
    page,
    title: title || page,
  });
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  ReactGA.event({
    action,
    category,
    label,
    value,
  });
};

// Specific tracking functions for the app
export const trackProblemSelection = (
  problemId: string,
  source: "roadmap" | "header"
) => {
  trackEvent("select_problem", "Navigation", `${problemId}_from_${source}`);
};

export const trackViewChange = (fromView: string, toView: string) => {
  trackEvent("view_change", "Navigation", `${fromView}_to_${toView}`);
};

export const trackCodeCompilation = (problemId: string, success: boolean) => {
  trackEvent(
    "compile_code",
    "Interaction",
    `${problemId}_${success ? "success" : "error"}`
  );
};

export const trackProblemCompletion = (
  problemId: string,
  completed: boolean
) => {
  trackEvent(
    "toggle_completion",
    "Progress",
    `${problemId}_${completed ? "completed" : "uncompleted"}`
  );
};

export const trackNavigationStep = (
  direction: "next" | "prev",
  mode: "line" | "step"
) => {
  trackEvent("navigation_step", "Debugger", `${direction}_${mode}`);
};

export const trackPlaybackControl = (action: "play" | "pause" | "reset") => {
  trackEvent("playback_control", "Debugger", action);
};

export const trackLessonViewed = (
  lessonId: string,
  courseId: string,
  moduleId: string
) => {
  // Send as a label JSON string for clarity
  const label = JSON.stringify({
    lesson_id: lessonId,
    course_id: courseId,
    module_id: moduleId,
  });
  trackEvent("lesson_viewed", "Lesson", label);
};

export const trackLessonCompleted = (
  lessonId: string,
  courseId: string,
  moduleId: string
) => {
  // Send as a label JSON string for clarity
  const label = JSON.stringify({
    lesson_id: lessonId,
    course_id: courseId,
    module_id: moduleId,
  });
  trackEvent("lesson_completed", "Lesson", label);
};
