export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetSelector: string;
  position: "top" | "bottom" | "left" | "right";
}
