---
title: "Mutable vs Immutable in Python — Explained Visually"
date: "2025-07-01"
author: "Aaron Chen"
description: "A deep dive into how Python handles mutable and immutable types, explaining why changing a list in one place can affect it elsewhere."
---

One of the most common "gotchas" for beginner Python programmers is the concept of mutability. Why does changing a list in one part of your code sometimes cause unexpected changes elsewhere? The answer lies in the fundamental difference between mutable and immutable objects.

The key distinction is that **mutable** objects can be changed after they are created, while **immutable** objects cannot.

```python trace-id=python-mutability-1
# Lists are mutable
mutable_list = [1, 2, 3]
mutable_list[1] = 4  # This works - we can modify the list
print(mutable_list)  # Output: [1, 4, 3]

# Tuples are immutable
immutable_tuple = (1, 2, 3)
# The line below will throw a TypeError
# immutable_tuple[1] = 4
```

## Variables Are Just Labels

In Python, variables don't hold the data itself; they are merely references—or labels—pointing to objects that live in memory. This is a crucial concept to understand:

- **Variables** hold references to objects
- **Objects** live in concrete memory positions

When you write `my_list = [1, 2, 3]`, you are creating a list object in memory and making the `my_list` variable point to it. Variables don't have an associated type or size—they're simply labels attached to objects in memory.

Here's where it gets interesting:

```python trace-id=python-mutability-2
# Two variables pointing to the SAME object
label_1 = [1, 2, 3]
label_2 = label_1  # label_2 now points to the same list as label_1

print(id(label_1))  # Same memory address
print(id(label_2))  # Same memory address
```

Compare this to creating separate objects:

```python trace-id=python-mutability-3
# Two variables pointing to DIFFERENT objects
label_1 = [1, 2, 3]
label_2 = [1, 2, 3]  # Creates a new list with the same contents

print(id(label_1))  # Different memory address
print(id(label_2))  # Different memory address
```

## The Mutable Case: Lists

Lists are the classic example of a mutable type in Python. You can add, remove, or change elements without creating a new list object. This efficiency comes with a catch—it can lead to surprising behavior if you're not careful.

Consider this code:

```python trace-id=python-mutability-4
# Create a list and assign it to 'original_list'
original_list = [10, 20, 30]

# Create a new variable that points to the SAME list
aliased_list = original_list

# Modify the list using the aliased variable
aliased_list.append(40)

# Check what happened to the original list
print(original_list)  # Output: [10, 20, 30, 40]
```

Surprised? Because both variables point to the exact same list object in memory, modifying through `aliased_list` also affects `original_list`. They're two names for the same thing.

Now let's see what happens when we create separate list objects:

```python trace-id=python-mutability-5
# Create a list and assign it to 'original_list'
original_list = [10, 20, 30]

# Create a NEW list with the same contents
new_list = [10, 20, 30]

# Modify the new list
new_list.append(40)

# Check the original list
print(original_list)  # Output: [10, 20, 30] (unchanged!)
print(new_list)       # Output: [10, 20, 30, 40]
```

This time, `original_list` remains unchanged because we created a separate list object.

## The Immutable Case: Tuples and Strings

Now, let's contrast this with an immutable type like a tuple:

```python trace-id=python-mutability-6
# Create a tuple and assign it to 'original_tuple'
original_tuple = (10, 20, 30)

# Create a new variable that points to the SAME tuple
aliased_tuple = original_tuple

# Try to "modify" the tuple
aliased_tuple += (40,)  # This creates a NEW tuple!

# Check what happened
print(original_tuple)  # Output: (10, 20, 30) (unchanged)
print(aliased_tuple)   # Output: (10, 20, 30, 40) (new object)
```

Because tuples are immutable, we cannot modify the original tuple. When we use `+=`, Python creates an entirely new tuple object and makes `aliased_tuple` point to it. The original tuple remains untouched.

## Mutability in Functions

This behavior becomes particularly important when passing objects to functions:

### With Mutable Objects (Lists)

```python trace-id=python-mutability-7
def modify_list(lst):
    lst.append(4)  # Modifies the original list

numbers = [1, 2, 3]
modify_list(numbers)
print(numbers)  # Output: [1, 2, 3, 4] - Original list was modified!
```

### With Immutable Objects (Tuples)

```python trace-id=python-mutability-8
def modify_tuple(tpl):
    tpl += (4,)  # Creates a new tuple, doesn't affect the original
    return tpl

numbers = (1, 2, 3)
result = modify_tuple(numbers)
print(numbers)  # Output: (1, 2, 3) - Original tuple unchanged
print(result)   # Output: (1, 2, 3, 4) - New tuple returned
```

Understanding this distinction is crucial for writing predictable Python code. When you pass a list to a function, you're passing a reference to the original list, and any modifications the function makes will affect the original. When you pass a tuple, you can be confident it will remain unchanged.

## Why This Matters

The concept of mutability affects how assignment and function calls behave in Python:

**Use immutable types when you want safety:** If you need to ensure data doesn't change unexpectedly, choose immutable types like tuples, strings, or frozensets.

**Use mutable types when you need flexibility:** If you need to efficiently modify data in place, mutable types like lists, dictionaries, and sets are your friends.

**Remember the golden rule:** Mutability is an intrinsic property of objects, not variables. The object determines whether it can be changed—the variable that points to it is just a label.
