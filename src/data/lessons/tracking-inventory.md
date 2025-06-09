# Tracking Inventory

Every adventurer collects items along their journey! Let's create an inventory system to track what your hero is carrying.

## Storing Inventory Items

Use variables to remember each item:

```python
item_1 = 'healing potion'
item_2 = 'rusty key'
item_3 = 'mysterious map'
item_count = 3
inventory_full = False
```

## Inventory Display

Create a clear inventory screen:

```python
print('=== INVENTORY ===')
print('Item 1:', item_1)
print('Item 2:', item_2)  
print('Item 3:', item_3)
print('Total items:', item_count)
print('Inventory full:', inventory_full)
```

## Predict Before You Run

Before executing, predict:
- Which variables contain item names vs. item information?
- What does `item_count` track?
- What will `inventory_full` show, and why might this be useful?

## Inventory Management

Notice how we track:
- **Individual items**: Each item gets its own variable
- **Item count**: How many items total
- **Inventory status**: Whether there's room for more

## Adventure Item Types

Common adventure items include:
- **Consumables**: Potions, food, scrolls
- **Tools**: Keys, maps, rope
- **Treasures**: Gems, coins, artifacts
- **Equipment**: Weapons, armor, charms

## Real Adventure Logic

In a real game, you might check:
- "Do I have the key to open this door?"
- "Do I have a potion to heal myself?"
- "Is my inventory too full to pick up this treasure?"

## Key Concept

Inventory systems use variables to track what players own. This information affects what actions are possible and helps create meaningful gameplay choices.

Watch how the visual debugger organizes each item and status into separate, clearly labeled variable boxes!