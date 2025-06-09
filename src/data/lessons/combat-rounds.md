# Combat Rounds

Create epic battles using loops! Combat in adventures often happens in rounds, making loops perfect for creating exciting fight sequences.

## Epic Battle Setup

Set up a dramatic multi-round battle:

```python
enemy_name = 'Shadow Dragon'
print('=== BATTLE WITH', enemy_name.upper(), '===')
print('')

for round_number in range(1, 4):
    print('Round', round_number)
    print('You attack the', enemy_name)
    print('The', enemy_name, 'roars in anger!')
    print('')
```

## Combat Flow

Each combat round follows a pattern:
- Announce the round number
- Hero attacks
- Enemy responds
- Prepare for next round

## Predict Before You Run

Before running, predict:
- How many combat rounds will there be?
- What will `.upper()` do to the enemy name?
- Watch `round_number` change in the visual debugger!

## Building Tension

Notice how the loop creates escalating drama:
- **Round structure**: Clear progression through the fight
- **Repeated conflict**: Each round builds on the last
- **Anticipation**: What happens in the final round?

## String Methods

The `.upper()` method makes text UPPERCASE:
- `'Shadow Dragon'.upper()` becomes `'SHADOW DRAGON'`
- Perfect for dramatic enemy introductions
- Makes boss names feel more imposing

## Combat Variations

You could enhance battles with:
- Different attacks each round
- Decreasing health displays
- Special moves in certain rounds
- Victory conditions based on round count

## Adventure Combat Systems

Real adventure games might track:
- Hero and enemy health each round
- Different attack types and damage
- Special abilities with cooldowns
- Victory/defeat conditions

## Key Concept

Combat loops create structured, exciting battles. They provide the framework for turn-based combat systems that are fundamental to many adventure games.

Watch how the visual debugger shows the round progression, creating an epic battle sequence!