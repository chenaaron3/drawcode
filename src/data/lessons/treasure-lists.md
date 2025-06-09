# Treasure Lists

Discover the power of loops! Instead of writing repetitive code, use `for` loops to generate multiple treasures automatically.

## The Problem with Repetition

Without loops, generating treasures is tedious:

```python
print('Chest 1: Contains gold coins')
print('Chest 2: Contains gold coins')
print('Chest 3: Contains gold coins')
print('Chest 4: Contains gold coins')
```

## The Loop Solution

Use a `for` loop to generate treasures efficiently:

```python
print('=== TREASURE ROOM ===')
print('You found these treasures:')

for treasure_number in range(1, 5):
    print('Chest', treasure_number, ': Contains gold coins')
```

## Predict Before You Run

Before executing, predict:
- How many times will the loop run?
- What values will `treasure_number` have?
- Watch the visual debugger show `treasure_number` changing with each loop!

## Understanding `range(1, 5)`

The `range(1, 5)` function creates numbers: 1, 2, 3, 4
- Starts at 1 (included)
- Stops before 5 (excluded)
- Perfect for numbering treasures

## Loop Anatomy

Every `for` loop has these parts:
- **Loop variable**: `treasure_number` (changes each time)
- **Sequence**: `range(1, 5)` (what to loop through)
- **Loop body**: The indented code that repeats

## Adventure Applications

Loops are perfect for:
- **Loot generation**: Multiple treasure chests
- **Enemy spawning**: Waves of monsters
- **Room exploration**: Searching multiple locations
- **Inventory display**: Listing all items

## Customization Power

Easy to modify:
- `range(1, 10)` for 9 treasures
- Change the message for different loot types
- Add variety within the loop

## Key Concept

For loops eliminate repetitive code and make patterns easy to generate. They're essential for creating dynamic, scalable adventures that can handle any amount of content.

Watch how the visual debugger shows the loop variable changing with each iteration, creating multiple treasures automatically!