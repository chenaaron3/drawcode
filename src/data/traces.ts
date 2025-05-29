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

// Map of problem IDs to trace data
export const TRACES: Record<string, TraceData> = {
  "add-digits": addDigitsTrace as TraceData,
  "add-two-numbers": addTwoNumbersTrace as TraceData,
  "array-intersection-2": arrayIntersection2Trace as TraceData,
  "best-time-buy-sell-stock": bestTimeBuySellStockTrace as TraceData,
  "binary-tree-inorder-traversal": binaryTreeInorderTraversalTrace as TraceData,
  "binary-tree-postorder-traversal":
    binaryTreePostorderTraversalTrace as TraceData,
  "binary-tree-preorder-traversal":
    binaryTreePreorderTraversalTrace as TraceData,
  "buy-sell-stocks-2": buySellStocks2Trace as TraceData,
  "climbing-stairs": climbingStairsTrace as TraceData,
  "container-with-most-water": containerWithMostWaterTrace as TraceData,
  "contains-duplicate": containsDuplicateTrace as TraceData,
  "count-primes": countPrimesTrace as TraceData,
  "delete-node-linked-list": deleteNodeLinkedListTrace as TraceData,
  "excel-sheet-column-number": excelSheetColumnNumberTrace as TraceData,
  "excel-sheet-column-title": excelSheetColumnTitleTrace as TraceData,
  "factorial-trailing-zeroes": factorialTrailingZeroesTrace as TraceData,
  "find-disappeared-numbers": findDisappearedNumbersTrace as TraceData,
  "first-unique-character": firstUniqueCharacterTrace as TraceData,
  "fizz-buzz": fizzBuzzTrace as TraceData,
  "happy-number": happyNumberTrace as TraceData,
  "house-robber": houseRobberTrace as TraceData,
  "implement-queue-using-stacks": implementQueueUsingStacksTrace as TraceData,
  "implement-stack-using-queues": implementStackUsingQueuesTrace as TraceData,
  "intersection-two-linked-lists": intersectionTwoLinkedListsTrace as TraceData,
  "invert-binary-tree": invertBinaryTreeTrace as TraceData,
  "isomorphic-strings": isomorphicStringsTrace as TraceData,
  "linked-list-cycle": linkedListCycleTrace as TraceData,
  "longest-palindromic-substring":
    longestPalindromicSubstringTrace as TraceData,
  "longest-substring-without-repeating":
    longestSubstringWithoutRepeatingTrace as TraceData,
  "majority-element": majorityElementTrace as TraceData,
  "maximum-depth-binary-tree": maximumDepthBinaryTreeTrace as TraceData,
  "maximum-subarray": maximumSubarrayTrace as TraceData,
  "median-two-sorted-arrays": medianTwoSortedArraysTrace as TraceData,
  "merge-sorted-array": mergeSortedArrayTrace as TraceData,
  "merge-two-sorted-lists": mergeTwoSortedListsTrace as TraceData,
  "min-stack": minStackTrace as TraceData,
  "missing-number": missingNumberTrace as TraceData,
  "move-zeroes": moveZeroesTrace as TraceData,
  "palindromic-substrings": palindromicSubstringsTrace as TraceData,
  "pascals-triangle": pascalsTriangleTrace as TraceData,
  "pascals-triangle-ii": pascalsTriangleIiTrace as TraceData,
  "power-of-two": powerOfTwoTrace as TraceData,
  "remove-duplicates": removeDuplicatesTrace as TraceData,
  "remove-linked-list-elements": removeLinkedListElementsTrace as TraceData,
  "reverse-linked-list": reverseLinkedListTrace as TraceData,
  "rotate-array": rotateArrayTrace as TraceData,
  "same-tree": sameTreeTrace as TraceData,
  "search-insert-position": searchInsertPositionTrace as TraceData,
  "single-number": singleNumberTrace as TraceData,
  "symmetric-tree": symmetricTreeTrace as TraceData,
  "3sum": threeSumTrace as TraceData,
  "two-sum": twoSumTrace as TraceData,
  "ugly-number": uglyNumberTrace as TraceData,
  "valid-anagram": validAnagramTrace as TraceData,
  "valid-palindrome": validPalindromeTrace as TraceData,
  "valid-parentheses": validParenthesesTrace as TraceData,
};

// Helper function to get trace data by problem ID
export function getTraceData(problemId: string): TraceData | null {
  return TRACES[problemId] || null;
}

// Export available problem IDs
export const AVAILABLE_PROBLEM_IDS = ["two-sum"]; // Object.keys(TRACES);
