You can store the results of calculations in variables. This makes your code more readable and lets you reuse calculated values.

## Basic Calculation Storage

Instead of calculating the same thing multiple times:

```python
print('Area:', 10 * 5)
print('The area is', 10 * 5, 'square units')
```

Store it once:

```python
area = length * width
print('Rectangle area:', area)
```

## Why Store Calculations?

- **Avoid repetition**: Calculate once, use many times
- **Clearer code**: `total` is easier to understand than `price * quantity`
- **Easier to change**: Update the calculation in one place

## Common Patterns

```python
# Store inputs
length = 10
width = 5

# Calculate and store result
area = length * width
```

## Key Concept

Variables aren't just for storing data you type in - they're perfect for storing the results of calculations. This makes your programs more organized and easier to understand.

Watch how the code calculates area and total cost, storing each result in a clearly named variable before displaying it.
