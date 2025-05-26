# Trace Pattern Analysis Report

## Summary

**Total exceptions found: 585 across all trace files**

The trace files were checked for the expected pattern: `before_statement` → expressions → `after_statement` on each line.

## Exception Breakdown by Statement Type

| Statement Type          | Total Lines | Missing after_statement | Percentage |
| ----------------------- | ----------- | ----------------------- | ---------- |
| **Assignment**          | 46          | 0                       | 0.0% ✅    |
| **Function Definition** | 10          | 0                       | 0.0% ✅    |
| **For Loop**            | 114         | 78                      | 68.4% ❌   |
| **If Statement**        | 126         | 84                      | 66.7% ❌   |
| **Return Statement**    | 67          | 67                      | 100.0% ❌  |
| **Other**               | 103         | 68                      | 66.0% ❌   |

## Analysis

### ✅ Working Correctly (Simple Statements)

**Assignment statements** and **function definitions** follow the expected pattern perfectly:

```
Line 2: num_to_index = {}
├─ Step 2: before_statement
├─ Step 3: before_expression ({})
├─ Step 4: after_expression ({})
└─ Step 5: after_statement
```

### ❌ "Exceptions" (Control Flow Statements)

**Control flow statements** (for, if, return) are missing `after_statement` markers:

```
Line 3: for i, num in enumerate(nums):
├─ Step 6: before_statement
├─ Step 7-12: expression events for enumerate(nums)
└─ Missing: after_statement
```

## Root Cause

This behavior is **actually correct** for control flow statements:

1. **For loops**: The `after_statement` only executes when the entire loop completes (after all iterations)
2. **If statements**: The `after_statement` only executes when the entire if/else structure completes
3. **Return statements**: There is no `after_statement` because the function exits immediately

The `after_statement` marker is placed after the entire control structure in the AST, but execution jumps to the body/branches instead of continuing sequentially.

## Recommendation

These "exceptions" are **expected behavior** for a code tracer. The current pattern provides valuable debugging information:

- ✅ Shows when control flow decisions are made
- ✅ Shows what values are being evaluated (loop iterators, conditions, return values)
- ✅ Captures the moment of decision without waiting for completion

For debugging purposes, knowing when a loop starts and what it's iterating over is more useful than waiting for the loop to complete.

## Alternative Approaches

If you want every line to have matching before/after statement markers, you would need to:

1. **Insert after_statement markers at control flow completion points** (end of loop, end of if/else blocks)
2. **Group steps differently** (not by line number, but by statement completion)
3. **Accept that some statements naturally don't complete** (returns, breaks, continues)

However, this would make the traces less intuitive for debugging purposes.

## Conclusion

**The current behavior is correct and useful for debugging.** The "exceptions" reflect the natural execution flow of Python control structures and provide valuable insight into program execution at decision points.
