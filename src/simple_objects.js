import { texture } from 'three/tsl';
import * as T from '../CS559-Three/build/three.module.js';
import { loadTextureSafely } from './load_texture.js';
const twoPi = 2 * Math.PI;
const halfPi = Math.PI / 2;

const defaultObjParams = {
  position: new T.Vector3(0, 0, 0),
  scale: new T.Vector3(1, 1, 1),
  material: new T.MeshStandardMaterial({ color: 0x6b5b4f }),
  rotationY: 0,
  castShadow: false,
  receiveShadow: false,
  useTextures: true,
  textureSpacingX: 1,  // Texture repeats per unit in X
  textureSpacingY: 1,  // Texture repeats per unit in Y
}

export class Object extends T.Group {
  constructor(defaultParams, config) {
    super();
    Object.assign(this, defaultParams, config)
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;
    this.mesh.castShadow = this.castShadow;
    this.mesh.receiveShadow = this.receiveShadow;
  }
  
  async loadTexture(mesh, texturePath, material, width=1, height=1) {
    if(this.useTextures) {
      material = await loadTextureSafely(texturePath, material);
      
      // Apply texture repeating based on dimensions and spacing
      if(material.map) {
        material.map.repeat.set(
          width / this.textureSpacingX,
          height / this.textureSpacingY
        );
      }
    }
    mesh.material = material;
  }
}
// ------------------------------------ Objects that use the base parameters only -----------------

/**
 * Flat plane creating a floor
 */
export class Floor extends Object {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super(config, defaultObjParams);

    // Get shape Params
    const width = this.scale.x;
    const depth = this.scale.z;

    this.mesh = new T.Mesh(new T.PlaneGeometry(width, depth));
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.material.side = T.DoubleSide;
    this.add(this.mesh);

    // Load material asynchronously if needed
    this.loadTexture(this.mesh, './src/textures/floor.jpg', this.material, width, depth);
  }
}

/**
 * Curved handle made of a tube
 * 
 * scale.x;   L Plane to represent the floor Plane to represent the floorength between the posts of the handle
 * scale.y;   Height of the handle posts
 * scale.z;   Used as the radius of the tube
 */
export class Handle extends Object {
  constructor(config) {
    super(config, defaultObjParams);

    // Get shape Params
    const length = this.scale.x;
    const height = this.scale.y;
    const radius = this.scale.z;
    
    // Create all vectors in a list
    const handlePnts = [
      new T.Vector3(0, length/2, 0),                  // Bottom of first horizontal
      new T.Vector3(0, length/2, height - radius),    // Top of first horizontal

      new T.Vector3(0, length/2, height),             // Arc1 control point

      new T.Vector3(0, length/2 - radius, height),    // First Vertical point
      new T.Vector3(0, radius - length/2, height),    // Second Vertical point

      new T.Vector3(0, -length/2, height),            // Arc2 control point

      new T.Vector3(0, -length/2, height - radius),   // Top of second horizontal
      new T.Vector3(0, -length/2, 0),                 // Bottom of second horizontal
    ];
    
    // Create the path with smooth arcs using the vectors from the list
    const handlePath = new T.CurvePath();
    
    handlePath.add( new T.LineCurve3(handlePnts[0], handlePnts[1]) );
    handlePath.add( new T.QuadraticBezierCurve3(handlePnts[1], handlePnts[2], handlePnts[3]) );
    handlePath.add( new T.LineCurve3(handlePnts[3], handlePnts[4]) );
    handlePath.add( new T.QuadraticBezierCurve3(handlePnts[4], handlePnts[5], handlePnts[6]) );
    handlePath.add( new T.LineCurve3(handlePnts[6], handlePnts[7]) );
    
    // Create tube geometry
    const tubeGeometry = new T.TubeGeometry(handlePath, 64, radius, 16, false);
    const tubeMesh = new T.Mesh(tubeGeometry);
    this.add(tubeMesh);

    // Load material asynchronously if needed
    this.loadTexture(tubeMesh, './src/textures/handle.jpg', this.material, twoPi*radius, length + 2*height);
  }
}

/**
 * Simple note that is visually interesting
 */
export class Note extends Object {
    constructor(config) {
        // Create Group, set it's position, and set it's orientation
        super(config, defaultOpenBoxParams);

        // Get shape Params
        const width = this.scale.x;
        const height = this.scale.y;

        // Create a visual representation (paper/note) - make it bigger and vertical
        const planeGeometry = new T.PlaneGeometry(0.3, 0.4);
        this.mesh = new T.Mesh(planeGeometry);
    
        // Keep it vertical (not flat) so it's easier to see and interact with
        this.mesh.rotation.y = Math.PI; // Face forward
        this.add(this.mesh);

        // Add a subtle glow or highlight
        const glowGeom = new T.PlaneGeometry(0.35, 0.45);
        const glowMat = new T.MeshBasicMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0.4,
            side: T.DoubleSide
        });
        this.glow = new T.Mesh(glowGeom, glowMat);
        this.glow.rotation.y = Math.PI;
        this.glow.position.z = -0.01; // Slightly behind the note
        this.add(this.glow);

        // Load material asynchronously if needed
        this.loadTexture(this.mesh, './src/textures/paper.jpg',  this.material, width, height);
    }
}

/**
 * Creates a simple box geometry to represent a wall
 */
export class Wall extends Object {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super(config, defaultObjParams);

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const thickness = this.scale.z;

    // Create and add the wall mesh
    this.mesh = new T.Mesh(new T.BoxGeometry(width, height, thickness));
    this.mesh.castShadow = this.castShadow;
    this.mesh.receiveShadow = this.receiveShadow;
    this.add(this.mesh);


    // Load material asynchronously if needed
    this.loadTexture(this.mesh, './src/textures/wall.jpg',  this.material, width, height);
  }
}


// ------------------------------------ Objects that use additional parameters --------------------
const defaultBedParams = {
  ...defaultObjParams,
  legHeight: 0.35,
  legRadius: 0.1,
  legWidth: 0.75,
  legDepth: 0.75, 
  legMaterial: new T.MeshStandardMaterial({ color:"brown" }),
  mattressHeight: 0.2,
  mattressMaterial: new T.MeshStandardMaterial({ color:"white" }),
  headboardThickness: 0.1,
}
export class Bed extends Object {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super(config, defaultBedParams);

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const depth = this.scale.z;

    // Creat the legs of the bed
    const legDimenions = {
      radiusTop: this.legRadius,
      radiusBottom: this.legRadius,
      height: this.legHeight,
      radialSegments: 16,
      heightSegments: 1,
      openEnded: false,
      thetaStart: 0,
      thetaLength: twoPi,
    }
    const legGeometry = new T.CylinderGeometry(...legDimenions);
    const legPositions = [
      [-this.legWidth / 2, (this.legHeight - height) / 2, -this.legDepth / 2],
      [-this.legWidth / 2, (this.legHeight - height) / 2, this.legDepth / 2],
      [this.legWidth / 2, (this.legHeight - height) / 2, -this.legDepth / 2],
      [this.legWidth / 2, (this.legHeight - height) / 2, this.legDepth / 2],
    ]
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new T.Mesh(legGeometry);
      leg.position.set(lx, ly, lz);
      this.add(leg);

      // Load material asynchronously if needed
      this.loadTexture(leg, './src/textures/leg.jpg',  this.legMaterial, twoPi*this.legRadius, this.legHeight);
    });

    // Create the mattress
    const mattressGeometry = new T.BoxGeometry(width, this.mattressHeight, depth-this.headboardThickness);
    const mattress = new T.Mesh(mattressGeometry);
    mattress.position.set(0, this.legHeight + (this.mattressHeight - height) / 2, this.headboardThickness);
    this.add(mattress);
    this.loadTexture(mattress, './src/textures/mattress.jpg', this.mattressMaterial, width, this.mattressHeight);

    // Create the headboard
    const headboardShape = new T.Shape();
    headboardShape.moveTo(-width/2, this.legHeight);
    headboard.lineTo(-width/2, 2 * height / 3);
    headboard.quadraticBezierCurve(0, height, width/2, 2 * height / 3);
    headboard.lineTo(width/2, this.legHeight);
    headboard.lineTo(-width/2, this.legHeight);
    const headboardExtrudeSettings = {
      depth: this.headboardThickness,
      steps: 1,
      bevelEnabled: false,
      bevelThickness: 0.1,
      bevelSize: 0.1,
    };

    const headboardGeometry = new T.ExtrudeGeometry(headboardShape, headboardExtrudeSettings);
    const headboard = new T.Mesh(headboardGeometry);
    headboard.position.set(0, -height/2, (this.headboardThickness - depth) / 2);
    this.add(headboard);
    this.loadTexture(headboard, './src/textures/headboard.jpg', this.material, width, height-this.legHeight);
  }
}


const defaultBookshelfParams = {
  ...defaultObjParams,
  wallThickness: 0.2,
  shelfThickness: 0.1,
  numShelves: 4,
  shelfMaterial: new T.MeshStandardMaterial({ color: "Orange" }),
}
export class Bookshelf extends Object {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super();
    Object.assign(this, defaultBookshelfParams, config);
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const depth = this.scale.z;

    // Parameter Saftey Checks
    if(width/2 <= 2 * wallThickness) {
      throw new EvalError("The shelf walls are too thick for the width");
    }
    const totalObjHeight = 2 * this.wallThickness +this.numShelves * this.shelfThickness;
    if(height/2 <= totalObjHeight) {
      throw new EvalError("The shelf walls and shelves are too thick for the height");
    }
    if(depth/2 <= this.wallThickness) {
      throw new EvalError("The shelf walls are too thick for the depth");
    }

    // Create the back wall
    const backGeometry = new T.BoxGeometry(width, height, this.wallThickness);
    const backWall = new T.Mesh(backGeometry);
    backWall.position.set(0, 0, (this.wallThickness - depth) / 2);
    this.add(backWall);
    this.loadTexture(backWall, './src/textures/shelf.jpg', this.material, width, height)

    // Create the Side Walls
    const verticalDimensions = {
      width: this.wallThickness,
      height: this.height - this.wallThickness,
      depth: depth - this.wallThickness,
      widthSegments: 1,
      heightSegments: 1,
      depthSegments: 1,
    }
    const verticalGeometry = new T.BoxGeometry(...verticalDimensions);
    const leftWall = new T.Mesh(verticalGeometry);
    const rightWall = new T.Mesh(verticalGeometry);
    leftWall.position.set((this.wallThickness - width) / 2, 0, 0);
    rightWall.position.set((width - this.wallThickness) / 2, 0, 0);
    this.add(leftWall, rightWall);
    this.loadTexture(leftWall, './src/textures/shelf.jpg', this.material, verticalDimensions.depth, verticalDimensions.height);
    this.loadTexture(rightWall, './src/textures/shelf.jpg', this.material, verticalDimensions.depth, verticalDimensions.height);

    // Create the top and bottom walls
    const horizontalDimensions = {
      width: this.width - 2 * this.wallThickness,
      height: this.wallThickness,
      depth: depth - this.wallThickness,
      widthSegments: 1,
      heightSegments: 1,
      depthSegments: 1,
    };
    const horizontalGeometry = new T.BoxGeometry(...horizontalDimensions);
    const topWall = new T.Mesh(horizontalGeometry);
    const bottomWall = new T.Mesh(horizontalGeometry);
    topWall.position.set(0, (height - this.wallThickness) / 2, 0);
    bottomWall.position.set(0, (this.wallThickness - height) / 2, 0);
    this.add(topWall, bottomWall);
    this.loadTexture(topWall, './src/textures/shelf.jpg', this.material, horizontalDimensions.width, horizontalDimensions.height);
    this.loadTexture(bottomWall, './src/textures/shelf.jpg', this.material, horizontalDimensions.width, horizontalDimensions.height);

    // Create Shelves
    const shelfDimensions = {
      width: width - 2 * this.thickness,
      height: this.shelfThickness,
      depth: depth - this.thickness,
      widthSegments: 1,
      heightSegments: 1,
      depthSegments: 1,
    }
    const shelfGeometry = new T.BoxGeometry(...shelfDimensions);
    const shelfSpacing = height / (this.numShelves + 2);
    for (let i=1; i<=this.numShelves; i++) {
      const shelf = new T.Mesh(shelfGeometry);
      shelf.position.set(0, i * shelfSpacing, 0);
      this.add(shelf);
      this.loadTexture(shelf, './src/textures/shelf.jpg', this.shelfMaterial, shelfDimensions.width, shelfDimensions.depth);
    }
  }
}


const defaultCouchParams = {
  ...defaultObjParams,
  seatHeight: 0.5,
  backDepth: 0.35,
}
export class Couch extends Object {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super(config, defaultCouchParams);
    
    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const depth = this.scale.z;

    const seatGeometry = new T.BoxGeometry(width, this.seatHeight, depth);
    const seat = new T.Mesh(seatGeometry);
    base.position.set(0, (this.seatHeight - this.height) / 2, 0);
    this.add(base);
    this.loadTexture(seat, './src/textures/couch.jpg', this.material, width, depth)

    const backGeometry = new T.BoxGeometry(width, height-this.seatHeight, this.backDepth);
    const back = new T.Mesh(backGeometry);
    back.position.set(0, this.seatHeight / 2 , 0);
    this.add(back);
    this.loadTexture(back, './src/textures/couch.jpg', this.material, width, height-this.seatHeight)
  }
}


const defaultDoorParams = {
  ...defaultObjParams,
  frameMaterial: new T.MeshStandardMaterial({ color: "blue" }),
  handleMaterial: new T.MeshStandardMaterial({ color: "silver" }),
}
/**
 * 
 */
export class Door extends Object {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super(config, defaultDoorParams);

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const thickness = this.scale.z;

    // Frame top
    const topGeometry = new T.BoxGeometry(width, thickness, thickness);
    this.frameTop = new T.Mesh(topGeometry);
    this.frameTop.position.set(0, (height - thickness) / 2, 0);
    this.frameTop.castShadow = this.castShadow;
    this.frameTop.receiveShadow = this.receiveShadow;
    this.add(this.frameTop);
    this.loadTexture(frameTop, './src/textures/frame.jpg', this.frameMaterial);

    // Frame left
    const leftGeometry = new T.BoxGeometry(thickness, height, thickness);
    this.frameLeft = new T.Mesh(leftGeometry);
    this.frameLeft.position.set((-width + thickness) / 2, 0, 0);
    this.frameLeft.castShadow = this.castShadow;
    this.frameLeft.receiveShadow = this.receiveShadow;
    this.add(this.frameLeft);
    this.loadTexture(frameLeft, './src/textures/frame.jpg', this.frameMaterial);

    // Frame right
    const rightGeometry = new T.BoxGeometry(thickness, height, thickness);
    this.frameRight = new T.Mesh(rightGeometry);
    this.frameRight.position.set((width - thickness) / 2, 0, 0);
    this.frameRight.castShadow = this.castShadow;
    this.frameRight.receiveShadow = this.receiveShadow;
    this.add(this.frameRight);
    this.loadTexture(frameRight, './src/textures/frame.jpg', this.frameMaterial);

    // Door with hinge
    this.hinge = new T.Object3D();
    const doorGeometry = new T.BoxGeometry(width - 2 * thickness, height - thickness, thickness);
    this.door = new T.Mesh(doorGeometry);
    this.hinge.position.set(-(width - thickness) / 2, 0, 0);
    this.door.position.set((width - thickness) / 2, -thickness / 2, 0);
    this.hinge.add(this.door);
    this.add(this.hinge);
    this.loadTexture(this.door, './src/textures/door.jpg', this.material);

    // Handles
    const handleGeometry = new T.CylinderGeometry(0.03, 0.03, 0.15, 16);
    const frontHandle = new T.Mesh(handleGeometry);
    frontHandle.rotation.x = Math.PI / 2;
    frontHandle.position.set(3 * width / 4, 0, thickness / 2);
    this.hinge.add(frontHandle);
    this.loadTexture(frontHandle, './src/textures/handle.jpg', this.handleMaterial);

    const backHandle = new T.Mesh(new T.CylinderGeometry(handleGeometry));
    backHandle.rotation.x = -Math.PI / 2;
    backHandle.position.set(3 * width / 4, 0, -thickness / 2);
    this.hinge.add(backHandle);
    this.loadTexture(backHandle, './src/textures/handle.jpg', this.handleMaterial);
  }
}


const defaultOpenBoxParams = {
  ...defaultObjParams,
  wallThickness: 0.1,
  openSide: "front" // Options: front, back, left, right, top, bottom
}
/**
 * Creates a box with one of the sides is open
 */
export class OpenBox extends Object {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super(config, defaultOpenBoxParams);

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const depth = this.scale.z;
    const thick = this.wallThickness;

    // Create the bottom and top sides
    const verticalGeometry = new T.BoxGeometry(width, thick, depth);
    if(this.openSide != "bottom") {
      const bottom = new T.Mesh(verticalGeometry, this.Material);
      bottom.position.set(0, (thick - height) / 2, 0);
      this.add(bottom);
      this.loadTexture(bottom, './src/textures/wood.jpg', this.material);
    }
    if(this.openSide != "top") {
      const top = new T.Mesh(verticalGeometry, this.Material);
      top.position.set(0, (height - thick) / 2, 0);
      this.add(top);
      this.loadTexture(top, './src/textures/wood.jpg', this.material);
    }
    
    // Create the left and right sides
    const lateralGeometry = new T.BoxGeometry(thick, height - (2*thick), depth);
    if(this.openSide != "left") {
      const left = new T.Mesh(lateralGeometry, this.Material);
      left.position.set((thick - width) / 2, 0, 0);
      this.add(left)
      this.loadTexture(left, './src/textures/wood.jpg', this.material);
    }
    if(this.openSide != "right") {
      const right = new T.Mesh(lateralGeometry, this.Material);
      right.position.set((width - thick) / 2, 0, 0);
      this.add(right)
      this.loadTexture(right, './src/textures/wood.jpg', this.material);
    }

    // Create the back and front sides
    const longitudinalGeometry = new T.BoxGeometry(width - (2*thick), height - (2*thick), thick);
    if(this.openSide != "back") {
      const back = new T.Mesh(longitudinalGeometry, this.Material);
      back.position.set(0, 0, (depth - thick) / 2);
      this.add(back);
      this.loadTexture(back, './src/textures/wood.jpg', this.material);
    }
    if(this.openSide != "front") {
      const front = new T.Mesh(longitudinalGeometry, this.Material);
      front.position.set(0, 0, (thick - depth) / 2);
      this.add(front)
      this.loadTexture(front, './src/textures/wood.jpg', this.material);
    }
  }
}


const defaultTableParams = {
  ...defaultObjParams,
  legHeight: 0.75,
  legRadius: 0.1,
  legWidth: 0.75,
  legDepth: 0.75, 
  legMaterial: new T.MeshStandardMaterial({ color: "brown" }),
  topThickness: 0.1,
}
export class Table extends Object {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super(config, defaultTableParams);

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const depth = this.scale.z;

    // Create the top of the table
    const top = new T.Mesh(new T.BoxGeometry(width, this.topThickness, depth), this.Material);
    top.position.set(0, height, 0);
    this.add(top);
    this.loadTexture(top, './src/textures/tableTop.jpg', this.material);

    const legParams = {
      radiusTop: this.legRadius,
      radiusBottom: this.legRadius,
      height: height - this.topThickness,
      radialSegments: 10,
      heightSegments: 1,
      openEnded: false,
      thetaStart: 0,
      thetaLength: twoPi,
    }
    const legGeometry = new T.CylinderGeometry(...legParams);
    const legPositions = [
      [-this.legWidth/2, legParams.height, -this.legDepth/2],
      [-this.legWidth/2, legParams.height, this.legDepth/2],
      [this.legWidth/2, legParams.height, -this.legDepth/2],
      [this.legWidth/2, legParams.height, this.legDepth/2],
    ];

    for (const [lx, ly, lz] of legPositions) {
      const leg = new T.Mesh(legGeo);
      leg.position.set(lx, ly, lz);
      this.add(leg);
      this.loadTexture(leg, './src/textures/leg.jpg', this.legMaterial);
    }
  }
}


const defaultWindowParams = {
  ...defaultObjParams,
  glassMaterial: new T.MeshStandardMaterial({ color: "silver" }),
}
/**
 * 
 */
export class Window extends Object {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super(config, defaultWindowParams);

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const thickness = this.scale.z;

    // Frame top
    const horizontalGeometry = new T.BoxGeometry(width - thickness, thickness, thickness)
    this.frameTop = new T.Mesh(horizontalGeometry);
    this.frameTop.position.set(0, (height- thickness) / 2, 0);
    this.frameTop.castShadow = this.castShadow;
    this.frameTop.receiveShadow = this.receiveShadow;
    this.add(this.frameTop);
    this.loadTexture(this.frameTop, './src/textures/frame.jpg', this.material);

    // Frame bottom
    this.frameBottom = new T.Mesh(horizontalGeometry, this.Material);
    this.frameBottom.position.set(0, (-height+ thickness) / 2, 0);
    this.frameBottom.castShadow = this.castShadow;
    this.frameBottom.receiveShadow = this.receiveShadow;
    this.add(this.frameBottom);
    this.loadTexture(this.frameBottom, './src/textures/frame.jpg', this.material);

    // Frame left
    const verticalGeometry = new T.BoxGeometry(thickness, height, thickness);
    this.frameLeft = new T.Mesh(verticalGeometry);
    this.frameLeft.position.set((-width + thickness) / 2, 0, 0);
    this.frameLeft.castShadow = this.castShadow;
    this.frameLeft.receiveShadow = this.receiveShadow;
    this.add(this.frameLeft);
    this.loadTexture(this.frameLeft, './src/textures/frame.jpg', this.material);

    // Frame right
    this.frameRight = new T.Mesh(verticalGeometry);
    this.frameRight.position.set((width - thickness) / 2, 0, 0);
    this.frameRight.castShadow = this.castShadow;
    this.frameRight.receiveShadow = this.receiveShadow;
    this.add(this.frameRight);
    this.loadTexture(this.frameRight, './src/textures/frame.jpg', this.material);

    // Glass
    this.glass = new T.Mesh(new T.PlaneGeometry(width, height));
    this.glass.material.side = T.DoubleSide;
    this.glass.position.z = 0.05;
    this.add(this.glass);
    this.loadTexture(this.glass, './src/textures/glass.jpg', this.glassMaterial);
  }
}




