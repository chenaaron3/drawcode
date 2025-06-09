Debugging is the process of finding and fixing errors in your code.

## Types of Errors

**Syntax Errors:** Code doesn't follow Python rules

```python
print("Hello World"   # Missing closing parenthesis
```

**Runtime Errors:** Code runs but crashes

```python
number = int(input("Enter number: "))
result = 10 / number  # Crashes if user enters 0
```

**Logic Errors:** Code runs but gives wrong results

```python
# Bug: Should add, not multiply
def calculate_average(a, b):
    return (a * b) / 2  # Wrong! Should be (a + b) / 2
```

## Using the Visual Debugger

The debugger helps you:

- **Step through code** line by line
- **Watch variables** change over time
- **See execution flow** to understand your program
- **Find where errors occur**

## Debugging Strategy

1. **Read the error message** carefully
2. **Check the line number** where error occurred
3. **Use print statements** to see variable values
4. **Step through with debugger** to watch execution
5. **Test with simple inputs** first

## Common Debugging Techniques

```python
def debug_example():
    # Use print to check values
    x = 10
    y = 0
    print(f"x = {x}, y = {y}")  # Check variables

    # Add checks for problematic values
    if y == 0:
        print("Warning: y is zero!")
        y = 1  # Fix the problem

    result = x / y
    print(f"Result: {result}")
```

## Watch the Code

Use the step-by-step debugger to see exactly where problems occur and how to fix them.
