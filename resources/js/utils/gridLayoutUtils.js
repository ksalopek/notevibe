export function repackLayout(orderedWidgets, currentLayout, cols) {
    const grid = []; // 2D array tracking occupied cells: grid[y][x]
    
    const isOccupied = (x, y, w, h) => {
        for (let r = y; r < y + h; r++) {
            if (!grid[r]) continue;
            for (let c = x; c < x + w; c++) {
                if (grid[r][c]) return true;
            }
        }
        return false;
    };
    
    const markOccupied = (x, y, w, h) => {
        for (let r = y; r < y + h; r++) {
            if (!grid[r]) grid[r] = [];
            for (let c = x; c < x + w; c++) {
                grid[r][c] = true;
            }
        }
    };
    
    const newLayout = [];
    
    // Map of currently active items in the layout
    const layoutMap = new Map();
    currentLayout.forEach(item => layoutMap.set(item.i, item));
    
    for (const widget of orderedWidgets) {
        if (!layoutMap.has(widget.id)) continue;
        
        const item = layoutMap.get(widget.id);
        const { i, w, h } = item;
        
        // Ensure widget width doesn't exceed grid columns
        const width = Math.min(w, cols);
        
        let placed = false;
        let startY = 0;
        
        while (!placed) {
            for (let x = 0; x <= cols - width; x++) {
                if (!isOccupied(x, startY, width, h)) {
                    markOccupied(x, startY, width, h);
                    newLayout.push({ ...item, x, y: startY, w: width, h });
                    placed = true;
                    break;
                }
            }
            if (!placed) startY++;
        }
    }
    
    // Fallback: append any items that were enabled but somehow not in orderedWidgets list
    currentLayout.forEach(item => {
        if (!newLayout.find(n => n.i === item.i)) {
            const y = Math.max(0, ...newLayout.map(n => n.y + n.h));
            newLayout.push({ ...item, x: 0, y });
        }
    });

    return newLayout;
}
