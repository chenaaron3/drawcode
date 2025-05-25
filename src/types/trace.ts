import type { AST } from "./ast";

// Step types for expression-level tracing
export type TraceStep = {
  step: number;
  event:
    | "before_statement"
    | "after_statement"
    | "before_expression"
    | "after_expression";
  focus: string;
  node_id: number;
  value?: any;
  locals?: Record<string, any>;
};

// Trace types
export type TraceEntry = {
  line_number: number;
  locals: Record<string, any>;
  delta: Record<string, any> | null;
  steps: TraceStep[];
};

export type TraceData = {
  metadata: {
    code: string;
    function: string;
    inputs: {
      kwargs: Record<string, string>;
    };
  };
  ast: AST;
  trace: TraceEntry[];
  result: any;
};
