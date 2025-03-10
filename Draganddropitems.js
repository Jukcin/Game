import { Items } from "./items.js";
import { player, updatePlayerStatsUI } from "./player.js";

document.addEventListener("DOMContentLoaded", function () {
  const inventoryGrid = document.getElementById("inventory");
  const equipmentSlots = document.querySelectorAll(".slot, .weapon-slot");
  const cellSize = 36; // Reduced from 40px to make items smaller
  let draggedItem = null;
  let offsetX = 0;
  let offsetY = 0;

  // Maximum grid boundaries
  const maxCols = 12;
  const maxRows = 5;

  const itemOverlay = document.createElement("div");
  itemOverlay.style.position = "absolute";
  itemOverlay.style.top = "0";
  itemOverlay.style.left = "0";
  itemOverlay.style.width = "100%";
  itemOverlay.style.height = "100%";
  itemOverlay.style.pointerEvents = "auto";
  inventoryGrid.appendChild(itemOverlay);

  function createItemElement(item) {
    const itemElement = document.createElement("div");
    itemElement.classList.add("inventory-item", `item-${item.size.cols}x${item.size.rows}`);
    itemElement.draggable = true;
    itemElement.innerHTML = item.emoji;
    itemElement.dataset.name = item.name;
    itemElement.dataset.type = item.type.toLowerCase(); // Convert to lowercase for consistent comparison
    itemElement.dataset.attackPower = item.attackPower;
    itemElement.dataset.armor = item.armor;
    itemElement._item = item;

    itemElement.style.position = "absolute";
    itemElement.style.zIndex = 10;
    itemElement.style.cursor = "move";
    itemElement.style.pointerEvents = "auto";

    itemElement.style.width = `${item.size.cols * cellSize - 4}px`; // Subtract 4px for border
    itemElement.style.height = `${item.size.rows * cellSize - 4}px`; // Subtract 4px for border


    itemElement.addEventListener("dragstart", (e) => {
      // If dragging from equipment slot, handle unequipping
      if (
        itemElement.parentElement &&
        (itemElement.parentElement.classList.contains("slot") ||
         itemElement.parentElement.classList.contains("weapon-slot"))
      ) {
        const currentSlotName = itemElement.parentElement.getAttribute("data-slot-name");
        
        // Unequip the item based on slot
        if (currentSlotName === "Main Hand") {
          player.unequipItem("mainHand");
        } else if (currentSlotName === "Off Hand") {
          player.unequipItem("offHand");
        } else if (currentSlotName === "Legs") {
          player.unequipItem("legs");
        }
        
        // Important: Remove the item from the slot visually and add to inventory
        itemElement.parentElement.innerHTML = ""; 
        
        // Find an empty spot in the inventory for the unequipped item
        const emptyPosition = findEmptyInventoryPosition(itemElement._item.size.cols, itemElement._item.size.rows);
        
        // Position in inventory at the empty spot
        itemElement.style.position = "absolute";
        itemElement.style.left = `${emptyPosition.col * cellSize}px`;
        itemElement.style.top = `${emptyPosition.row * cellSize}px`;
        itemElement.style.width = `${itemElement._item.size.cols * cellSize - 4}px`;
        itemElement.style.height = `${itemElement._item.size.rows * cellSize - 4}px`;
        itemOverlay.appendChild(itemElement);
        
        updatePlayerStatsUI();
      }
      
      draggedItem = itemElement;
      const rect = itemElement.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      itemElement.classList.add("dragging");
      
      // Remove any tooltip when dragging starts
      const tooltip = itemElement.querySelector(".tooltip");
      if (tooltip) tooltip.remove();
      
      // Store original position to revert if needed
      itemElement._originalLeft = itemElement.style.left;
      itemElement._originalTop = itemElement.style.top;
    });

    itemElement.addEventListener("dragend", () => {
      itemElement.classList.remove("dragging");
      // Remove tooltip if present
      const tooltip = itemElement.querySelector(".tooltip");
      if (tooltip) tooltip.remove();
      
      // FIX: Remove the valid-position class when dragging ends
      itemElement.classList.remove("valid-position");

      // If somehow the item is outside the inventory, relocate it
      const left = parseInt(itemElement.style.left) || 0;
      const top = parseInt(itemElement.style.top) || 0;
      const width = parseInt(itemElement.style.width) || cellSize;
      const height = parseInt(itemElement.style.height) || cellSize;
      
      const col = Math.floor(left / cellSize);
      const row = Math.floor(top / cellSize);
      
      // If out of bounds, find a new position
      if (col < 0 || row < 0 || col + Math.ceil(width / cellSize) > maxCols || row + Math.ceil(height / cellSize) > maxRows) {
        const emptyPosition = findEmptyInventoryPosition(itemElement._item.size.cols, itemElement._item.size.rows);
        itemElement.style.left = `${emptyPosition.col * cellSFize}px`;
        itemElement.style.top = `${emptyPosition.row * cellSize}px`;
      }
    });

    itemElement.addEventListener("mouseenter", (e) => {
      if (!itemElement.classList.contains("dragging")) {
        // Remove any existing tooltip first
        const existingTooltip = itemElement.querySelector(".tooltip");
        if (existingTooltip) existingTooltip.remove();
        
        // Create new tooltip
        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        
        // Fix the tooltip content and style
        tooltip.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 3px;">${item.name}</div>
          <div>Attack Power: ${item.attackPower}</div>
          <div>Armor: ${item.armor}</div>
          <div style="text-align: right; font-size: 10px; opacity: 0.8; margin-top: 3px;">Type: ${item.type}</div>
        `;
        
        // Set tooltip styles
        Object.assign(tooltip.style, {
          position: "absolute",
          top: "-70px", // Fixed position above item
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "6px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          whiteSpace: "nowrap",
          zIndex: "100",
          pointerEvents: "none", // Prevent tooltip from interfering with mouse events
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
        });
        
        itemElement.appendChild(tooltip);
      }
    });

    itemElement.addEventListener("mouseleave", () => {
      const tooltip = itemElement.querySelector(".tooltip");
      if (tooltip) tooltip.remove();
    });

    return itemElement;
  }

  // Helper function to get all currently placed items except the dragged one
  function getAllOtherItems(excludeItem) {
    const items = [];
    const itemElements = itemOverlay.querySelectorAll(".inventory-item");
    
    for (const item of itemElements) {
      if (item !== excludeItem) {
        const left = parseInt(item.style.left) || 0;
        const top = parseInt(item.style.top) || 0;
        const width = parseInt(item.style.width) || cellSize;
        const height = parseInt(item.style.height) || cellSize;
        
        items.push({
          col: Math.floor(left / cellSize),
          row: Math.floor(top / cellSize),
          width: Math.ceil(width / cellSize),
          height: Math.ceil(height / cellSize)
        });
      }
    }
    
    return items;
  }

  // Helper function to check if a position is occupied by existing items
  function isPositionOccupied(row, col, width, height, excludeItem = null) {
    const otherItems = getAllOtherItems(excludeItem);
    
    for (const item of otherItems) {
      // Check if the current position overlaps with any existing item
      if (
        col < item.col + item.width && 
        col + width > item.col && 
        row < item.row + item.height && 
        row + height > item.row
      ) {
        return true; // Occupied
      }
    }
    
    // Also check if the position is out of bounds
    if (col < 0 || row < 0 || col + width > maxCols || row + height > maxRows) {
      return true; // Out of bounds counts as occupied
    }
    
    return false; // Not occupied
  }

  // Function to find an empty position in the inventory
  function findEmptyInventoryPosition(width, height) {
    // Try each position in the grid
    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < maxCols; col++) {
        // Check if position is not occupied and within bounds
        if (col + width <= maxCols && row + height <= maxRows && !isPositionOccupied(row, col, width, height)) {
          return { row, col };
        }
      }
    }
    
    // If no perfect position found, try again with less strict criteria (this would be for a real game)
    // For this demo, just return a default position
    return { row: 0, col: 0 };
  }

  function setupDragAndDrop() {
    // FIX: Use document for dragging to improve reliability
    document.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (draggedItem) {
        // Get grid position
        const overlayRect = inventoryGrid.getBoundingClientRect();
        
        // Check if mouse is over the inventory grid
        if (
          e.clientX >= overlayRect.left && 
          e.clientX <= overlayRect.right && 
          e.clientY >= overlayRect.top && 
          e.clientY <= overlayRect.bottom
        ) {
          // Calculate potential position
          const x = e.clientX - overlayRect.left - offsetX;
          const y = e.clientY - overlayRect.top - offsetY;
          
          // Calculate grid coordinates
          const col = Math.floor(x / cellSize);
          const row = Math.floor(y / cellSize);
          
          // Get item dimensions
          const itemWidth = Math.ceil(parseInt(draggedItem.style.width, 10) / cellSize);
          const itemHeight = Math.ceil(parseInt(draggedItem.style.height, 10) / cellSize);
          
          // Check if valid position
          if (!isPositionOccupied(row, col, itemWidth, itemHeight, draggedItem)) {
            draggedItem.classList.add("valid-position");
          } else {
            draggedItem.classList.remove("valid-position");
          }
        } else {
          // Mouse outside inventory
          draggedItem.classList.remove("valid-position");
        }
      }
    });

    // FIX: Drop handling on document level for better reliability
    document.addEventListener("drop", (e) => {
      e.preventDefault();
      
      if (!draggedItem) return;
      
      // Remove any tooltip
      const tooltip = draggedItem.querySelector(".tooltip");
      if (tooltip) tooltip.remove();
      
      // Check if dropping on equipment slot
      let targetSlot = null;
      for (const slot of equipmentSlots) {
        const rect = slot.getBoundingClientRect();
        if (
          e.clientX >= rect.left && 
          e.clientX <= rect.right && 
          e.clientY >= rect.top && 
          e.clientY <= rect.bottom
        ) {
          targetSlot = slot;
          break;
        }
      }
      
      // If dropping on equipment slot
      if (targetSlot) {
        const type = draggedItem.dataset.type.toLowerCase();
        const slotName = targetSlot.getAttribute("data-slot-name");

        // Check if the item type matches the slot type
        let canEquip = false;
        
        if (type === "sword" && (slotName === "Main Hand" || slotName === "Off Hand")) {
          canEquip = true;
        } else if (type === "legs" && slotName === "Legs") {
          canEquip = true;
        } else if (slotName && type && slotName.toLowerCase() === type) {
          canEquip = true;
        }

        if (!canEquip) {
          alert(`This ${type} can only be equipped in the appropriate slot!`);
          // Reset to original position
          draggedItem.classList.remove("valid-position");
          return;
        }

        // Check if the slot already has an item
        if (targetSlot.querySelector(".inventory-item")) {
          // Remove existing item and place it in inventory
          const existingItem = targetSlot.querySelector(".inventory-item");
          const existingItemType = existingItem.dataset.type.toLowerCase();
          
          // First unequip the existing item
          if (slotName === "Main Hand") {
            player.unequipItem("mainHand");
          } else if (slotName === "Off Hand") {
            player.unequipItem("offHand");
          } else if (slotName === "Legs") {
            player.unequipItem("legs");
          }
          
          // Find an empty spot for the existing item
          const emptyPosition = findEmptyInventoryPosition(
            existingItem._item.size.cols, 
            existingItem._item.size.rows
          );
          
          // Move existing item to inventory
          existingItem.style.position = "absolute";
          existingItem.style.left = `${emptyPosition.col * cellSize}px`;
          existingItem.style.top = `${emptyPosition.row * cellSize}px`;
          existingItem.style.width = `${existingItem._item.size.cols * cellSize - 4}px`;
          existingItem.style.height = `${existingItem._item.size.rows * cellSize - 4}px`;
          itemOverlay.appendChild(existingItem);
        }

        // Clear the previous styling for inventory positioning
        draggedItem.style.position = "";
        draggedItem.style.left = "";
        draggedItem.style.top = "";
        draggedItem.style.width = "";
        draggedItem.style.height = "";
        draggedItem.style.zIndex = "";
        
        // FIX: Remove valid-position class
        draggedItem.classList.remove("valid-position");
        
        // Clear slot and add item
        targetSlot.innerHTML = "";
        targetSlot.appendChild(draggedItem);

        // Update player stats based on slot
        if (type === "sword") {
          if (slotName === "Main Hand") {
            player.equipItem("mainHand", draggedItem._item);
          } else if (slotName === "Off Hand") {
            player.equipItem("offHand", draggedItem._item);
          }
        } else if (type === "legs" && slotName === "Legs") {
          player.equipItem("legs", draggedItem._item);
        }

        updatePlayerStatsUI();
      } 
      // If dropping on inventory
      else {
        const overlayRect = inventoryGrid.getBoundingClientRect();
        
        // Only process if dropping within inventory bounds
        if (
          e.clientX >= overlayRect.left && 
          e.clientX <= overlayRect.right && 
          e.clientY >= overlayRect.top && 
          e.clientY <= overlayRect.bottom
        ) {
          let x = e.clientX - overlayRect.left - offsetX;
          let y = e.clientY - overlayRect.top - offsetY;
          
          // Calculate grid coordinates
          const col = Math.floor(x / cellSize);
          const row = Math.floor(y / cellSize);
          const itemWidth = Math.ceil(parseInt(draggedItem.style.width, 10) / cellSize);
          const itemHeight = Math.ceil(parseInt(draggedItem.style.height, 10) / cellSize);
          
          // Check if the position is valid (within bounds and not occupied)
          if (!isPositionOccupied(row, col, itemWidth, itemHeight, draggedItem)) {
            // Valid position, snap to grid
            draggedItem.style.left = `${col * cellSize}px`;
            draggedItem.style.top = `${row * cellSize}px`;
          } else {
            // Invalid position, find a different spot
            const emptyPosition = findEmptyInventoryPosition(itemWidth, itemHeight);
            draggedItem.style.left = `${emptyPosition.col * cellSize}px`;
            draggedItem.style.top = `${emptyPosition.row * cellSize}px`;
          }
          
          // Ensure item is properly showing in inventory
          draggedItem.style.position = "absolute";
          draggedItem.style.width = `${draggedItem._item.size.cols * cellSize - 4}px`;
          draggedItem.style.height = `${draggedItem._item.size.rows * cellSize - 4}px`;
          draggedItem.style.zIndex = "10";
          
          // FIX: Remove valid-position class
          draggedItem.classList.remove("valid-position");
          
          itemOverlay.appendChild(draggedItem);
        }
        // If outside all valid drop areas, reset to original position
        else {
          draggedItem.classList.remove("valid-position");
        }
        
        updatePlayerStatsUI();
      }
      
      draggedItem = null;
    });
  }

  function placeItemInInventory(item, startRow = 0, startCol = 0) {
    // Check if the position is already occupied
    if (isPositionOccupied(startRow, startCol, item.size.cols, item.size.rows)) {
      // Find an empty position if occupied
      const emptyPosition = findEmptyInventoryPosition(item.size.cols, item.size.rows);
      startRow = emptyPosition.row;
      startCol = emptyPosition.col;
    }
    
    const itemElement = createItemElement(item);
    const left = startCol * cellSize;
    const top = startRow * cellSize;
    itemElement.style.left = `${left}px`;
    itemElement.style.top = `${top}px`;
    itemOverlay.appendChild(itemElement);
    return itemElement;
  }

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

  // Add items to inventory - now using 0-based indexing for consistency
  placeItemInInventory(Items.BasicWoodenSword, 0, 0);

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
    player.equipItem("legs", ragsElement._item);
    updatePlayerStatsUI();
  }

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

  setupDragAndDrop();
});