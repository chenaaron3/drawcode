# Else If Statements

We have `if` statements, we have `else` statements, and we also have `elif` statements.

Now you may be asking yourself, what the heck is an `elif` statement? It’s exactly what it sounds like, “else if”. An `elif` statement checks another condition after the previous `if` statement's conditions aren’t met.

We can use `elif` statements to control the order we want our program to check each of our conditional statements. First, the `if` statement is checked, then each `elif` statement is checked from top to bottom, then finally the `else` code is executed if none of the previous conditions have been met.

Let’s take a look at this in practice. The following if statement will display a “thank you” message after someone donates to a charity; there will be a curated message based on how much was donated.

```python
print("Thank you for the donation!")

if donation >= 1000:
  print("You've achieved platinum status")
elif donation >= 500:
  print("You've achieved gold donor status")
elif donation >= 100:
  print("You've achieved silver donor status")
else:
  print("You've achieved bronze donor status")
```

Take a second to think about this function. What would happen if all of the `elif` statements were simply `if` statements? If you donated $1100.00, then the first three messages would all print because each `if` condition had been met.

But because we used `elif` statements, it checks each condition sequentially and only prints one message. If I donate $600.00, the code first checks if that is over 1000, which it is not, then it checks if it’s over 500, which it is, so it prints that message, then because all of the other statements are `elif` and `else`, none of them get checked and no more messages get printed.

Try your hand at some other `elif` statements.