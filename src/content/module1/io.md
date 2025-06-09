# Input and Output: Interactive Programs

Learn how to get information from users and display results.

## Getting User Input

```python
name = input("What's your name? ")
age = input("How old are you? ")

print("Hello,", name)
print("You are", age, "years old")
```

## Converting Input Types

```python
# input() always returns a string
age_text = input("Enter your age: ")
age_number = int(age_text)        # Convert to integer

height_text = input("Enter height: ")
height = float(height_text)       # Convert to decimal

# Or do it in one line
score = int(input("Enter score: "))
```

## Displaying Output

```python
name = "Alice"
age = 25
grade = 87.5

# Multiple ways to print
print("Hello", name)
print("Age:", age)
print("Grade:", grade, "%")

# Formatted strings (f-strings)
print(f"Hi {name}, you're {age} years old")
print(f"Your grade is {grade}%")
```

## Simple Interactive Program

```python
def calculator():
    # Get two numbers from user
    num1 = float(input("First number: "))
    num2 = float(input("Second number: "))

    # Calculate and display results
    sum_result = num1 + num2
    product = num1 * num2

    print(f"{num1} + {num2} = {sum_result}")
    print(f"{num1} × {num2} = {product}")
```

## Watch the Code

Step through the debugger to see how input is captured and output is displayed.
