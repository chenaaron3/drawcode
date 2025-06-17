# Else Statements

As you can tell from your work with conditionals, once you start including lots of `if` statements in a function the code becomes a little cluttered and clunky. Luckily, there are other tools we can use to build control flow.

`else` statements allow us to elegantly describe what we want our code to do when certain conditions are not met.

`else` statements always appear in conjunction with `if` statements. Consider our waking-up example to see how this works:

```python
if weekday:
  print("wake up at 6:30")
else:
  print("sleep in")
```

In this way, we can build `if` statements that execute different code if conditions are or are not met. This prevents us from needing to write `if` statements for each possible condition; we can instead write a blanket `else` statement for all the times the condition is not met.

Let’s return to our `if` statement for our movie streaming platform. Previously, all it did was check if the user’s age was over 13 and if so, print out a message. We can use an `else` statement to return a message in the event the user is too young to watch the movie.

```python
if age >= 13:
  print("Access granted.")
else:
  print("Sorry, you must be 13 or older to watch this movie.")
```