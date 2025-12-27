import * as T from '../../CS559-Three/build/three.module.js';
import * as interactiveObjs from './interactive_objects.js';
import * as simpleObjs from './simple_objects.js';
import * as houseObjs from './house_objects.js'
import { isValidHoles, validateNumber } from '../validation.js';





export function createHouse() {
    const objects = [];         // Shown in 3D space
    const obstacles = [];       // Can't be walked through
    const interactables = [];   // Can be interactved with. Interactable Type
    
    const exteriorWallThickness = 0.5;
    const interiorWallThickness = 0.25;

    const houseWidth = 15;
    const houseHeight = 3;
    const houseDepth = 20;
    
    const doorWidth = 1.5
    const doorHeight = 2.5;

    const windowWidth = 2;
    const windowHeight = 1.25;

    const frontWall = wallConstructor({
        wallWidth: houseWidth,
        wallHeight: houseHeight,
        wallDepth: exteriorWallThickness,
        windows: [
            { height: windowHeight, width: windowWidth, offsetX: -6, offsetY: 2 },
            { height: windowHeight, width: windowWidth, offsetX: 6, offsetY: 2 },
        ],
        passages: [],
        doors: [
            { height: doorHeight, width: doorWidth, offsetX: -2},
            { height: doorHeight, width: doorWidth, offsetX: 2 },
        ],
    });
    objects.push();
    obstacles.push();
    interactables.push();

    return {objects, obstacles, interactables}
}




export function wallConstructor({
    wallWidth,      // Width of the wall
    wallHeight,     // Height of the wall
    wallDepth,      // Depth/Thickness of the wall
    windows,        // List of objects with window params.
    passages,       // List of objecst with passage paramas.
    doors,          // List of objects with door params.
                    // Window param lists shoud contain: height, width, offsetX, offsetY.
                    // Passage and Door list should contain: height, width, and offsetX
}) {
    // Validate wall dimensions
    validateNumber(wallWidth, 'wallWidth');
    validateNumber(wallHeight, 'wallHeight');
    validateNumber(wallDepth, 'wallDepth');

    // Collect the boundaries of the holes
    const allOpenings = [];
    
    windows.forEach((window, i) => {
        validateNumber(window.width, `windows[${i}].width`);
        validateNumber(window.height, `windows[${i}].height`);
        validateNumber(window.offsetX, `windows[${i}].offsetX`, -wallWidth/2);
        validateNumber(window.offsetY, `windos[${i}].offsetY`, -wallHeight/2);

        allOpenings.push({
            type: 'window',
            index: i,
            bottom: window.offsetY - window.height/2,
            top: window.offsetY + window.height/2,
            left: window.offsetX - window.width/2,
            right: window.offsetX + window.width/2,
        });
    });
    
    passages.forEach((passage, i) => {
        validateNumber(passage.width, `passages[${i}].width`);
        validateNumber(passage.height, `passages[${i}].height`);
        validateNumber(passage.offsetX, `passages[${i}].offsetX`, -wallWidth/2);
        
        allOpenings.push({
            type: 'passage',
            index: i,
            bottom: (passage.height - wallHeight) /2,
            top: (wallHeight - passage.height) /2,
            left: passage.offsetX - passage.width/2,
            right: passage.offsetX + passage.width/2,
        });
    });
    
    doors.forEach((door, i) => {
        validateNumber(door.width, `doors[${i}].width`);
        validateNumber(door.height, `doors[${i}].height`);
        validateNumber(door.offsetX, `doors[${i}].offsetX`, -wallWidth/2);

        allOpenings.push({
            type: 'door',
            index: i,
            bottom: (door.height - wallHeight) / 2,
            top: (wallHeight - door.height) / 2,
            left: door.offsetX - door.width/2,
            right: door.offsetX + door.width/2, 
        });
    });

    // Check that all of the opening are valid
    const wall_rect = {
        bottom: -wallHeight/2,
        top: wallHeight/2,
        left: -wallWidth/2,
        right: wallWidth/2,
    }
    if(isValidHoles(wall_rect, allOpenings)) {
        return new EvalError("Parameters are not valid");
    }
    
    // Create the main wall group
  const wallGroup = new T.Group();
  wallGroup.position.copy(position);
  wallGroup.rotation.y = rotationY;
  
  // Create wall segments by subdividing around all openings
  const segments = generateWallSegments(wallRect, allOpenings);
  
  // Create wall meshes for each segment
  segments.forEach((segment, i) => {
    const segmentWidth = segment.right - segment.left;
    const segmentHeight = segment.top - segment.bottom;
    const segmentCenterX = (segment.left + segment.right) / 2;
    const segmentCenterY = (segment.bottom + segment.top) / 2;
    
    const wallConfig = {
      position: new T.Vector3(segmentCenterX, segmentCenterY, 0),
      scale: new T.Vector3(segmentWidth, segmentHeight, wallDepth),
      material: material,
      castShadow: castShadow,
      receiveShadow: receiveShadow,
    };
    
    const wallSegment = new simpleObjs.Wall(wallConfig);
    wallGroup.add(wallSegment);
  });
  
  // Add windows
  windows.forEach((window, i) => {
    const windowConfig = {
      position: new T.Vector3(window.offsetX, window.offsetY, 0),
      scale: new T.Vector3(window.width, window.height, wallDepth),
      castShadow: castShadow,
      receiveShadow: receiveShadow,
    };
    
    const windowObj = new simpleObjs.Window(windowConfig);
    wallGroup.add(windowObj);
  });
  
  // Passages and doors don't need objects added (they're just empty space)
  
  return wallGroup;
}

/**
 * Generates wall segments by subdividing the wall around openings
 * This creates a minimal set of rectangles that cover the solid wall areas
 */
function generateWallSegments(wallRect, openings) {
  // Sort openings by vertical position, then horizontal
  const sortedOpenings = [...openings].sort((a, b) => {
    if (a.bottom !== b.bottom) return a.bottom - b.bottom;
    return a.left - b.left;
  });
  
  const segments = [];
  
  // Use a sweep-line algorithm to generate horizontal strips
  const yCoords = new Set([wallRect.bottom, wallRect.top]);
  openings.forEach(opening => {
    yCoords.add(opening.bottom);
    yCoords.add(opening.top);
  });
  
  const yLevels = Array.from(yCoords).sort((a, b) => a - b);
  
  // For each horizontal strip
  for (let i = 0; i < yLevels.length - 1; i++) {
    const stripBottom = yLevels[i];
    const stripTop = yLevels[i + 1];
    const stripMidY = (stripBottom + stripTop) / 2;
    
    // Find all openings that intersect this strip
    const intersectingOpenings = openings.filter(opening => 
      opening.bottom < stripTop && opening.top > stripBottom
    ).sort((a, b) => a.left - b.left);
    
    // Generate segments in this strip
    let currentX = wallRect.left;
    
    intersectingOpenings.forEach(opening => {
      // Add segment before this opening
      if (currentX < opening.left) {
        segments.push({
          left: currentX,
          right: opening.left,
          bottom: stripBottom,
          top: stripTop,
        });
      }
      currentX = Math.max(currentX, opening.right);
    });
    
    // Add final segment if there's space
    if (currentX < wallRect.right) {
      segments.push({
        left: currentX,
        right: wallRect.right,
        bottom: stripBottom,
        top: stripTop,
      });
    }
  }
  
  return segments;
}




