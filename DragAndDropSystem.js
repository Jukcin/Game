// DragAndDropSystem.js - A reusable drag and drop system for grid-based inventories

export class DragAndDropSystem {
  constructor(options) {
    // Required options
    this.inventoryGrid = options.inventoryGrid;
    this.cellSize = options.cellSize || 36;
    this.maxCols = options.maxCols || 12;
    this.maxRows = options.maxRows || 5;
    
    // Optional options
    this.equipmentSlots = options.equipmentSlots || [];
    this.onItemEquipped = options.onItemEquipped || (() => {});
    this.onItemUnequipped = options.onItemUnequipped || (() => {});
    this.onInventoryChanged = options.onInventoryChanged || (() => {});
    this.validateEquipment = options.validateEquipment || (() => true);
    
    // Internal state
    this.draggedItem = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.itemOverlay = null;
    
    // Initialize the system
    this.init();
  }
  
  init() {
    // Create overlay for items
    this.itemOverlay = document.createElement("div");
    this.itemOverlay.style.position = "absolute";
    this.itemOverlay.style.top = "0";
    this.itemOverlay.style.left = "0";
    this.itemOverlay.style.width = "100%";
    this.itemOverlay.style.height = "100%";
    this.itemOverlay.style.pointerEvents = "auto";
    this.inventoryGrid.appendChild(this.itemOverlay);
    
    // Set up the inventory grid styles
    this.inventoryGrid.style.position = "relative";
    this.inventoryGrid.style.display = "grid";
    this.inventoryGrid.style.gridTemplateColumns = `repeat(${this.maxCols}, ${this.cellSize}px)`;
    this.inventoryGrid.style.gridTemplateRows = `repeat(${this.maxRows}, ${this.cellSize}px)`;
    
    // Add CSS styles for drag feedback
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
        width: ${this.cellSize}px !important;
        height: ${this.cellSize}px !important;
      }
    `;
    document.head.appendChild(style);
    
    // Set up event listeners
    this.setupDragAndDrop();
  }
  
  createItemElement(item) {
    const itemElement = document.createElement("div");
    itemElement.classList.add("inventory-item", `item-${item.size.cols}x${item.size.rows}`);
    itemElement.draggable = true;
    itemElement.innerHTML = item.emoji || item.name.charAt(0);
    itemElement.dataset.name = item.name;
    itemElement.dataset.type = item.type.toLowerCase();
    
    // Store additional item data in dataset
    for (const [key, value] of Object.entries(item)) {
      if (typeof value !== 'object' && value !== undefined) {
        itemElement.dataset[key] = value;
      }
    }
    
    // Store the entire item object for easy access
    itemElement._item = item;

    // Style the item element
    itemElement.style.position = "absolute";
    itemElement.style.zIndex = 10;
    itemElement.style.cursor = "move";
    itemElement.style.pointerEvents = "auto";
    itemElement.style.width = `${item.size.cols * this.cellSize - 4}px`;
    itemElement.style.height = `${item.size.rows * this.cellSize - 4}px`;

    // Set up drag and drop event listeners
    this.setupItemEventListeners(itemElement);
    
    return itemElement;
  }
  
  setupItemEventListeners(itemElement) {
    // Add dragstart event
    itemElement.addEventListener("dragstart", (e) => this.handleDragStart(e, itemElement));
    
    // Add dragend event
    itemElement.addEventListener("dragend", () => this.handleDragEnd(itemElement));
    
    // Add tooltip events
    itemElement.addEventListener("mouseenter", (e) => this.showTooltip(e, itemElement));
    itemElement.addEventListener("mouseleave", () => this.hideTooltip(itemElement));
  }
  
  handleDragStart(e, itemElement) {
    // If dragging from equipment slot, handle unequipping
    if (
      itemElement.parentElement &&
      (itemElement.parentElement.classList.contains("slot") ||
       itemElement.parentElement.classList.contains("weapon-slot"))
    ) {
      const currentSlotName = itemElement.parentElement.getAttribute("data-slot-name");
      
      // Call the unequip callback with the slot and item
      this.onItemUnequipped(currentSlotName, itemElement._item);
      
      // Important: Remove the item from the slot visually and add to inventory
      itemElement.parentElement.innerHTML = ""; 
      
      // Find an empty spot in the inventory for the unequipped item
      const emptyPosition = this.findEmptyInventoryPosition(
        itemElement._item.size.cols, 
        itemElement._item.size.rows
      );
      
      // Position in inventory at the empty spot
      itemElement.style.position = "absolute";
      itemElement.style.left = `${emptyPosition.col * this.cellSize}px`;
      itemElement.style.top = `${emptyPosition.row * this.cellSize}px`;
      itemElement.style.width = `${itemElement._item.size.cols * this.cellSize - 4}px`;
      itemElement.style.height = `${itemElement._item.size.rows * this.cellSize - 4}px`;
      this.itemOverlay.appendChild(itemElement);
      
      // Call inventory changed callback
      this.onInventoryChanged();
    }
    
    // Set up dragging state
    this.draggedItem = itemElement;
    const rect = itemElement.getBoundingClientRect();
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;
    itemElement.classList.add("dragging");
    
    // Remove any tooltip when dragging starts
    const tooltip = itemElement.querySelector(".tooltip");
    if (tooltip) tooltip.remove();
    
    // Store original position to revert if needed
    itemElement._originalLeft = itemElement.style.left;
    itemElement._originalTop = itemElement.style.top;
  }
  
  handleDragEnd(itemElement) {
    itemElement.classList.remove("dragging");
    
    // Remove tooltip if present
    const tooltip = itemElement.querySelector(".tooltip");
    if (tooltip) tooltip.remove();
    
    // Remove the valid-position class
    itemElement.classList.remove("valid-position");

    // If somehow the item is outside the inventory, relocate it
    const left = parseInt(itemElement.style.left) || 0;
    const top = parseInt(itemElement.style.top) || 0;
    const width = parseInt(itemElement.style.width) || this.cellSize;
    const height = parseInt(itemElement.style.height) || this.cellSize;
    
    const col = Math.floor(left / this.cellSize);
    const row = Math.floor(top / this.cellSize);
    
    // If out of bounds, find a new position
    if (col < 0 || row < 0 || 
        col + Math.ceil(width / this.cellSize) > this.maxCols || 
        row + Math.ceil(height / this.cellSize) > this.maxRows) {
      const emptyPosition = this.findEmptyInventoryPosition(
        itemElement._item.size.cols, 
        itemElement._item.size.rows
      );
      itemElement.style.left = `${emptyPosition.col * this.cellSize}px`;
      itemElement.style.top = `${emptyPosition.row * this.cellSize}px`;
    }
  }
  
  showTooltip(e, itemElement) {
    if (!itemElement.classList.contains("dragging")) {
      // Remove any existing tooltip first
      const existingTooltip = itemElement.querySelector(".tooltip");
      if (existingTooltip) existingTooltip.remove();
      
      // Create new tooltip
      const tooltip = document.createElement("div");
      tooltip.classList.add("tooltip");
      
      // Generate tooltip content based on item properties
      let tooltipHTML = `<div style="font-weight: bold; margin-bottom: 3px;">${itemElement._item.name}</div>`;
      
      // Add all numeric properties that might be relevant
      for (const [key, value] of Object.entries(itemElement._item)) {
        if (typeof value === 'number' && key !== 'id' && 
            !key.includes('size') && !key.includes('position')) {
          tooltipHTML += `<div>${this.formatPropertyName(key)}: ${value}</div>`;
        }
      }
      
      // Add item type at the bottom
      tooltipHTML += `<div style="text-align: right; font-size: 10px; opacity: 0.8; margin-top: 3px;">Type: ${itemElement._item.type}</div>`;
      
      tooltip.innerHTML = tooltipHTML;
      
      // Set tooltip styles
      Object.assign(tooltip.style, {
        position: "absolute",
        top: "-70px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "6px 8px",
        borderRadius: "4px",
        fontSize: "12px",
        whiteSpace: "nowrap",
        zIndex: "100",
        pointerEvents: "none",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
      });
      
      itemElement.appendChild(tooltip);
    }
  }
  
  formatPropertyName(key) {
    // Convert camelCase to Title Case with spaces
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, function(str) { return str.toUpperCase(); });
  }
  
  hideTooltip(itemElement) {
    const tooltip = itemElement.querySelector(".tooltip");
    if (tooltip) tooltip.remove();
  }
  
  setupDragAndDrop() {
    // Use document for dragging to improve reliability
    document.addEventListener("dragover", (e) => this.handleDragOver(e));
    
    // Drop handling on document level for better reliability
    document.addEventListener("drop", (e) => this.handleDrop(e));
  }
  
  handleDragOver(e) {
    e.preventDefault();
    if (!this.draggedItem) return;
    
    // Get grid position
    const overlayRect = this.inventoryGrid.getBoundingClientRect();
    
    // Check if mouse is over the inventory grid
    if (
      e.clientX >= overlayRect.left && 
      e.clientX <= overlayRect.right && 
      e.clientY >= overlayRect.top && 
      e.clientY <= overlayRect.bottom
    ) {
      // Calculate potential position
      const x = e.clientX - overlayRect.left - this.offsetX;
      const y = e.clientY - overlayRect.top - this.offsetY;
      
      // Calculate grid coordinates
      const col = Math.floor(x / this.cellSize);
      const row = Math.floor(y / this.cellSize);
      
      // Get item dimensions
      const itemWidth = Math.ceil(parseInt(this.draggedItem.style.width, 10) / this.cellSize);
      const itemHeight = Math.ceil(parseInt(this.draggedItem.style.height, 10) / this.cellSize);
      
      // Check if valid position
      if (!this.isPositionOccupied(row, col, itemWidth, itemHeight, this.draggedItem)) {
        this.draggedItem.classList.add("valid-position");
      } else {
        this.draggedItem.classList.remove("valid-position");
      }
    } else {
      // Mouse outside inventory
      this.draggedItem.classList.remove("valid-position");
    }
  }
  
  handleDrop(e) {
    e.preventDefault();
    
    if (!this.draggedItem) return;
    
    // Remove any tooltip
    const tooltip = this.draggedItem.querySelector(".tooltip");
    if (tooltip) tooltip.remove();
    
    // Check if dropping on equipment slot
    let targetSlot = null;
    for (const slot of this.equipmentSlots) {
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
      this.handleEquipmentDrop(targetSlot);
    } 
    // If dropping on inventory
    else {
      this.handleInventoryDrop(e);
    }
    
    // Reset dragged item
    this.draggedItem = null;
  }
  
  handleEquipmentDrop(targetSlot) {
    const type = this.draggedItem.dataset.type.toLowerCase();
    const slotName = targetSlot.getAttribute("data-slot-name");

    // Check if the item type matches the slot type via the validateEquipment callback
    if (!this.validateEquipment(this.draggedItem._item, slotName)) {
      alert(`This ${type} cannot be equipped in the ${slotName} slot!`);
      // Remove valid-position class
      this.draggedItem.classList.remove("valid-position");
      return;
    }

    // Check if the slot already has an item
    if (targetSlot.querySelector(".inventory-item")) {
      // Remove existing item and place it in inventory
      const existingItem = targetSlot.querySelector(".inventory-item");
      
      // First unequip the existing item via callback
      this.onItemUnequipped(slotName, existingItem._item);
      
      // Find an empty spot for the existing item
      const emptyPosition = this.findEmptyInventoryPosition(
        existingItem._item.size.cols, 
        existingItem._item.size.rows
      );
      
      // Move existing item to inventory
      existingItem.style.position = "absolute";
      existingItem.style.left = `${emptyPosition.col * this.cellSize}px`;
      existingItem.style.top = `${emptyPosition.row * this.cellSize}px`;
      existingItem.style.width = `${existingItem._item.size.cols * this.cellSize - 4}px`;
      existingItem.style.height = `${existingItem._item.size.rows * this.cellSize - 4}px`;
      this.itemOverlay.appendChild(existingItem);
    }

    // Clear the previous styling for inventory positioning
    this.draggedItem.style.position = "";
    this.draggedItem.style.left = "";
    this.draggedItem.style.top = "";
    this.draggedItem.style.width = "";
    this.draggedItem.style.height = "";
    this.draggedItem.style.zIndex = "";
    
    // Remove valid-position class
    this.draggedItem.classList.remove("valid-position");
    
    // Clear slot and add item
    targetSlot.innerHTML = "";
    targetSlot.appendChild(this.draggedItem);

    // Update player stats based on slot via callback
    this.onItemEquipped(slotName, this.draggedItem._item);
  }
  
  handleInventoryDrop(e) {
    const overlayRect = this.inventoryGrid.getBoundingClientRect();
    
    // Only process if dropping within inventory bounds
    if (
      e.clientX >= overlayRect.left && 
      e.clientX <= overlayRect.right && 
      e.clientY >= overlayRect.top && 
      e.clientY <= overlayRect.bottom
    ) {
      let x = e.clientX - overlayRect.left - this.offsetX;
      let y = e.clientY - overlayRect.top - this.offsetY;
      
      // Calculate grid coordinates
      const col = Math.floor(x / this.cellSize);
      const row = Math.floor(y / this.cellSize);
      const itemWidth = Math.ceil(parseInt(this.draggedItem.style.width, 10) / this.cellSize);
      const itemHeight = Math.ceil(parseInt(this.draggedItem.style.height, 10) / this.cellSize);
      
      // Check if the position is valid (within bounds and not occupied)
      if (!this.isPositionOccupied(row, col, itemWidth, itemHeight, this.draggedItem)) {
        // Valid position, snap to grid
        this.draggedItem.style.left = `${col * this.cellSize}px`;
        this.draggedItem.style.top = `${row * this.cellSize}px`;
      } else {
        // Invalid position, find a different spot
        const emptyPosition = this.findEmptyInventoryPosition(itemWidth, itemHeight);
        this.draggedItem.style.left = `${emptyPosition.col * this.cellSize}px`;
        this.draggedItem.style.top = `${emptyPosition.row * this.cellSize}px`;
      }
      
      // Ensure item is properly showing in inventory
      this.draggedItem.style.position = "absolute";
      this.draggedItem.style.width = `${this.draggedItem._item.size.cols * this.cellSize - 4}px`;
      this.draggedItem.style.height = `${this.draggedItem._item.size.rows * this.cellSize - 4}px`;
      this.draggedItem.style.zIndex = "10";
      
      // Remove valid-position class
      this.draggedItem.classList.remove("valid-position");
      
      this.itemOverlay.appendChild(this.draggedItem);
      
      // Trigger inventory change callback
      this.onInventoryChanged();
    }
    // If outside all valid drop areas, reset to original position
    else {
      this.draggedItem.classList.remove("valid-position");
    }
  }
  
  getAllOtherItems(excludeItem) {
    const items = [];
    const itemElements = this.itemOverlay.querySelectorAll(".inventory-item");
    
    for (const item of itemElements) {
      if (item !== excludeItem) {
        const left = parseInt(item.style.left) || 0;
        const top = parseInt(item.style.top) || 0;
        const width = parseInt(item.style.width) || this.cellSize;
        const height = parseInt(item.style.height) || this.cellSize;
        
        items.push({
          col: Math.floor(left / this.cellSize),
          row: Math.floor(top / this.cellSize),
          width: Math.ceil(width / this.cellSize),
          height: Math.ceil(height / this.cellSize)
        });
      }
    }
    
    return items;
  }
  
  isPositionOccupied(row, col, width, height, excludeItem = null) {
    const otherItems = this.getAllOtherItems(excludeItem);
    
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
    if (col < 0 || row < 0 || col + width > this.maxCols || row + height > this.maxRows) {
      return true; // Out of bounds counts as occupied
    }
    
    return false; // Not occupied
  }
  
  findEmptyInventoryPosition(width, height) {
    // Try each position in the grid
    for (let row = 0; row < this.maxRows; row++) {
      for (let col = 0; col < this.maxCols; col++) {
        // Check if position is not occupied and within bounds
        if (col + width <= this.maxCols && row + height <= this.maxRows && 
            !this.isPositionOccupied(row, col, width, height)) {
          return { row, col };
        }
      }
    }
    
    // If no perfect position found, return default position
    return { row: 0, col: 0 };
  }
  
  placeItemInInventory(item, startRow = 0, startCol = 0) {
    // Check if the position is already occupied
    if (this.isPositionOccupied(startRow, startCol, item.size.cols, item.size.rows)) {
      // Find an empty position if occupied
      const emptyPosition = this.findEmptyInventoryPosition(item.size.cols, item.size.rows);
      startRow = emptyPosition.row;
      startCol = emptyPosition.col;
    }
    
    const itemElement = this.createItemElement(item);
    const left = startCol * this.cellSize;
    const top = startRow * this.cellSize;
    itemElement.style.left = `${left}px`;
    itemElement.style.top = `${top}px`;
    this.itemOverlay.appendChild(itemElement);
    return itemElement;
  }
  
  placeItemInEquipmentSlot(item, slotName) {
    // Find the slot with matching name
    const slot = Array.from(this.equipmentSlots).find(
      slot => slot.getAttribute('data-slot-name') === slotName
    );
    
    if (!slot) {
      console.error(`Slot "${slotName}" not found`);
      return null;
    }
    
    // Create item element
    const itemElement = this.createItemElement(item);
    
    // Clear the slot and reset styling for equipment
    itemElement.style.position = "";
    itemElement.style.left = "";
    itemElement.style.top = "";
    itemElement.style.width = "";
    itemElement.style.height = "";
    
    // Clear the slot first
    slot.innerHTML = "";
    
    // Add the item to the slot
    slot.appendChild(itemElement);
    
    // Update equipment via callback
    this.onItemEquipped(slotName, item);
    
    return itemElement;
  }
  
  // Helpers for external usage
  getAllInventoryItems() {
    return Array.from(this.itemOverlay.querySelectorAll(".inventory-item"))
      .map(element => element._item);
  }
  
  getEquippedItems() {
    const equipped = {};
    
    for (const slot of this.equipmentSlots) {
      const slotName = slot.getAttribute('data-slot-name');
      const itemElement = slot.querySelector('.inventory-item');
      
      if (itemElement && itemElement._item) {
        equipped[slotName] = itemElement._item;
      }
    }
    
    return equipped;
  }
  
  clearInventory() {
    this.itemOverlay.innerHTML = '';
  }
}