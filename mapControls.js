// Map panning and zooming functionality
document.addEventListener('DOMContentLoaded', function() {
    const dungeonMap = document.getElementById('dungeon-map');
    const tutorialMap = document.getElementById('tutorial-map');
    
    // Initialize variables for dragging
    let isDragging = false;
    let startX, startY;
    let scrollLeft, scrollTop;
    
    // Initialize zoom level
    let currentZoom = 1;
    const minZoom = 0.5;
    const maxZoom = 2;
    const zoomStep = 0.1;
    
    // Setup map container for dragging
    dungeonMap.style.overflow = 'hidden';
    dungeonMap.style.position = 'relative';
    
    // Setup map for dragging and zooming
    tutorialMap.style.position = 'absolute';
    tutorialMap.style.width = '100%';
    tutorialMap.style.height = '100%';
    tutorialMap.style.transformOrigin = 'center';
    tutorialMap.style.transition = 'transform 0.1s ease-out';
    
    // Create zoom controls
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.style.position = 'absolute';
    zoomControls.style.top = '10px';
    zoomControls.style.right = '10px';
    zoomControls.style.zIndex = '10';
    zoomControls.style.display = 'flex';
    zoomControls.style.flexDirection = 'column';
    zoomControls.style.gap = '5px';
    
    // Create zoom in button
    const zoomInBtn = document.createElement('button');
    zoomInBtn.innerText = '+';
    zoomInBtn.style.width = '30px';
    zoomInBtn.style.height = '30px';
    zoomInBtn.style.backgroundColor = '#4a4a4a';
    zoomInBtn.style.border = '2px solid #6b5c2e';
    zoomInBtn.style.borderRadius = '5px';
    zoomInBtn.style.color = '#e6d3a3';
    zoomInBtn.style.fontSize = '20px';
    zoomInBtn.style.cursor = 'pointer';
    zoomInBtn.style.display = 'flex';
    zoomInBtn.style.alignItems = 'center';
    zoomInBtn.style.justifyContent = 'center';
    
    // Create zoom out button
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.innerText = '-';
    zoomOutBtn.style.width = '30px';
    zoomOutBtn.style.height = '30px';
    zoomOutBtn.style.backgroundColor = '#4a4a4a';
    zoomOutBtn.style.border = '2px solid #6b5c2e';
    zoomOutBtn.style.borderRadius = '5px';
    zoomOutBtn.style.color = '#e6d3a3';
    zoomOutBtn.style.fontSize = '20px';
    zoomOutBtn.style.cursor = 'pointer';
    zoomOutBtn.style.display = 'flex';
    zoomOutBtn.style.alignItems = 'center';
    zoomOutBtn.style.justifyContent = 'center';
    
    // Create reset button
    const resetBtn = document.createElement('button');
    resetBtn.innerText = '↻';
    resetBtn.style.width = '30px';
    resetBtn.style.height = '30px';
    resetBtn.style.backgroundColor = '#4a4a4a';
    resetBtn.style.border = '2px solid #6b5c2e';
    resetBtn.style.borderRadius = '5px';
    resetBtn.style.color = '#e6d3a3';
    resetBtn.style.fontSize = '16px';
    resetBtn.style.cursor = 'pointer';
    resetBtn.style.display = 'flex';
    resetBtn.style.alignItems = 'center';
    resetBtn.style.justifyContent = 'center';
    
    // Add buttons to zoom controls
    zoomControls.appendChild(zoomInBtn);
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(resetBtn);
    
    // Add zoom controls to map container
    dungeonMap.appendChild(zoomControls);
    
    // Event listeners for map dragging
    tutorialMap.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.pageX - tutorialMap.offsetLeft;
        startY = e.pageY - tutorialMap.offsetTop;
        
        // Get current translation from transform matrix
        const transform = window.getComputedStyle(tutorialMap).getPropertyValue('transform');
        const matrix = new DOMMatrix(transform);
        scrollLeft = matrix.m41;
        scrollTop = matrix.m42;
        
        // Change cursor style
        tutorialMap.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        // Prevent default behavior to avoid text selection during drag
        e.preventDefault();
        
        // Calculate how far mouse has moved
        const x = e.pageX - tutorialMap.offsetLeft;
        const y = e.pageY - tutorialMap.offsetTop;
        const moveX = (x - startX);
        const moveY = (y - startY);
        
        // Apply new position
        tutorialMap.style.transform = `translate(${scrollLeft + moveX}px, ${scrollTop + moveY}px) scale(${currentZoom})`;
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        tutorialMap.style.cursor = 'grab';
    });
    
    document.addEventListener('mouseleave', function() {
        isDragging = false;
        tutorialMap.style.cursor = 'grab';
    });
    
    // Change cursor style when hovering over the map
    tutorialMap.addEventListener('mouseenter', function() {
        if (!isDragging) {
            tutorialMap.style.cursor = 'grab';
        }
    });
    
    // Zoom functionality
    zoomInBtn.addEventListener('click', function() {
        if (currentZoom < maxZoom) {
            currentZoom += zoomStep;
            updateZoom();
        }
    });
    
    zoomOutBtn.addEventListener('click', function() {
        if (currentZoom > minZoom) {
            currentZoom -= zoomStep;
            updateZoom();
        }
    });
    
    resetBtn.addEventListener('click', function() {
        resetView();
    });
    
    // Mouse wheel zoom
    dungeonMap.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        if (e.deltaY < 0 && currentZoom < maxZoom) {
            // Scroll up - zoom in
            currentZoom += zoomStep;
        } else if (e.deltaY > 0 && currentZoom > minZoom) {
            // Scroll down - zoom out
            currentZoom -= zoomStep;
        }
        
        updateZoom();
    });
    
    // Update zoom based on current zoom level
    function updateZoom() {
        // Get current translation
        const transform = window.getComputedStyle(tutorialMap).getPropertyValue('transform');
        const matrix = new DOMMatrix(transform);
        const currentX = matrix.m41;
        const currentY = matrix.m42;
        
        // Apply zoom with current translation
        tutorialMap.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom})`;
    }
    
    // Reset view to original position and zoom
    function resetView() {
        currentZoom = 1;
        tutorialMap.style.transform = 'translate(0, 0) scale(1)';
    }
    
    // Initialize with grab cursor
    tutorialMap.style.cursor = 'grab';
});