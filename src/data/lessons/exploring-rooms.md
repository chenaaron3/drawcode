# Exploring Rooms

Use loops to explore multiple rooms in your dungeon! This creates the feeling of systematically searching through an adventure location.

## Room Exploration Loop

Explore a series of connected rooms:

```python
print('=== DUNGEON EXPLORATION ===')

for room_number in range(1, 6):
    print('Entering room', room_number)
    print('You search the room carefully...')
    print('Room', room_number, 'is clear!')
    print('')
```

## Creating Atmosphere

Notice how the loop creates a complete exploration sequence:
- Enter the room
- Search thoroughly  
- Report the results
- Move to the next room

## Predict Before You Run

Before executing, predict:
- How many rooms will you explore?
- What will happen in each room?
- Watch how `room_number` changes in the visual debugger!

## Loop Structure Benefits

Using loops for exploration:
- **Consistency**: Every room gets the same treatment
- **Scalability**: Easy to explore 5 rooms or 50 rooms
- **Immersion**: Creates a sense of methodical searching
- **Tension**: Builds anticipation for what might be found

## Adding Variety

You could enhance this by:
- Different messages for different room types
- Random encounters in some rooms
- Special events in certain rooms
- Items or clues discovered during searches

## Real Adventure Logic

In actual games, room exploration might:
- Check for monsters before declaring "clear"
- Search for hidden treasures or secrets
- Update a map as rooms are explored
- Trigger story events in specific rooms

## Key Concept

Loops make exploration feel systematic and complete. They create the satisfying rhythm of adventure games where you methodically search every location.

Watch the visual debugger show how the loop variable counts through each room, creating a complete exploration sequence!