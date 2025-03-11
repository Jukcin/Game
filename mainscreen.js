// mainscreen.js - Contains the main game screen functionality
import { Items } from "./items.js";
import { player, updatePlayerStatsUI, setupPageUnloadSaving } from "./player.js";
import { 
  cellSize, 
  maxCols, 
  maxRows, 
  createItemElement, 
  setupDragAndDrop, 
  placeItemInInventory 
} from "./dragdrop.js";

document.addEventListener("DOMContentLoaded", function () {
  // Get elements from the DOM
  const inventoryGrid = document.getElementById("inventory");
  const equipmentSlots = document.querySelectorAll(".slot, .weapon-slot");
  
  // Create item overlay for the inventory
  const itemOverlay = document.createElement("div");
  itemOverlay.style.position = "absolute";
  itemOverlay.style.top = "0";
  itemOverlay.style.left = "0";
  itemOverlay.style.width = "100%";
  itemOverlay.style.height = "100%";
  itemOverlay.style.pointerEvents = "auto";
  inventoryGrid.appendChild(itemOverlay);
  
  // Make itemOverlay and player globally accessible for the drag and drop functionality
  window.itemOverlay = itemOverlay;
  window.player = player;
  window.updatePlayerStatsUI = updatePlayerStatsUI;

  // Update inventory grid styling for smaller cell size
  inventoryGrid.style.position = "relative";
  inventoryGrid.style.display = "grid";
  inventoryGrid.style.gridTemplateColumns = `repeat(${maxCols}, ${cellSize}px)`;
  inventoryGrid.style.gridTemplateRows = `repeat(${maxRows}, ${cellSize}px)`;

  // Update inventory slots for smaller cell size
  const slots = document.querySelectorAll(".inventory-slot");
  slots.forEach(slot => {
    slot.style.width = `${cellSize}px`;
    slot.style.height = `${cellSize}px`;
  });

  // Try to load saved game data
  const hasSaveData = player.loadGame();
  
  if (hasSaveData) {
    // Populate equipment slots from saved data
    if (player.equipment.legs) {
      const legSlot = document.querySelector('[data-slot-name="Legs"]');
      if (legSlot) {
        const ragsElement = createItemElement(player.equipment.legs);
        ragsElement.style.position = "";
        ragsElement.style.left = "";
        ragsElement.style.top = "";
        ragsElement.style.width = "";
        ragsElement.style.height = "";
        legSlot.innerHTML = "";
        legSlot.appendChild(ragsElement);
      }
    }
    
    if (player.equipment.mainHand) {
      const mainHandSlot = document.querySelector('[data-slot-name="Main Hand"]');
      if (mainHandSlot) {
        const itemElement = placeItemInInventory(invItem.item, invItem.position.row, invItem.position.col);
        // When we place items, track them in player's inventory
        player.addInventoryItem(itemElement._item, {
        row: invItem.position.row,
        col: invItem.position.col
        });
        mainHandSlot.innerHTML = "";
        mainHandSlot.appendChild(swordElement);
      }
    }
    
    if (player.equipment.offHand) {
      const offHandSlot = document.querySelector('[data-slot-name="Off Hand"]');
      if (offHandSlot) {
        const offHandElement = createItemElement(player.equipment.offHand);
        offHandElement.style.position = "";
        offHandElement.style.left = "";
        offHandElement.style.top = "";
        offHandElement.style.width = "";
        offHandElement.style.height = "";
        offHandSlot.innerHTML = "";
        offHandSlot.appendChild(offHandElement);
      }
    }
    
    // Recreate inventory items from saved inventory data
    player.inventory.forEach(invItem => {
        placeItemInInventory(invItem.item, invItem.position.row, invItem.position.col);
      });
  } else {
    // No save data found, initialize with default items
    
    // Add items to inventory
    const swordElement = placeItemInInventory(Items.BasicWoodenSword, 0, 0);
    
    // Track inventory item in player's inventory
    player.addInventoryItem(swordElement._item, { row: 0, col: 0 });

    // Initialize equipment - Place rags in legs slot
    const legSlot = document.querySelector('[data-slot-name="Legs"]');
    if (legSlot) {
      const ragsElement = createItemElement(Items.Rags);
      ragsElement.style.position = "";
      ragsElement.style.left = "";
      ragsElement.style.top = "";
      ragsElement.style.width = "";
      ragsElement.style.height = "";
      legSlot.innerHTML = "";
      legSlot.appendChild(ragsElement);
      player.equipItem("legs", Items.Rags);
    }
  }
  
  // Update stats display to match loaded data
  updatePlayerStatsUI();

  // Add some CSS for drag feedback
  const style = document.createElement("style");
  style.textContent = `
    .inventory-item.valid-position {
      opacity: 0.7;
      box-shadow: 0 0 10px #8f8;
    }
    .inventory-item.dragging {
      opacity: 0.5;
    }
    .inventory-slot {
      width: ${cellSize}px !important;
      height: ${cellSize}px !important;
    }
  `;
  document.head.appendChild(style);

  // Initialize drag and drop
  setupDragAndDrop(inventoryGrid, equipmentSlots);
  
  // Set up saving when navigating away from the page
  setupPageUnloadSaving();
});