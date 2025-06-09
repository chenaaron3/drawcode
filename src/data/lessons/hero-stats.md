# Hero Stats

Every hero needs stats to track their abilities and status! Variables let us store different types of information about our characters.

## Different Types of Hero Data

Heroes have various attributes that use different data types:

```python
hero_name = 'Marcus'      # Text (string)
hero_level = 1           # Whole number (integer)
hero_health = 100        # Whole number (integer)
hero_gold = 50           # Whole number (integer)
hero_alive = True        # True/False (boolean)
```

## Displaying Hero Status

Create a clear status display:

```python
print('=== HERO STATUS ===')
print('Name:', hero_name)
print('Level:', hero_level)
print('Health:', hero_health)
print('Gold:', hero_gold)
print('Status: Ready for adventure!')
```

## Predict Before You Run

Before running, examine your visual debugger and predict:
- Which variables will contain numbers vs. text?
- What will the `hero_alive` variable show?
- How will each stat appear in the status display?

## Understanding Data Types

Notice how variables can store:
- **Strings**: Text like names and descriptions
- **Integers**: Whole numbers like health and gold
- **Booleans**: True/False values like alive status

## Why Track Stats?

In adventures, hero stats:
- Change during gameplay (health goes up/down)
- Determine what actions are possible
- Create meaningful consequences for choices

## Key Concept

Variables are like a character sheet - they remember important information about your hero that can change throughout the adventure. Different types of data require different variable types.

Watch the visual debugger show how each stat gets stored in its own variable box with its specific data type!