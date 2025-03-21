// GladiatorInventory.js - Implementation of the inventory system for the gladiator game

import { DragAndDropSystem } from "./DragAndDropSystem.js";
import { Items } from "./items.js";
import { player, updatePlayerStatsUI } from "./player.js";

document.addEventListener("DOMContentLoaded", function () {
  const inventoryGrid = document.getElementById("inventory");
  const equipmentSlots = document.querySelectorAll(".slot, .weapon-slot");
  const cellSize = 36; // Cell size for the grid

  // Initialize the drag and drop system with game-specific options
  const inventorySystem = new DragAndDropSystem({
    inventoryGrid: inventoryGrid,
    cellSize: cellSize,
    maxCols: 12,
    maxRows: 5,
    equipmentSlots: equipmentSlots,
    
    // Callback when an item is equipped
    onItemEquipped: (slotName, item) => {
      // Update player stats based on slot
      if (slotName === "Main Hand") {
        player.equipItem("mainHand", item);
      } else if (slotName === "Off Hand") {
        player.equipItem("offHand", item);
      } else if (slotName === "Legs") {
        player.equipItem("legs", item);
      }
      
      updatePlayerStatsUI();
    },
    
    // Callback when an item is unequipped
    onItemUnequipped: (slotName, item) => {
      // Update player stats based on slot
      if (slotName === "Main Hand") {
        player.unequipItem("mainHand");
      } else if (slotName === "Off Hand") {
        player.unequipItem("offHand");
      } else if (slotName === "Legs") {
        player.unequipItem("legs");
      }
      
      updatePlayerStatsUI();
    },
    
    // Callback when inventory changes
    onInventoryChanged: () => {
      updatePlayerStatsUI();
    },
    
    // Validate equipment placement
    validateEquipment: (item, slotName) => {
      const type = item.type.toLowerCase();
      
      // Check if the item type matches the slot type
      if (type === "sword" && (slotName === "Main Hand" || slotName === "Off Hand")) {
        return true;
      } else if (type === "legs" && slotName === "Legs") {
        return true;
      } else if (slotName && type && slotName.toLowerCase() === type) {
        return true;
      }
      
      return false;
    }
  });

  // Add initial items to the inventory
  inventorySystem.placeItemInInventory(Items.BasicWoodenSword, 0, 0);

  // Add initial equipment
  const ragsItem = Items.Rags;
  inventorySystem.placeItemInEquipmentSlot(ragsItem, "Legs");
  
  // Update UI to reflect initial stats
  updatePlayerStatsUI();
});