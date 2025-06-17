import type { ManualRelationship } from "./trace";

export interface ProblemDescription {
  questionTitle: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  link: string;
  likes: number;
  dislikes: number;
  topicTags: Array<{ name: string; slug: string }>;
  questionId: string;
  questionFrontendId: string;
  titleSlug: string;
  isPaidOnly: boolean;
  exampleTestcases: string;
  hints: string[];
  solution: {
    id: string;
    canSeeDetail: boolean;
    paidOnly: boolean;
    hasVideoSolution: boolean;
    paidOnlyVideo: boolean;
  };
  companyTagStats: any;
  similarQuestions: string;
}

export interface SpecialInput {
  key: string;
  type: string;
  output_key: string;
}

export interface Problem {
  id: string;
  number: number;
  title: string;
  inputs: Record<string, any>;
  entrypoint: string;
  solution: string;
  details: ProblemDescription | null;
  // Make optional for now
  special_inputs?: SpecialInput[];
  manualRelationships?: Array<ManualRelationship>;
}
