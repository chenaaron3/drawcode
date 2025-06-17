import type { AST } from "./ast";

// Relationship types for container-cursor analysis
export type RelationshipType =
  | "key_access" // Variable used as index to access container elements
  | "value_access" // Variable receives values from container iteration
  | "key_assignment" // Variable used as key when assigning to container
  | "membership_test" // Variable tested for membership in container
  | "key_index" // Variable represents index in for loop iteration
  | "value_index" // Variable represents value in for loop iteration
  | "dict_key" // Variable represents key in dictionary iteration (dict.keys(), dict.items())
  | "dict_value"; // Variable represents value in dictionary iteration (dict.values(), dict.items())

export type Relationship = {
  container: string; // Name of the container variable
  cursor: string; // Name of the cursor/key variable
  type: RelationshipType;
  node_id: number; // ID of the AST node that introduced this relationship
};

export type ManualRelationship = {
  container: string; // Name of the container variable
  cursor: string; // Name of the cursor/key variable
  type: RelationshipType;
  description?: string; // Optional explanation of the relationship
};

// Augmented trace step joins the node_id with the lookup AST
export type AugmentedTraceStep = TraceStep & {
  ast: AST;
};

export type ObjectTable = Record<number, ObjectTableEntry>;
export type VarTable = Record<string, number>;
export type Locals = Record<string, any>;

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
  locals?: Locals;
  object_table?: ObjectTable;
  var_table?: VarTable;
  stdout?: string;
};

export type ObjectTableEntry = {
  type: "list" | "dict" | "set" | "int" | "float" | "str" | "bool";
  mutable: boolean;
  value: any;
};

// Trace types
export type TraceLine = {
  line_number: number;
  locals: Locals;
  object_table: ObjectTable;
  var_table: VarTable;
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
    stdout: string;
    finalLocals: Record<string, any>;
  };
  ast: AST;
  relationships: Relationship[];
  trace: TraceLine[];
  result: any;
};
