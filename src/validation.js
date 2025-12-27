








export function validateNumber(value, name, min = 0) {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new Error(`${name} must be a valid number`);
    }
    if (value <= min) {
        throw new Error(`${name} must be greater than ${min}`);
    }
}

// Helper function to check if two rectangles overlap
export function rectanglesOverlap(rect1, rect2) {
    // Rectangles don't overlap if one is completely to the left, right, above, or below the other
    let val = rect1.right <= rect2.left || rect1.left >= rect2.right; 
    val = val || rect1.top <= rect2.bottom || rect1.bottom >= rect2.top;

    return !val;               
}

// Checks if rect2 is completely contained within rect1
export function rectangleContained(rect1, rect2) {
    let val = rect1.bottom > rect2.bottom || rect1.left > rect2.left;
    val = val || rect1.top < rect2.top || rect1.right < rect2.right;
    
    return !val;
}

// Checks that a set of rectangular holes are valid on a rectangular
// Valid Holes are all contained within the canvas and do not overlap each other
export function isValidHoles(canvas, holes) {
    // Check all holes are contained on the canvas
    holes.forEach(hole => {
        if(!rectangleContained(canvas, hole)) return false;
    });

    // Check that all holes do not overlap other holes
    for(let i=0; i<holes.length-1; i++) {
        for(let j=i+1; j<holes.length; j++) {
            if(rectanglesOverlap(holes[i], holes[j])) return false;
        }
    }

    return true;
}
















