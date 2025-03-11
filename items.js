class Item {
    constructor(id, name, type, attackPower, armor, size, emoji) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.attackPower = attackPower;
        this.armor = armor;
        this.size = size; // { rows: X, cols: Y }
        this.emoji = emoji;
    }

    createElement() {
        const el = document.createElement("div");
        el.classList.add("inventory-item");

        // Apply size class if vertical sword etc.
        if (this.size.cols === 1 && this.size.rows === 3) {
            el.classList.add("item-1x3");
        }

        el.textContent = `${this.emoji}`;
        el.title = `${this.name}\nAttack: ${this.attackPower}\nArmor: ${this.armor}`;
        el.dataset.itemId = this.id;
        return el;
    }
}

// Example item definitions
export const Items = {
    BasicWoodenSword: new Item(
        "BasicWoodenSword",
        "Basic Wooden Sword",
        "sword",
        3,
        1,
        { rows: 3, cols: 1 },
        "🗡️"
    ),
    Rags: new Item(
        "Rags",
        "legs",
        0,
        2,
        { rows: 1, cols: 1 },
        "🥋"
    ),
};

// Array for convenience
export const items = Object.values(Items);

// Utility: create item by id (e.g., "BasicWoodenSword")
export function createItemById(id) {
    return Items[id] ?? null;
}
