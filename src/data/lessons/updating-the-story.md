# Updating the Story

Adventures are dynamic - they change as you play! Learn how to update variables to reflect the evolving story.

## Before and After

Show how adventures change over time:

```python
# Starting conditions
hero_health = 100
gold_found = 25

print('=== BEFORE THE BATTLE ===')
print('Health:', hero_health)
print('Gold:', 0)
```

## Calculating Changes

Update variables based on adventure events:

```python
# After finding treasure and fighting
hero_health = hero_health - 30
total_gold = 0 + gold_found

print('=== AFTER THE BATTLE ===')
print('Health:', hero_health)
print('Gold:', total_gold)
```

## Predict Before You Run

Before running, predict:
- What will `hero_health` be after the battle?
- How does `hero_health - 30` work?
- What will `total_gold` equal?

## Understanding Updates

Variable updates use this pattern:
- `variable = variable + change` (increase)
- `variable = variable - change` (decrease)

## Adventure Mathematics

Common adventure calculations:
- **Health**: `health = health - damage`
- **Experience**: `xp = xp + points_earned`
- **Gold**: `gold = gold + treasure_value`
- **Items**: `arrows = arrows - arrows_used`

## Why Updates Matter

Dynamic variables create:
- **Consequences**: Actions have real effects
- **Resource management**: Players must be strategic
- **Progression**: Characters grow stronger over time
- **Tension**: Stakes feel meaningful

## Watch the Flow

Your visual debugger will show:
1. Original values stored in variables
2. Calculations being performed
3. New values replacing old ones

## Key Concept

Variable updates make adventures feel alive and responsive. Every action can change the story, creating meaningful consequences for player choices.

Watch the visual debugger show values changing as your adventure unfolds!