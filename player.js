// player.js
import { Item } from "./items.js";
class Player {
  constructor() {
    // Base stats
    this.hp = 100;
    this.baseAttack = 1;
    this.baseArmor = 0;
    this.baseChanceToHit = 70;
    this.baseChanceToCrit = 1;
    // Current stats (start as base)
    this.attack = this.baseAttack;
    this.armor = this.baseArmor;
    this.chanceToHit = this.baseChanceToHit;
    this.chanceToCrit = this.baseChanceToCrit;
    // Equipment slots – added legs slot
    this.equipment = {
      mainHand: null,
      offHand: null,
      legs: null
    };
    // Inventory tracking - tracks items not currently equipped
    this.inventory = [];
  }

  recalcStats() {
    // Start with base values.
    this.attack = this.baseAttack;
    this.armor = this.baseArmor;
    // Sum bonuses from equipped items (if any).
    if (this.equipment.mainHand) {
      this.attack += Number(this.equipment.mainHand.attackPower) || 0;
      this.armor += Number(this.equipment.mainHand.armor) || 0;
    }
    if (this.equipment.offHand) {
      this.attack += Number(this.equipment.offHand.attackPower) || 0;
      this.armor += Number(this.equipment.offHand.armor) || 0;
    }
    // Add legs equipment stats
    if (this.equipment.legs) {
      this.attack += Number(this.equipment.legs.attackPower) || 0;
      this.armor += Number(this.equipment.legs.armor) || 0;
    }
    // (Chance to hit and crit could also be modified here if needed.)
  }

  equipItem(slot, item) {
    this.equipment[slot] = item;
    this.recalcStats();
  }

  unequipItem(slot) {
    this.equipment[slot] = null;
    this.recalcStats();
  }
  
  // Add item to tracked inventory (not equipped)
  addInventoryItem(item, position) {
    this.inventory.push({
      item: item,
      position: position
    });
  }
  
  // Remove item from tracked inventory
  removeInventoryItem(itemName) {
    const index = this.inventory.findIndex(inv => inv.item.name === itemName);
    if (index !== -1) {
      this.inventory.splice(index, 1);
    }
  }
  
  // Save game state to localStorage
  saveGame() {
    // Create a simplified version of equipment for storage
    const equipmentToSave = {};
    
    // For each equipment slot, store the item data if it exists
    for (const [slot, item] of Object.entries(this.equipment)) {
      if (item) {
        equipmentToSave[slot] = {
          name: item.name,
          type: item.type,
          attackPower: item.attackPower,
          armor: item.armor,
          size: item.size,
          emoji: item.emoji
        };
      } else {
        equipmentToSave[slot] = null;
      }
    }
    
    // Create the save data object
    const saveData = {
      stats: {
        hp: this.hp,
        attack: this.attack,
        armor: this.armor,
        chanceToHit: this.chanceToHit,
        chanceToCrit: this.chanceToCrit
      },
      equipment: equipmentToSave,
      inventory: this.inventory.map(inv => ({
        item: {
          name: inv.item.name,
          type: inv.item.type,
          attackPower: inv.item.attackPower,
          armor: inv.item.armor,
          size: inv.item.size,
          emoji: inv.item.emoji
        },
        position: inv.position
      }))
    };
    
    // Save to localStorage
    localStorage.setItem('gladiatorGameSave', JSON.stringify(saveData));
    console.log('Game saved successfully');
  }
  
  // Load game state from localStorage
  loadGame() {
    const saveData = localStorage.getItem('gladiatorGameSave');
    
    if (!saveData) {
      console.log('No save data found');
      return false;
    }
    
    try {
      const parsedData = JSON.parse(saveData);
      
      // Restore stats
      if (parsedData.stats) {
        this.hp = parsedData.stats.hp;
        this.attack = parsedData.stats.attack;
        this.armor = parsedData.stats.armor;
        this.chanceToHit = parsedData.stats.chanceToHit;
        this.chanceToCrit = parsedData.stats.chanceToCrit;
      }
      
      // Clear equipment first
      this.equipment = {
        mainHand: null,
        offHand: null,
        legs: null
      };
      
      // Restore equipment
      if (parsedData.equipment) {
        for (const [slot, item] of Object.entries(parsedData.equipment)) {
          if (item) {
            // Create a proper Item instance instead of just using raw data
            this.equipment[slot] = new Item(
              item.name,
              item.type,
              item.attackPower,
              item.armor,
              item.size,
              item.emoji
            );
          }
        }
      }
      
      // Save inventory data
      this.inventory = (parsedData.inventory || []).map(inv => ({
        item: new Item(
          inv.item.name,
          inv.item.type,
          inv.item.attackPower,
          inv.item.armor,
          inv.item.size,
          inv.item.emoji
        ),
        position: inv.position
      }));
      console.log('Game loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading save data:', error);
      return false;
    }
  }
}

// Updates the UI elements (assumed to have the following IDs in your HTML)
function updatePlayerStatsUI() {
  const attackEl = document.getElementById("stat-attack-power");
  const armorEl = document.getElementById("stat-armor");
  const hitEl = document.getElementById("stat-chance-to-hit");
  const critEl = document.getElementById("stat-chance-to-crit");
  if (attackEl) attackEl.textContent = player.attack;
  if (armorEl) armorEl.textContent = player.armor;
  if (hitEl) hitEl.textContent = player.chanceToHit + "%";
  if (critEl) critEl.textContent = player.chanceToCrit + "%";
}

// Save game when navigating away
function setupPageUnloadSaving() {
  window.addEventListener('beforeunload', () => {
    player.saveGame();
  });
}

export const player = new Player();
export { updatePlayerStatsUI, setupPageUnloadSaving };