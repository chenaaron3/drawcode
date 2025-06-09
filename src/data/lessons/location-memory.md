# Location Memory

Adventures take place across many locations. Your program needs to remember important details about each place you visit!

## Location Information

Store key details about each location:

```python
current_location = 'Mystic Library'
location_visited = True
location_danger_level = 2
location_treasure = 'ancient spellbook'
location_hint = 'The librarian knows more than she reveals'
```

## Location Log Display

Present location information clearly:

```python
print('=== LOCATION LOG ===')
print('Current location:', current_location)
print('Previously visited:', location_visited)
print('Danger level:', location_danger_level)
print('Treasure found:', location_treasure)
print('Note:', location_hint)
```

## Predict Before You Run

Before running, predict:
- What different types of data are being stored?
- How does `location_visited` help track exploration?
- What might `location_danger_level` be used for?

## Why Track Locations?

Location memory helps adventures:
- **Prevent repetition**: "You've already searched this room"
- **Gate progress**: "You need the key from the tower first"
- **Create continuity**: NPCs remember previous conversations
- **Build atmosphere**: Each location feels unique and memorable

## Location Data Types

Notice the mix of data types:
- **String**: Location name, treasure, hints
- **Boolean**: Whether you've visited before
- **Integer**: Numerical ratings like danger level

## Adventure Design

Smart location tracking creates:
- **Believable worlds**: Places remember your actions
- **Strategic depth**: Some locations become more/less important
- **Narrative flow**: Story elements connect across locations

## Key Concept

Location memory makes adventure worlds feel alive and responsive. By tracking what happened where, your adventure can create meaningful consequences for player choices.

Watch the visual debugger organize all the different types of location data into clearly categorized variable boxes!