import arrayIntersection2Trace from '../../public/traces/array-intersection-2.json';
import buySellStocks2Trace from '../../public/traces/buy-sell-stocks-2.json';
import containsDuplicateTrace from '../../public/traces/contains-duplicate.json';
import maximumSubarrayTrace from '../../public/traces/maximum-subarray.json';
import removeDuplicatesTrace from '../../public/traces/remove-duplicates.json';
import reverseLinkedListTrace from '../../public/traces/reverse-linked-list.json';
import rotateArrayTrace from '../../public/traces/rotate-array.json';
import singleNumberTrace from '../../public/traces/single-number.json';
import twoSumTrace from '../../public/traces/two-sum.json';
import validParenthesesTrace from '../../public/traces/valid-parentheses.json';

import type { TraceData } from "../types/trace";

// Map of trace names to trace data
export const TRACES: Record<string, TraceData> = {
  "two-sum.json": twoSumTrace as TraceData,
  "remove-duplicates.json": removeDuplicatesTrace as TraceData,
  "array-intersection-2.json": arrayIntersection2Trace as TraceData,
  "buy-sell-stocks-2.json": buySellStocks2Trace as TraceData,
  "contains-duplicate.json": containsDuplicateTrace as TraceData,
  "rotate-array.json": rotateArrayTrace as TraceData,
  "single-number.json": singleNumberTrace as TraceData,
  "valid-parentheses.json": validParenthesesTrace as TraceData,
  "reverse-linked-list.json": reverseLinkedListTrace as TraceData,
  "maximum-subarray.json": maximumSubarrayTrace as TraceData,
};

// Helper function to get trace data by filename
export function getTraceData(filename: string): TraceData | null {
  return TRACES[filename] || null;
}

// Export available trace names
export const AVAILABLE_TRACE_FILES = Object.keys(TRACES);
