document.addEventListener('DOMContentLoaded', function() {
    const dropdownButton = document.getElementById('dropdown-button');
    const dropdownContent = document.getElementById('dropdown-content');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const dungeonMap = document.getElementById('dungeon-map');
    const defaultMessage = document.getElementById('default-message');
    const tutorialMap = document.getElementById('tutorial-map');
    const startDungeonButton = document.getElementById('start-dungeon-button');
    
    // Track the current node and dungeon state
    let currentNodeIndex = 0;
    let isDungeonActive = false;
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

    // Toggle dropdown visibility
    dropdownButton.addEventListener('click', function() {
        // Only show dropdown if dungeon is not active
        if (!isDungeonActive) {
            dropdownContent.classList.toggle('show');
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
        }
    });

    // Function to start the dungeon
    function startDungeon() {
        isDungeonActive = true;
        
        // Disable dropdown
        dropdownButton.disabled = true;
        dropdownButton.style.opacity = '0.5';
        
        // Change button text
        startDungeonButton.textContent = 'Exit Dungeon';
        
        // Reset to starting position
        currentNodeIndex = 0;
        updateNodeVisuals();
        
        // Make nodes clickable
        setupNodeInteractions();
        
        // Save the current dungeon state
        localStorage.setItem('activeDungeon', 'tutorial');
    }

    // Function to exit the dungeon
    function exitDungeon() {
        isDungeonActive = false;
        
        // Enable dropdown
        dropdownButton.disabled = false;
        dropdownButton.style.opacity = '1';
        
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
            }
        }
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
                };
            } else {
                node.style.cursor = 'default';
                node.onclick = null;
            }
        });
    }

    // Check if there was an active dungeon when page loaded
    if (localStorage.getItem('activeDungeon') === 'tutorial') {
        startDungeon();
    }

    // Close dropdown when clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-button')) {
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    });
});