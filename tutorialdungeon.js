document.addEventListener('DOMContentLoaded', function() {
    const dropdownButton = document.getElementById('dropdown-button');
    const dropdownContent = document.getElementById('dropdown-content');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const dungeonMap = document.getElementById('dungeon-map');
    const defaultMessage = document.getElementById('default-message');
    const tutorialMap = document.getElementById('tutorial-map');
    const startDungeonButton = document.getElementById('start-dungeon-button');
    const actionTextArea = document.getElementById('action-text-area');
    const chestNode = document.getElementById('chest-node');
    
    // Track the current node and dungeon state
    let currentNodeIndex = 0;
    let isDungeonActive = false;
    let chestOpened = false;
    const nodes = document.querySelectorAll('.map-node');
    
    // Navigation to World page
    document.getElementById('nav-world').addEventListener('click', function() {
        window.location.href = 'gladiator-game-ui.html';
    });
    
    // Navigation to Dungeon page
    document.getElementById('nav-dungeon').addEventListener('click', function() {
        window.location.href = 'dungeons.html';
    });

    // Automatically display the tutorial map when page loads
    dropdownButton.textContent = 'Tutorial';
    defaultMessage.style.display = 'none';
    tutorialMap.classList.add('active');

    // Toggle dropdown visibility when clicking the button
    dropdownButton.addEventListener('click', function(event) {
        if (!isDungeonActive) {
            dropdownContent.classList.toggle('show');
            event.stopPropagation();
        }
    });

    // Handle dropdown item selection
    dropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            const dungeonName = this.textContent;
            const dungeonValue = this.getAttribute('data-value');
            
            // Update dropdown button text
            dropdownButton.textContent = dungeonName;
            
            // Hide dropdown
            dropdownContent.classList.remove('show');
            
            // If another dungeon is selected from tutorial page, go back to main page
            if (dungeonValue !== 'tutorial') {
                // Save the selected dungeon to localStorage
                localStorage.setItem('selectedDungeon', dungeonValue);
                window.location.href = 'dungeons.html';
                return;
            }
            
            // Show tutorial map
            defaultMessage.style.display = 'none';
            tutorialMap.classList.add('active');
        });
    });

    // Start/Exit Dungeon button functionality
    startDungeonButton.addEventListener('click', function() {
        if (!isDungeonActive) {
            // Start the dungeon
            startDungeon();
        } else {
            // Exit the dungeon
            exitDungeon();
            // Redirect to dungeons.html
            window.location.href = 'dungeons.html';
        }
    });

    // Function to start the dungeon
    function startDungeon() {
        isDungeonActive = true;
        chestOpened = false;
        
        // Disable dropdown but keep it visible
        dropdownButton.disabled = true;
        dropdownButton.style.opacity = '0.5';
        dropdownButton.style.cursor = 'default';
        
        // Change button text
        startDungeonButton.textContent = 'Exit Dungeon';
        
        // Reset to starting position
        currentNodeIndex = 0;
        updateNodeVisuals();
        
        // Make nodes clickable
        setupNodeInteractions();
        
        // Save the current dungeon state
        localStorage.setItem('activeDungeon', 'tutorial');
        
        // Reset chest appearance
        chestNode.classList.remove('opened');
        
        // Update action text
        updateActionText("Feedback_dungeon_start");
    }

    // Function to exit the dungeon
    function exitDungeon() {
        isDungeonActive = false;
        
        // Enable dropdown
        dropdownButton.disabled = false;
        dropdownButton.style.opacity = '1';
        dropdownButton.style.cursor = 'pointer';
        
        // Change button text back
        startDungeonButton.textContent = 'Start Dungeon';
        
        // Reset nodes (all unclickable)
        nodes.forEach(node => {
            node.style.cursor = 'default';
            node.onclick = null;
        });
        
        // Reset node visuals (only start is active)
        resetNodeVisuals();
        
        // Remove active dungeon from storage
        localStorage.removeItem('activeDungeon');
        
        // Update action text
        updateActionText("Dungeon exited.");
    }

    // Update the visuals to show current position
    function updateNodeVisuals() {
        // Remove 'current' class from all nodes
        document.querySelectorAll('.node-circle, .node-chest').forEach(nodeElement => {
            nodeElement.classList.remove('current');
        });
        
        // Add 'current' class to current node
        if (nodes[currentNodeIndex]) {
            const currentNodeElement = nodes[currentNodeIndex].querySelector('.node-circle, .node-chest');
            if (currentNodeElement) {
                currentNodeElement.classList.add('current');
                
                // If at chest node, handle chest opening
                if (currentNodeIndex === 1 && !chestOpened) {
                    openChest();
                }
            }
        }
    }
    
    // Function to handle chest opening
    function openChest() {
        chestOpened = true;
        chestNode.classList.add('opened');
        updateActionText("Feedback_chest_otvoren");
    }

    // Reset node visuals to initial state
    function resetNodeVisuals() {
        document.querySelectorAll('.node-circle, .node-chest').forEach((nodeElement, index) => {
            nodeElement.classList.remove('current');
            if (index === 0) {
                nodeElement.classList.add('current');
            }
        });
    }

    // Set up node interactions for moving through dungeon
    function setupNodeInteractions() {
        nodes.forEach((node, index) => {
            // Only make the next node clickable
            if (index === currentNodeIndex + 1) {
                node.style.cursor = 'pointer';
                node.onclick = function() {
                    currentNodeIndex = index;
                    updateNodeVisuals();
                    setupNodeInteractions(); // Update clickable nodes
                    
                    // Update action text based on node
                    if (index === 1) { // Chest node
                        // Text is handled in openChest function
                    } else if (index === 2) { // Boss node
                        updateActionText("Feedback_boss_triggeran");
                    } else if (index === 3) { // Exit node
                        updateActionText("Feedback_exit");
                        
                        // When reaching the exit node (index 3)
                        setTimeout(() => {
                            exitDungeon();
                            // Redirect to dungeons.html when completing the dungeon
                            window.location.href = 'dungeons.html';
                        }, 2500); // Longer delay to show the completion message
                    }
                };
            } else {
                node.style.cursor = 'default';
                node.onclick = null;
            }
        });
    }
    
    // Function to update action text area
    function updateActionText(text) {
        // Add timestamp to message
        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        // Create a new line of text with timestamp
        const newLine = `[${timestamp}] ${text}`;
        
        // Get current content
        const currentContent = actionTextArea.innerHTML;
        
        // Add new text at the top
        if (currentContent.includes('Actions will be displayed here...')) {
            actionTextArea.innerHTML = newLine;
        } else {
            actionTextArea.innerHTML = newLine + '<br>' + currentContent;
        }
    }

    // Check if there was an active dungeon when page loaded
    if (localStorage.getItem('activeDungeon') === 'tutorial') {
        startDungeon();
    } else {
        // Initial action text
        actionTextArea.innerHTML = "Actions will be displayed here...";
    }

    // Close dropdown when clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-button') && !isDungeonActive) {
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    });
});