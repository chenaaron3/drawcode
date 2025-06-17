# Append to List

We can add a single element to a list using the `.append()` Python method.

Suppose we have an empty list called `garden`:

```python
garden = []
```

We can add the element "Tomatoes" by using the `.append()` method:

```python
garden.append("Tomatoes")
print(garden)
```

Will output:

```
['Tomatoes']
```

We see that `garden` now contains "Tomatoes"!

When we use `.append()` on a list that already has elements, our new element is added to the end of the list:

```python
# Create a list
garden = ["Tomatoes", "Grapes", "Cauliflower"]

# Append a new element
garden.append("Green Beans")
print(garden)
```

Will output:

```
['Tomatoes', 'Grapes', 'Cauliflower', 'Green Beans']
```

Let’s use the `.append()` method to manipulate a list.