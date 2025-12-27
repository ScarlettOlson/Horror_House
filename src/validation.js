import * as T from '../../CS559-Three/build/three.module.js';
import { Vector3 } from '../CS559-Three/build/three.core';




/**
 * Validate that a value is a number and is between a given range.
 * Default range is 0 < value <= infinite
 * @param {Number} value 
 * @param {String} name 
 * @param {Number} min 
 * @param {Number} max 
 */
export function validateNumber(value, name = "", min = 0, max = Infinity) {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new TypeError(`${name} must be a valid number`);
    }
    if (value <= min) {
        throw new EvalError(`${name} must be greater than ${min}`);
    }
    if (value > max) {
        throw new EvalError(`${name} must be less than or equal to ${max}`);
    }
}

/**
 * Validate that a that a vector is within a given range
 * Default range is 0 < value <= infinite for x, y, and z
 * @param {T.Vector3} value 
 * @param {String} name 
 * @param {T.Vector3} min 
 * @param {T.Vector3} max 
 */
export function validateVector3(value, name = "", min = new T.Vector3(), max = new T.Vector3(Infinity, Infinity, Infinity)) {
    if(!value || !value.isVector3) {
        throw new TypeError(`${name} must be a valid Three.Vector3`);
    }
    validateNumber(value.x, name+'.x', min.x, max.x);
    validateNumber(value.y, name+'.y', min.y, max.y);
    validateNumber(value.z, name+'.z', min.z, max.z);
}

/**
 * Validates that a value is a boolean
 * @param {boolean} value 
 * @param {String} name 
 */
export function validateBool(value, name = "") {
    if(typeof value !== "boolean") {
        throw new TypeError(`${name} must be of type boolean`);
    }
}

/**
 * Validates that a value is a Three.Material
 * @param {Material} value 
 * @param {String} name 
 */
export function validateMaterial(value, name = "") {
    if(!value || !value.isMaterial) {
        throw new TypeError(`${name} must be a valid Three.Material`);
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
















