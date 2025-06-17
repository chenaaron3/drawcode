# If Statement

Understanding boolean variables and expressions is essential because they are the building blocks of conditional statements. The decision-making process of “Is it raining? If so, bring an umbrella” is a conditional statement.

Here it is phrased in a different way:

If it is raining, then bring an umbrella.

Can you pick out the boolean expression here?

Right, "it is raining" is the boolean expression, and this conditional statement is checking to see if it is True.

If "it is raining" == True then the rest of the conditional statement will be executed and you will bring an umbrella.

This is the form of a conditional statement:

If [it is raining], then [bring an umbrella]

In Python, it looks very similar:

```python
if is_raining:
  print("bring an umbrella")
```

You’ll notice that instead of “then” we have a colon, `:`. That tells the computer that what’s coming next is what should be executed if the condition is met. The code that should be executed is indented to show that it follows that condition.

Let’s take a look at another conditional statement:

```python
if 2 == 4 - 2: 
  print("apple")
```

Will this code print apple to the terminal?

Yes, because the condition of the if statement, `2 == 4 - 2` is True.

Let’s work through a couple more together.