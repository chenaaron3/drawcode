# Relational Operators II

Now that we’ve added conditional statements to our toolkit for building control flow, let’s explore more ways to create boolean expressions. So far we know two relational operators, equals and not equals, but there are a few more:

- `>` greater than
- `>=` greater than or equal to
- `<` less than
- `<=` less than or equal to

Let’s say we’re running a movie streaming platform and we want to write a program that checks if our users are over 13 when showing them a PG-13 movie. We could write something like:

```python
if age <= 13:
  print("Sorry, parental control required")
```

This function will take the user’s age and compare it to the number 13. If age is less than or equal to 13, it will print out a message.

Let’s try some more!

## Tasks

### Task 1
Create an if statement that checks if `x` and `y` are equal. Print "These numbers are the same" if so.

### Task 2
The nearby college requires students to earn 120 credits to graduate.

Write an if statement that checks if the student has enough credits to graduate. If they do, print "You have enough credits to graduate!"

Can a student with 120 credits graduate from the college?