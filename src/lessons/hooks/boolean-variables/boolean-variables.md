# Boolean Variables

Before we go any further, let’s talk a little bit about `True` and `False`. You may notice that when you type them in the code editor (with uppercase T and F), they appear in a different color than variables or strings. This is because `True` and `False` are their own special type: `bool`.

`True` and `False` are the only `bool` types, and any variable that is assigned one of these values is called a boolean variable.

Boolean variables can be created in several ways. The easiest way is to simply assign `True` or `False` to a variable:

```python
set_to_true = True
set_to_false = False
```

You can also set a variable equal to a boolean expression.

```python
bool_one = 5 != 7 
bool_two = 1 + 1 != 2
bool_three = 3 * 3 == 9
```

These variables now contain boolean values, so when you reference them they will only return the `True` or `False` values of the expression they were assigned.

```python
print(bool_one)    # True
print(bool_two)    # False
print(bool_three)  # True
```