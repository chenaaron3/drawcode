# Growing a List: Plus (+)

When we want to add multiple items to a list, we can use the `+` operator to combine two lists (this is also known as concatenation).

Below, we have a list of items sold at a bakery called `items_sold`:

```python
items_sold = ["cake", "cookie", "bread"]
```

Suppose the bakery wants to start selling "biscuit" and "tart":

```python
items_sold_new = items_sold + ["biscuit", "tart"]
print(items_sold_new)
# Prints ['cake', 'cookie', 'bread', 'biscuit', 'tart']
```

In this example, we created a new variable, `items_sold_new`, which contained both the original items sold and the new items. We can inspect the original `items_sold` and see that it did not change:

```python
print(items_sold)
# Prints ['cake', 'cookie', 'bread']
```

We can only use `+` with other lists. If we try to run this code:

```python
my_list = [1, 2, 3]
my_new_list = my_list + 4
```

we will get the following error:

```
TypeError: can only concatenate list (not "int") to list
```

If we want to add a single element using `+`, we have to put it into a list with brackets `[]`:

```python
my_new_list = my_list + [4]
print(my_new_list)
# Prints [1, 2, 3, 4]
```

Now, let’s use `+` to practice combining two lists!