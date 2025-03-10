import { Items } from "./items.js";

document.addEventListener("DOMContentLoaded", function () {
  const inventoryGrid = document.getElementById("inventory");
  const equipmentSlots = document.querySelectorAll(".slot, .weapon-slot");
  const cellSize = 40; // each grid cell is 40x40 px
  let draggedItem = null;
  let offsetX = 0;
  let offsetY = 0;

  // Create an overlay container for items so the underlying grid remains untouched.
  const itemOverlay = document.createElement("div");
  itemOverlay.style.position = "absolute";
  itemOverlay.style.top = "0";
  itemOverlay.style.left = "0";
  itemOverlay.style.width = "100%";
  itemOverlay.style.height = "100%";
  // Allow pointer events so that drop events fire
  itemOverlay.style.pointerEvents = "auto";
  inventoryGrid.appendChild(itemOverlay);

  // When creating an item, enable pointer events on the item itself.
  function createItemElement(item) {
    const itemElement = document.createElement("div");
    itemElement.classList.add("inventory-item", `item-${item.size.cols}x${item.size.rows}`);
    itemElement.draggable = true;
    itemElement.innerHTML = item.emoji;
    itemElement.dataset.name = item.name;
    itemElement.dataset.type = item.type;
    itemElement.dataset.attackPower = item.attackPower;
    itemElement.dataset.armor = item.armor;
    // Items in the overlay are absolutely positioned.
    itemElement.style.position = "absolute";
    itemElement.style.zIndex = 10;
    itemElement.style.cursor = "move";
    // Allow events on the item.
    itemElement.style.pointerEvents = "auto";

    itemElement.addEventListener("dragstart", (e) => {
      // If the item is not in the overlay (i.e. it's in an equipment slot),
      // re-attach it to the overlay and recalc its position relative to the grid.
      if (itemElement.parentElement !== itemOverlay) {
        const gridRect = inventoryGrid.getBoundingClientRect();
        const itemRect = itemElement.getBoundingClientRect();
        const left = itemRect.left - gridRect.left;
        const top = itemRect.top - gridRect.top;
        itemElement.style.position = "absolute";
        itemElement.style.left = `${left}px`;
        itemElement.style.top = `${top}px`;
        itemOverlay.appendChild(itemElement);
      }
      draggedItem = itemElement;
      const rect = itemElement.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      itemElement.classList.add("dragging");
    });

    itemElement.addEventListener("dragend", () => {
      itemElement.classList.remove("dragging");
      // Remove any lingering tooltip on drag end.
      const tooltip = itemElement.querySelector(".tooltip");
      if (tooltip) tooltip.remove();
    });

    itemElement.addEventListener("mouseenter", () => {
      if (!itemElement.classList.contains("dragging")) {
        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        tooltip.innerHTML = `<strong>${item.name}</strong><br>Attack Power: ${item.attackPower}<br>Armor: ${item.armor}`;
        itemElement.appendChild(tooltip);
      }
    });

    itemElement.addEventListener("mouseleave", () => {
      const tooltip = itemElement.querySelector(".tooltip");
      if (tooltip) tooltip.remove();
    });

    return itemElement;
  }

  // Setup drag-and-drop on the overlay and equipment slots.
  function setupDragAndDrop() {
    // Allow dropping on the overlay.
    itemOverlay.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    itemOverlay.addEventListener("drop", (e) => {
      e.preventDefault();
      if (draggedItem) {
        // Remove any tooltip before repositioning.
        const tooltip = draggedItem.querySelector(".tooltip");
        if (tooltip) tooltip.remove();

        const overlayRect = itemOverlay.getBoundingClientRect();
        let x = e.clientX - overlayRect.left - offsetX;
        let y = e.clientY - overlayRect.top - offsetY;
        // Snap coordinates to the grid.
        const snappedX = Math.floor(x / cellSize) * cellSize;
        const snappedY = Math.floor(y / cellSize) * cellSize;
        // Boundaries (assuming inventory grid is 12 cols x 5 rows).
        const maxX = inventoryGrid.clientWidth - parseInt(draggedItem.style.width, 10);
        const maxY = inventoryGrid.clientHeight - parseInt(draggedItem.style.height, 10);
        draggedItem.style.left = `${Math.min(Math.max(0, snappedX), maxX)}px`;
        draggedItem.style.top = `${Math.min(Math.max(0, snappedY), maxY)}px`;
      }
    });

    // Equipment slots drop zone.
    equipmentSlots.forEach((slot) => {
      slot.addEventListener("dragover", (e) => e.preventDefault());
      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedItem) {
          // Remove tooltip if it exists.
          const tooltip = draggedItem.querySelector(".tooltip");
          if (tooltip) tooltip.remove();
          // Remove absolute positioning when moving to equipment.
          draggedItem.style.position = "";
          draggedItem.style.left = "";
          draggedItem.style.top = "";
          slot.innerHTML = "";
          slot.appendChild(draggedItem);
        }
      });
    });
  }

  // Place an item in the overlay at a specified grid cell (startRow and startCol are 1-indexed).
  function placeItemInInventory(item, startRow = 1, startCol = 1) {
    const itemElement = createItemElement(item);
    // Set the size of the item.
    itemElement.style.width = `${item.size.cols * cellSize}px`;
    itemElement.style.height = `${item.size.rows * cellSize}px`;
    // Position it based on grid cell coordinates.
    const left = (startCol - 1) * cellSize;
    const top = (startRow - 1) * cellSize;
    itemElement.style.left = `${left}px`;
    itemElement.style.top = `${top}px`;
    itemOverlay.appendChild(itemElement);
  }

  // --- Initialization ---
  // Set up the inventory grid's style.
  inventoryGrid.style.position = "relative";
  inventoryGrid.style.display = "grid";
  inventoryGrid.style.gridTemplateColumns = "repeat(12, 40px)";
  inventoryGrid.style.gridTemplateRows = "repeat(5, 40px)";

  // Place the sword (1×3) with its top-left at row 1, col 1.
  placeItemInInventory(Items.BasicWoodenSword, 1, 1);

  setupDragAndDrop();
});
