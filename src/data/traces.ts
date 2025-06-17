import type { TraceData } from "@/types/trace";

// Import all trace files manually
import booleanExpressionsTrace from './traces/boolean-expressions.json';
import booleanIntroductionTrace from './traces/boolean-introduction.json';
import booleanOperatorsAndTrace from './traces/boolean-operators-and.json';
import booleanOperatorsNotTrace from './traces/boolean-operators-not.json';
import booleanOperatorsOrTrace from './traces/boolean-operators-or.json';
import booleanVariablesTrace from './traces/boolean-variables.json';
import changingNumbersTrace from './traces/changing-numbers.json';
import elseIfStatementsTrace from './traces/else-if-statements.json';
import elseStatementsTrace from './traces/else-statements.json';
import emptyListsTrace from './traces/empty-lists.json';
import emptyVariablesTrace from './traces/empty-variables.json';
import exponentsTrace from './traces/exponents.json';
import growingAListAppendTrace from './traces/growing-a-list-append.json';
import growingAListPlusTrace from './traces/growing-a-list-plus.json';
import helloWorldTrace from './traces/hello-world.json';
import ifStatementTrace from './traces/if-statement.json';
import initializeVariablesTrace from './traces/initialize-variables.json';
import listContentsTrace from './traces/list-contents.json';
import listMethodsTrace from './traces/list-methods.json';
import logicalOperatorReviewTrace from './traces/logical-operator-review.json';
import moduloOperatorTrace from './traces/modulo-operator.json';
import numbersTrace from './traces/numbers.json';
import plusEqualsTrace from './traces/plus-equals.json';
import questNotesTrace from './traces/quest-notes.json';
import relationalOperatorsIiTrace from './traces/relational-operators-ii.json';
import stringConcatenationTrace from './traces/string-concatenation.json';
import stringsTrace from './traces/strings.json';
import whatIsAListTrace from './traces/what-is-a-list.json';

// Create the TRACES object with all imported traces
export const TRACES: Record<string, TraceData> = {
  "boolean-expressions": booleanExpressionsTrace as unknown as TraceData,
  "boolean-introduction": booleanIntroductionTrace as unknown as TraceData,
  "boolean-operators-and": booleanOperatorsAndTrace as unknown as TraceData,
  "boolean-operators-not": booleanOperatorsNotTrace as unknown as TraceData,
  "boolean-operators-or": booleanOperatorsOrTrace as unknown as TraceData,
  "boolean-variables": booleanVariablesTrace as unknown as TraceData,
  "changing-numbers": changingNumbersTrace as unknown as TraceData,
  "else-if-statements": elseIfStatementsTrace as unknown as TraceData,
  "else-statements": elseStatementsTrace as unknown as TraceData,
  "empty-variables": emptyVariablesTrace as unknown as TraceData,
  exponents: exponentsTrace as unknown as TraceData,
  "hello-world": helloWorldTrace as unknown as TraceData,
  "if-statement": ifStatementTrace as unknown as TraceData,
  "initialize-variables": initializeVariablesTrace as unknown as TraceData,
  "logical-operator-review": logicalOperatorReviewTrace as unknown as TraceData,
  "modulo-operator": moduloOperatorTrace as unknown as TraceData,
  numbers: numbersTrace as unknown as TraceData,
  "plus-equals": plusEqualsTrace as unknown as TraceData,
  "quest-notes": questNotesTrace as unknown as TraceData,
  "relational-operators-ii": relationalOperatorsIiTrace as unknown as TraceData,
  "string-concatenation": stringConcatenationTrace as unknown as TraceData,
  strings: stringsTrace as unknown as TraceData,
  "what-is-a-list": whatIsAListTrace as unknown as TraceData,
  "list-contents": listContentsTrace as unknown as TraceData,
  "empty-lists": emptyListsTrace as unknown as TraceData,
  "list-methods": listMethodsTrace as unknown as TraceData,
  "growing-a-list-append": growingAListAppendTrace as unknown as TraceData,
  "growing-a-list-plus": growingAListPlusTrace as unknown as TraceData,
};

// Export available problem IDs from JSON file
export const AVAILABLE_PROBLEM_IDS: string[] = Object.keys(TRACES);

// Helper function to get trace data for a specific problem
export function getTraceData(problemId: string): TraceData | undefined {
  const baseTraceData = TRACES[problemId];
  return baseTraceData;
}
