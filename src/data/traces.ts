import threeSumTrace from '../../public/traces/3sum.json';
import addDigitsTrace from '../../public/traces/add-digits.json';
import addTwoNumbersTrace from '../../public/traces/add-two-numbers.json';
import arrayIntersection2Trace from '../../public/traces/array-intersection-2.json';
import bestTimeBuySellStockTrace from '../../public/traces/best-time-buy-sell-stock.json';
import binaryTreeInorderTraversalTrace from '../../public/traces/binary-tree-inorder-traversal.json';
import binaryTreePostorderTraversalTrace from '../../public/traces/binary-tree-postorder-traversal.json';
import binaryTreePreorderTraversalTrace from '../../public/traces/binary-tree-preorder-traversal.json';
import buySellStocks2Trace from '../../public/traces/buy-sell-stocks-2.json';
import climbingStairsTrace from '../../public/traces/climbing-stairs.json';
import containerWithMostWaterTrace from '../../public/traces/container-with-most-water.json';
import containsDuplicateTrace from '../../public/traces/contains-duplicate.json';
import countPrimesTrace from '../../public/traces/count-primes.json';
import deleteNodeLinkedListTrace from '../../public/traces/delete-node-linked-list.json';
import excelSheetColumnNumberTrace from '../../public/traces/excel-sheet-column-number.json';
import excelSheetColumnTitleTrace from '../../public/traces/excel-sheet-column-title.json';
import factorialTrailingZeroesTrace from '../../public/traces/factorial-trailing-zeroes.json';
import findDisappearedNumbersTrace from '../../public/traces/find-disappeared-numbers.json';
import firstUniqueCharacterTrace from '../../public/traces/first-unique-character.json';
import fizzBuzzTrace from '../../public/traces/fizz-buzz.json';
import happyNumberTrace from '../../public/traces/happy-number.json';
import houseRobberTrace from '../../public/traces/house-robber.json';
import implementQueueUsingStacksTrace from '../../public/traces/implement-queue-using-stacks.json';
import implementStackUsingQueuesTrace from '../../public/traces/implement-stack-using-queues.json';
import intersectionTwoLinkedListsTrace from '../../public/traces/intersection-two-linked-lists.json';
import invertBinaryTreeTrace from '../../public/traces/invert-binary-tree.json';
import isomorphicStringsTrace from '../../public/traces/isomorphic-strings.json';
import linkedListCycleTrace from '../../public/traces/linked-list-cycle.json';
import longestPalindromicSubstringTrace from '../../public/traces/longest-palindromic-substring.json';
import longestSubstringWithoutRepeatingTrace from '../../public/traces/longest-substring-without-repeating.json';
import majorityElementTrace from '../../public/traces/majority-element.json';
import maximumDepthBinaryTreeTrace from '../../public/traces/maximum-depth-binary-tree.json';
import maximumSubarrayTrace from '../../public/traces/maximum-subarray.json';
import medianTwoSortedArraysTrace from '../../public/traces/median-two-sorted-arrays.json';
import mergeSortedArrayTrace from '../../public/traces/merge-sorted-array.json';
import mergeTwoSortedListsTrace from '../../public/traces/merge-two-sorted-lists.json';
import minStackTrace from '../../public/traces/min-stack.json';
import missingNumberTrace from '../../public/traces/missing-number.json';
import moveZeroesTrace from '../../public/traces/move-zeroes.json';
import palindromicSubstringsTrace from '../../public/traces/palindromic-substrings.json';
import pascalsTriangleIiTrace from '../../public/traces/pascals-triangle-ii.json';
import pascalsTriangleTrace from '../../public/traces/pascals-triangle.json';
import powerOfTwoTrace from '../../public/traces/power-of-two.json';
import removeDuplicatesTrace from '../../public/traces/remove-duplicates.json';
import removeLinkedListElementsTrace from '../../public/traces/remove-linked-list-elements.json';
import reverseLinkedListTrace from '../../public/traces/reverse-linked-list.json';
import rotateArrayTrace from '../../public/traces/rotate-array.json';
import sameTreeTrace from '../../public/traces/same-tree.json';
import searchInsertPositionTrace from '../../public/traces/search-insert-position.json';
import singleNumberTrace from '../../public/traces/single-number.json';
import symmetricTreeTrace from '../../public/traces/symmetric-tree.json';
import twoSumTrace from '../../public/traces/two-sum.json';
import uglyNumberTrace from '../../public/traces/ugly-number.json';
import validAnagramTrace from '../../public/traces/valid-anagram.json';
import validPalindromeTrace from '../../public/traces/valid-palindrome.json';
import validParenthesesTrace from '../../public/traces/valid-parentheses.json';

import type { TraceData } from "../types/trace";

// Map of trace names to trace data
export const TRACES: Record<string, TraceData> = {
  "add-digits.json": addDigitsTrace as TraceData,
  "add-two-numbers.json": addTwoNumbersTrace as TraceData,
  "array-intersection-2.json": arrayIntersection2Trace as TraceData,
  "best-time-buy-sell-stock.json": bestTimeBuySellStockTrace as TraceData,
  "binary-tree-inorder-traversal.json":
    binaryTreeInorderTraversalTrace as TraceData,
  "binary-tree-postorder-traversal.json":
    binaryTreePostorderTraversalTrace as TraceData,
  "binary-tree-preorder-traversal.json":
    binaryTreePreorderTraversalTrace as TraceData,
  "buy-sell-stocks-2.json": buySellStocks2Trace as TraceData,
  "climbing-stairs.json": climbingStairsTrace as TraceData,
  "container-with-most-water.json": containerWithMostWaterTrace as TraceData,
  "contains-duplicate.json": containsDuplicateTrace as TraceData,
  "count-primes.json": countPrimesTrace as TraceData,
  "delete-node-linked-list.json": deleteNodeLinkedListTrace as TraceData,
  "excel-sheet-column-number.json": excelSheetColumnNumberTrace as TraceData,
  "excel-sheet-column-title.json": excelSheetColumnTitleTrace as TraceData,
  "factorial-trailing-zeroes.json": factorialTrailingZeroesTrace as TraceData,
  "find-disappeared-numbers.json": findDisappearedNumbersTrace as TraceData,
  "first-unique-character.json": firstUniqueCharacterTrace as TraceData,
  "fizz-buzz.json": fizzBuzzTrace as TraceData,
  "happy-number.json": happyNumberTrace as TraceData,
  "house-robber.json": houseRobberTrace as TraceData,
  "implement-queue-using-stacks.json":
    implementQueueUsingStacksTrace as TraceData,
  "implement-stack-using-queues.json":
    implementStackUsingQueuesTrace as TraceData,
  "intersection-two-linked-lists.json":
    intersectionTwoLinkedListsTrace as TraceData,
  "invert-binary-tree.json": invertBinaryTreeTrace as TraceData,
  "isomorphic-strings.json": isomorphicStringsTrace as TraceData,
  "linked-list-cycle.json": linkedListCycleTrace as TraceData,
  "longest-palindromic-substring.json":
    longestPalindromicSubstringTrace as TraceData,
  "longest-substring-without-repeating.json":
    longestSubstringWithoutRepeatingTrace as TraceData,
  "majority-element.json": majorityElementTrace as TraceData,
  "maximum-depth-binary-tree.json": maximumDepthBinaryTreeTrace as TraceData,
  "maximum-subarray.json": maximumSubarrayTrace as TraceData,
  "median-two-sorted-arrays.json": medianTwoSortedArraysTrace as TraceData,
  "merge-sorted-array.json": mergeSortedArrayTrace as TraceData,
  "merge-two-sorted-lists.json": mergeTwoSortedListsTrace as TraceData,
  "min-stack.json": minStackTrace as TraceData,
  "missing-number.json": missingNumberTrace as TraceData,
  "move-zeroes.json": moveZeroesTrace as TraceData,
  "palindromic-substrings.json": palindromicSubstringsTrace as TraceData,
  "pascals-triangle.json": pascalsTriangleTrace as TraceData,
  "pascals-triangle-ii.json": pascalsTriangleIiTrace as TraceData,
  "power-of-two.json": powerOfTwoTrace as TraceData,
  "remove-duplicates.json": removeDuplicatesTrace as TraceData,
  "remove-linked-list-elements.json":
    removeLinkedListElementsTrace as TraceData,
  "reverse-linked-list.json": reverseLinkedListTrace as TraceData,
  "rotate-array.json": rotateArrayTrace as TraceData,
  "same-tree.json": sameTreeTrace as TraceData,
  "search-insert-position.json": searchInsertPositionTrace as TraceData,
  "single-number.json": singleNumberTrace as TraceData,
  "symmetric-tree.json": symmetricTreeTrace as TraceData,
  "3sum.json": threeSumTrace as TraceData,
  "two-sum.json": twoSumTrace as TraceData,
  "ugly-number.json": uglyNumberTrace as TraceData,
  "valid-anagram.json": validAnagramTrace as TraceData,
  "valid-palindrome.json": validPalindromeTrace as TraceData,
  "valid-parentheses.json": validParenthesesTrace as TraceData,
};

// Helper function to get trace data by filename
export function getTraceData(filename: string): TraceData | null {
  return TRACES[filename] || null;
}

// Export available trace names
export const AVAILABLE_TRACE_FILES = Object.keys(TRACES);
