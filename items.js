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
};

export const items = Object.values(Items);