class Item {
    constructor(name, type, attackPower, armor, size, emoji) {
        this.name = name;
        this.type = type;
        this.attackPower = attackPower;
        this.armor = armor;
        this.size = size;
        this.emoji = emoji;
    }
}

// Example item definitions
export const Items = {
    BasicWoodenSword: new Item(
        "Basic Wooden Sword",
        "sword",
        3,
        1,
        { rows: 3, cols: 1 },
        "🗡️"
    ),
    Rags: new Item(
        "Rags",
        "legs", // Lowercase "legs" for consistent type checking
        0,
        2,
        { rows: 1, cols: 1 }, // 1x1 size as requested
        "🥋"
    ),
};

export const items = Object.values(Items);