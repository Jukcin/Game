import { Items } from "./items.js";
import { player, updatePlayerStatsUI } from "./player.js";

document.addEventListener("DOMContentLoaded", function () {
  const inventoryGrid = document.getElementById("inventory");
  const equipmentSlots = document.querySelectorAll(".slot, .weapon-slot");
  const cellSize = 40; // each grid cell is 40px by 40px
  let draggedItem = null;
  let offsetX = 0;
  let offsetY = 0;

  // Create an overlay container for items so the grid cells remain intact.
  const itemOverlay = document.createElement("div");
  itemOverlay.style.position = "absolute";
  itemOverlay.style.top = "0";
  itemOverlay.style.left = "0";
  itemOverlay.style.width = "100%";
  itemOverlay.style.height = "100%";
  // Allow pointer events on the overlay.
  itemOverlay.style.pointerEvents = "auto";
  inventoryGrid.appendChild(itemOverlay);

  // Create an item element; also store the underlying item object.
  function createItemElement(item) {
    const itemElement = document.createElement("div");
    itemElement.classList.add("inventory-item", `item-${item.size.cols}x${item.size.rows}`);
    itemElement.draggable = true;
    itemElement.innerHTML = item.emoji;
    itemElement.dataset.name = item.name;
    itemElement.dataset.type = item.type;
    itemElement.dataset.attackPower = item.attackPower;
    itemElement.dataset.armor = item.armor;
    // Save a reference to the item object.
    itemElement._item = item;
    itemElement.style.position = "absolute";
    itemElement.style.zIndex = 10;
    itemElement.style.cursor = "move";
    itemElement.style.pointerEvents = "auto";

    itemElement.addEventListener("dragstart", (e) => {
      // If the item is currently in an equipment slot, unequip it.
      if (
        itemElement.parentElement &&
        (itemElement.parentElement.classList.contains("slot") ||
          itemElement.parentElement.classList.contains("weapon-slot"))
      ) {
        const currentSlotName = itemElement.parentElement.getAttribute("data-slot-name");
        if (currentSlotName === "Main Hand") {
          player.unequipItem("mainHand");
        } else if (currentSlotName === "Off Hand") {
          player.unequipItem("offHand");
        }
        updatePlayerStatsUI();
        // Re-attach item to overlay, recalculating its position relative to inventory.
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
      // Remove any lingering tooltip.
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
    // Inventory overlay drop zone.
    itemOverlay.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    itemOverlay.addEventListener("drop", (e) => {
      e.preventDefault();
      if (draggedItem) {
        // Remove any tooltip.
        const tooltip = draggedItem.querySelector(".tooltip");
        if (tooltip) tooltip.remove();

        const overlayRect = itemOverlay.getBoundingClientRect();
        let x = e.clientX - overlayRect.left - offsetX;
        let y = e.clientY - overlayRect.top - offsetY;
        // Snap coordinates to the grid.
        const snappedX = Math.floor(x / cellSize) * cellSize;
        const snappedY = Math.floor(y / cellSize) * cellSize;
        // Boundaries (assuming 12 cols x 5 rows).
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
          // Check equipment slot restrictions for swords.
          if (draggedItem.dataset.type === "sword") {
            if (!slot.classList.contains("weapon-slot")) {
              alert("Swords can only be equipped in Main Hand or Off Hand!");
              return;
            }
            const slotName = slot.getAttribute("data-slot-name");
            if (slotName !== "Main Hand" && slotName !== "Off Hand") {
              alert("Swords can only be equipped in Main Hand or Off Hand!");
              return;
            }
          }
          // Remove any tooltip.
          const tooltip = draggedItem.querySelector(".tooltip");
          if (tooltip) tooltip.remove();
          // Remove absolute positioning for equipment.
          draggedItem.style.position = "";
          draggedItem.style.left = "";
          draggedItem.style.top = "";
          slot.innerHTML = "";
          slot.appendChild(draggedItem);
          // Update player's equipment if the item is a sword.
          if (draggedItem.dataset.type === "sword") {
            const slotName = slot.getAttribute("data-slot-name");
            if (slotName === "Main Hand") {
              player.equipItem("mainHand", draggedItem._item);
            } else if (slotName === "Off Hand") {
              player.equipItem("offHand", draggedItem._item);
            }
            updatePlayerStatsUI();
          }
        }
      });
    });
  }

  // Place an item in the overlay at a specified grid cell (1-indexed).
  function placeItemInInventory(item, startRow = 1, startCol = 1) {
    const itemElement = createItemElement(item);
    // Set size based on grid cell dimensions.
    itemElement.style.width = `${item.size.cols * cellSize}px`;
    itemElement.style.height = `${item.size.rows * cellSize}px`;
    const left = (startCol - 1) * cellSize;
    const top = (startRow - 1) * cellSize;
    itemElement.style.left = `${left}px`;
    itemElement.style.top = `${top}px`;
    itemOverlay.appendChild(itemElement);
  }

  // --- Initialization ---
  inventoryGrid.style.position = "relative";
  inventoryGrid.style.display = "grid";
  inventoryGrid.style.gridTemplateColumns = "repeat(12, 40px)";
  inventoryGrid.style.gridTemplateRows = "repeat(5, 40px)";

  // Place the sword (1×3) with its top‑left at row 1, col 1.
  placeItemInInventory(Items.BasicWoodenSword, 1, 1);

  setupDragAndDrop();
});
