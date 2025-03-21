document.addEventListener('DOMContentLoaded', function() {
    const dropdownButton = document.getElementById('dropdown-button');
    const dropdownContent = document.getElementById('dropdown-content');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const dungeonMap = document.getElementById('dungeon-map');

    // Toggle dropdown visibility
    dropdownButton.addEventListener('click', function() {
        dropdownContent.classList.toggle('show');
    });

    // Handle dropdown item selection
    dropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            const dungeonName = this.textContent;
            const dungeonValue = this.getAttribute('data-value');
            
            // If a dungeon was previously active and is selected again, redirect to its specific page
            const activeDungeon = localStorage.getItem('activeDungeon');
            
            if (activeDungeon === dungeonValue) {
                // Redirect to the specific dungeon page based on the active dungeon
                switch (dungeonValue) {
                    case 'tutorial':
                        window.location.href = 'tutorialdungeon.html';
                        return;
                    case 'trials':
                        window.location.href = 'trialsdungeon.html'; // This page would need to be created
                        return;
                    case 'outbreak':
                        window.location.href = 'outbreakdungeon.html'; // This page would need to be created
                        return;
                }
            }
            
            // If Tutorial is selected (and was not active), navigate to tutorialdungeon.html
            if (dungeonValue === 'tutorial') {
                window.location.href = 'tutorialdungeon.html';
                return;
            }
            
            // For other dungeons, update the current page
            // Update dropdown button text
            dropdownButton.textContent = dungeonName;
            
            // Hide dropdown
            dropdownContent.classList.remove('show');
            
            // Save the selected dungeon
            localStorage.setItem('selectedDungeon', dungeonValue);
            
            // Update map container (placeholder for now)
            dungeonMap.innerHTML = `<div>${dungeonName} Map</div>`;
            
            console.log(`Selected dungeon: ${dungeonValue}`);
        });
    });

    // Check if there's a selected dungeon from localStorage
    const selectedDungeon = localStorage.getItem('selectedDungeon');
    if (selectedDungeon) {
        // Find the dropdown item for the selected dungeon
        const selectedItem = document.querySelector(`.dropdown-item[data-value="${selectedDungeon}"]`);
        if (selectedItem) {
            // Update dropdown button text
            dropdownButton.textContent = selectedItem.textContent;
            
            // Update map container
            dungeonMap.innerHTML = `<div>${selectedItem.textContent} Map</div>`;
        }
    }

    // Close dropdown when clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-button')) {
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    });

    // Add navigation to Character page
    document.querySelector('.nav-item:nth-child(1)').addEventListener('click', function() {
        window.location.href = 'gladiator-game-ui.html';
    });
});