import type { LessonHook } from "@/types/lesson";

import { useBooleanExpressions } from "./hooks/boolean-expressions/useBooleanExpressions";
import { useBooleanIntroduction } from "./hooks/boolean-introduction/useBooleanIntroduction";
import { useBooleanOperatorsAnd } from "./hooks/boolean-operators-and/useBooleanOperatorsAnd";
import { useBooleanOperatorsNot } from "./hooks/boolean-operators-not/useBooleanOperatorsNot";
import { useBooleanOperatorsOr } from "./hooks/boolean-operators-or/useBooleanOperatorsOr";
import { useBooleanVariables } from "./hooks/boolean-variables/useBooleanVariables";
import { useChangingNumbers } from "./hooks/changing-numbers/useChangingNumbers";
import { useElseIfStatements } from "./hooks/else-if-statements/useElseIfStatements";
import { useElseStatements } from "./hooks/else-statements/useElseStatements";
import { useEmptyVariables } from "./hooks/empty-variables/useEmptyVariables";
import { useExponents } from "./hooks/exponents/useExponents";
import { useHelloWorld } from "./hooks/hello-world/useHelloWorld";
import { useIfStatement } from "./hooks/if-statement/useIfStatement";
import { useInitializeVariables } from "./hooks/initialize-variables/useInitializeVariables";
import { useLogicalOperatorReview } from "./hooks/logical-operator-review/useLogicalOperatorReview";
import { useModuloOperator } from "./hooks/modulo-operator/useModuloOperator";
import { useNumbers } from "./hooks/numbers/useNumbers";
import { usePlusEquals } from "./hooks/plus-equals/usePlusEquals";
import { useQuestNotes } from "./hooks/quest-notes/useQuestNotes";
import { useRelationalOperatorsII } from "./hooks/relational-operators-ii/useRelationalOperatorsIi";
import { useStringConcatenation } from "./hooks/string-concatenation/useStringConcatenation";
import { useStrings } from "./hooks/strings/useStrings";
import { useWhatIsAList } from "./hooks/what-is-a-list/useWhatIsAList";
import { useListContents } from "./hooks/list-contents/useListContents";
import { useEmptyLists } from "./hooks/empty-lists/useEmptyLists";
import { useListMethods } from "./hooks/list-methods/useListMethods";
import { useGrowingAListAppend } from "./hooks/growing-a-list-append/useGrowingAListAppend";
import { useGrowingAListPlus } from "./hooks/growing-a-list-plus/useGrowingAListPlus";

export const lessonHooks: Record<string, LessonHook> = {
  "hello-world": useHelloWorld,
  numbers: useNumbers,
  strings: useStrings,
  "quest-notes": useQuestNotes,
  "boolean-introduction": useBooleanIntroduction,
  "empty-variables": useEmptyVariables,
  "initialize-variables": useInitializeVariables,
  "changing-numbers": useChangingNumbers,
  exponents: useExponents,
  "modulo-operator": useModuloOperator,
  "string-concatenation": useStringConcatenation,
  "plus-equals": usePlusEquals,
  "boolean-expressions": useBooleanExpressions,
  "boolean-variables": useBooleanVariables,
  "if-statement": useIfStatement,
  "relational-operators-ii": useRelationalOperatorsII,
  "boolean-operators-and": useBooleanOperatorsAnd,
  "boolean-operators-or": useBooleanOperatorsOr,
  "boolean-operators-not": useBooleanOperatorsNot,
  "else-statements": useElseStatements,
  "else-if-statements": useElseIfStatements,
  "logical-operator-review": useLogicalOperatorReview,
  "what-is-a-list": useWhatIsAList,
  "list-contents": useListContents,
  "empty-lists": useEmptyLists,
  "list-methods": useListMethods,
  "growing-a-list-append": useGrowingAListAppend,
  "growing-a-list-plus": useGrowingAListPlus,
};

// Check if a lesson has a hook implementation
export function hasLessonHook(lessonId: string): boolean {
  return lessonId in lessonHooks;
}

// Get lesson hook
export function getLessonHook(lessonId: string): LessonHook | null {
  return lessonHooks[lessonId] || null;
}

// Debug: List all registered hooks
export function getRegisteredLessons(): string[] {
  return Object.keys(lessonHooks);
}
