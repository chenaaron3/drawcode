---
title: "Mutable vs. Immutable: Why Your Python Lists Change Unexpectedly"
date: "2024-07-23"
author: "AI Assistant"
description: "A deep dive into how Python handles mutable and immutable types, explaining why changing a list in one place can affect it elsewhere."
---

# Mutable vs. Immutable: Why Your Python Lists Change Unexpectedly

One of the most common "gotchas" for Python developers, especially those coming from other languages, is the concept of mutability. Why does changing a list in one part of your code sometimes cause unexpected changes in another? The answer lies in the fundamental difference between mutable and immutable objects.

As explained in a great [Real Python article](https://realpython.com/python-mutable-vs-immutable-types/), the key distinction is that **mutable** objects can be changed after they are created, while **immutable** objects cannot.

## Variables Are Just Labels

In Python, variables don't hold the data itself; they are merely references—or labels—pointing to an object that lives in memory. When you write `my_list = [1, 2, 3]`, you are creating a list object, and making the `my_list` variable point to it.

## The Mutable Case: Lists

Lists are the classic example of a mutable type in Python. You can add, remove, or change elements without creating a new list object. This is efficient, but it can lead to surprising behavior if you're not careful.

Consider this code:

```python
# Create a list and assign it to 'original_list'
original_list = [10, 20, 30]

# Create a new variable that points to the SAME list
aliased_list = original_list

# Modify the list using the new variable
aliased_list.append(40)

# Print the original list
print(original_list)
```

What do you expect the output to be? Because both variables point to the _exact same list object_, the output will be `[10, 20, 30, 40]`.

Let's see this in action. The interactive debugger below demonstrates how a list's contents can be modified by different methods. Notice how the list object itself is being changed directly.

{{Debugger problemId="list-methods"}}

## The Immutable Case: Tuples and Strings

Now, let's contrast this with an immutable type, like a tuple. If you try to change an immutable object, Python will either raise an error or create a completely new object.

```python
my_tuple = (1, 2, 3)

# This will raise a TypeError, because tuples are immutable
# my_tuple[0] = 100

# To "change" a tuple, you must create a new one
new_tuple = my_tuple + (4,)
print(new_tuple) # Output: (1, 2, 3, 4)
print(my_tuple)  # Output: (1, 2, 3) - The original is unchanged
```

Understanding this distinction is crucial for writing predictable and bug-free Python code. When you pass a list to a function, you are passing a reference to the original list, and any modifications the function makes will affect the original. When you pass a tuple, you can be sure it will remain unchanged.
