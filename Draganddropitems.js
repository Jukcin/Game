import { Items } from "./items.js";

document.addEventListener("DOMContentLoaded", function () {
    const inventorySlots = document.querySelectorAll(".inventory-slot");
    const equipmentSlots = document.querySelectorAll(".slot, .weapon-slot");
    let draggedItem = null;
    let previousSlot = null;

    function createItemElement(item) {
        const itemElement = document.createElement("div");
        itemElement.classList.add("inventory-slot", `item-${item.size.cols}x${item.size.rows}`);
        itemElement.draggable = true;
        itemElement.innerHTML = `${item.emoji}`;
        itemElement.dataset.name = item.name;
        itemElement.dataset.type = item.type;
        itemElement.dataset.attackPower = item.attackPower;
        itemElement.dataset.armor = item.armor;

        itemElement.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", JSON.stringify(item));
            draggedItem = itemElement;
            previousSlot = itemElement.parentElement;
            itemElement.classList.add("dragging");
            const tooltip = itemElement.querySelector(".tooltip");
            if (tooltip) tooltip.remove(); // Hide tooltip while dragging
        });

        itemElement.addEventListener("dragend", () => {
            itemElement.classList.remove("dragging");
        });

        itemElement.addEventListener("mouseenter", (e) => {
            if (!itemElement.classList.contains("dragging")) { // Prevent tooltip while dragging
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

    function setupDragAndDrop() {
        document.querySelectorAll(".inventory-slot, .slot, .weapon-slot").forEach((slot) => {
            slot.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            slot.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedItem && slot !== previousSlot) {
                    previousSlot.innerHTML = ""; // Remove item from previous slot
                    slot.innerHTML = ""; // Clear slot before placing new item
                    slot.appendChild(draggedItem);
                }
            });
        });
    }

    if (inventorySlots.length > 0) {
        const firstSlot = inventorySlots[0];
        const itemElement = createItemElement(Items.BasicWoodenSword);

        // Debugging: Log the first slot and item element
        console.log("First Slot:", firstSlot);
        console.log("Item Element:", itemElement);

        // Append the item to the first slot
        firstSlot.appendChild(itemElement);

        // Disable the next two slots below the first slot
        const secondSlot = firstSlot.nextElementSibling;
        const thirdSlot = secondSlot.nextElementSibling;
        secondSlot.style.display = "none";
        thirdSlot.style.display = "none";
    }

    setupDragAndDrop();
});