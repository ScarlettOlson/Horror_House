import * as T from '../CS559-Three/build/three.module.js';
const twoPi = 2 * Math.PI;
const halfPi = Math.PI / 2;

const defaultObjParams = {
  position: new T.Vector3(0, 0, 0),
  scale: new T.Vector3(1, 1, 1),
  material: new T.MeshStandardMaterial({ color: "red" }),
  rotationY: 0,
  castShadow: false,
  receiveShadow: false,
}
// ------------------------------------ Objects that use the base parameters only -----------------

/**
 * Flat plane creating a floor
 */
export class Floor extends T.Group {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super();
    Object.assign(this, defaultObjParams, config);
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;

    // Get shape Params
    const width = this.scale.x;
    const depth = this.scale.z;

    this.mesh = new T.Mesh(new T.PlaneGeometry(width, depth), this.Material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.material.side = T.DoubleSide;
    this.mesh.receiveShadow = this.receiveShadow;
    this.add(this.mesh);
  }
}

/**
 * Curved handle made of a tube
 * 
 * scale.x;   L Plane to represent the floor Plane to represent the floorength between the posts of the handle
 * scale.y;   Height of the handle posts
 * scale.z;   Used as the radius of the tube
 */
export class Handle extends T.Group {
  constructor(config) {
    super();
    Object.assign(this, defaultObjParams, config);
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;
    
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
    const tubeMesh = new T.Mesh(tubeGeometry, this.Material);
    this.add(tubeMesh);
  }
}

/**
 * Simple note that is visually interesting
 */
export class Note extends T.Group {
    constructor(config) {
        // Create Group, set it's position, and set it's orientation
        super();
        Object.assign(this, defaultOpenBoxParams, config);
        this.position.copy(this.position);
        this.rotation.y = this.rotationY;

        // Get shape Params
        const width = this.scale.x;
        const height = this.scale.y;
        const depth = this.scale.z;
        // Create a visual representation (paper/note) - make it bigger and vertical
        const planeGeometry = new T.PlaneGeometry(0.3, 0.4);
        this.mesh = new T.Mesh(planeGeometry, this.Material);
    
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
    }
}

/**
 * Creates a simple box geometry to represent a wall
 */
export class Wall extends T.Group {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super();
    Object.assign(this, defaultObjParams, config);
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const thickness = this.scale.z;

    this.mesh = new T.Mesh(new T.BoxGeometry(width, height, thickness), this.Material);
    this.mesh.castShadow = this.castShadow;
    this.mesh.receiveShadow = this.receiveShadow;
    this.add(this.mesh);
  }
}


// ------------------------------------ Objects that use additional parameters --------------------
const defaultBedParams = {
  ...defaultObjParams,
  legHeight: 0.35,
  legRadius: 0.1,
  legWidth: 0.75,
  legDepth: 0.75, 
  legMaterial: new T.MeshStandardMaterial({ color: "brown" }),
  mattressHeight: 0.2,
  mattressMaterial: new T.MeshStandardMaterial({ color: "white" }),
  headboardThickness: 0.1,
}
export class Bed extends T.Group {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super();
    Object.assign(this, defaultObjParams, config);
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;

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
      const leg = new T.Mesh(legGeometry, this.legMaterial);
      leg.position.set(lx, ly, lz);
      this.add(leg);
    });

    // Create the mattress
    const mattressGeometry = new T.BoxGeometry(width, this.mattressHeight, depth-this.headboardThickness);
    const mattress = new T.Mesh(mattressGeometry, this.mattressMaterial);
    mattress.position.set(0, this.legHeight + (this.mattressHeight - height) / 2, this.headboardThickness);
    this.add(mattress);

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
    const headboard = new T.Mesh(headboardGeometry, this.Material);
    headboard.position.set(0, -height/2, (this.headboardThickness - depth) / 2);
    this.add(headboard);
  }
}


const defaultBookshelfParams = {
  ...defaultObjParams,
  wallThickness: 0.2,
  shelfThickness: 0.1,
  numShelves: 4,
  shelfMaterial: new T.MeshStandardMaterial({ color: "Orange" }),
}
export class Bookshelf extends T.Group {
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
    const backWall = new T.Mesh(backGeometry, this.Material);
    backWall.position.set(0, 0, (this.wallThickness - depth) / 2);
    this.add(backWall);

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
    const leftWall = new T.Mesh(verticalGeometry, this.Material);
    const rightWall = new T.Mesh(verticalGeometry, this.Material);
    leftWall.position.set((this.wallThickness - width) / 2, 0, 0);
    rightWall.position.set((width - this.wallThickness) / 2, 0, 0);
    this.add(leftWall, rightWall);

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
    const topWall = new T.Mesh(horizontalGeometry, this.Material);
    const bottomWall = new T.Mesh(horizontalGeometry, this.Material);
    topWall.position.set(0, (height - this.wallThickness) / 2, 0);
    bottomWall.position.set(0, (this.wallThickness - height) / 2, 0);
    this.add(topWall, bottomWall);

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
      const shelf = new T.Mesh(shelfGeometry, this.shelfMaterial);
      shelf.position.set(0, i * shelfSpacing, 0);
      this.add(shelf);
    }
  }
}


const defaultCouchParams = {
  ...defaultObjParams,
  seatHeight: 0.5,
  backDepth: 0.35,
}
export class Couch extends T.Group {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super();
    Object.assign(this, defaultCouchParams, config);
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const depth = this.scale.z;

    const seatGeometry = new T.BoxGeometry(width, this.seatHeight, depth);
    const base = new T.Mesh(new T.BoxGeometry(seatGeometry, this.Material));
    const seatY = (this.seatHeight - this.height) / 2;
    base.position.set(0, seatY, 0);
    this.add(base);

    const backGeometry = new T.BoxGeometry(width, height-this.seatHeight, this.backDepth);
    const back = new T.Mesh(new T.BoxGeometry(backGeometry, this.Material));
    const backY = this.seatHeight / 2;
    back.position.set(0, backY , 0);
    this.add(back);
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
export class Door extends T.Group {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super();
    Object.assign(this, defaultDoorParams, config);
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const thickness = this.scale.z;

    // Frame top
    const topGeometry = new T.BoxGeometry(width, thickness, thickness);
    this.frameTop = new T.Mesh(topGeometry, this.frameMaterial);
    this.frameTop.position.set(0, (height - thickness) / 2, 0);
    this.frameTop.castShadow = this.castShadow;
    this.frameTop.receiveShadow = this.receiveShadow;
    this.add(this.frameTop);

    // Frame left
    const leftGeometry = new T.BoxGeometry(thickness, height, thickness);
    this.frameLeft = new T.Mesh(leftGeometry, this.frameMaterial);
    this.frameLeft.position.set((-width + thickness) / 2, 0, 0);
    this.frameLeft.castShadow = this.castShadow;
    this.frameLeft.receiveShadow = this.receiveShadow;
    this.add(this.frameLeft);

    // Frame right
    const rightGeometry = new T.BoxGeometry(thickness, height, thickness);
    this.frameRight = new T.Mesh(rightGeometry, this.frameMaterial);
    this.frameRight.position.set((width - thickness) / 2, 0, 0);
    this.frameRight.castShadow = this.castShadow;
    this.frameRight.receiveShadow = this.receiveShadow;
    this.add(this.frameRight);

    // Door with hinge
    this.hinge = new T.Object3D();
    const doorGeometry = new T.BoxGeometry(width - 2 * thickness, height - thickness, thickness);
    this.door = new T.Mesh(doorGeometry, this.frameMaterial);
    this.hinge.position.set(-(width - thickness) / 2, 0, 0);
    this.door.position.set((width - thickness) / 2, -thickness / 2, 0);
    this.door.castShadow = this.castShadow;
    this.door.receiveShadow = this.receiveShadow;
    this.hinge.add(this.door);
    this.add(this.hinge);

    // Handles
    const handleGeometry = new T.CylinderGeometry(0.03, 0.03, 0.15, 16);
    const frontHandle = new T.Mesh(handleGeometry, this.handelMaterial);
    frontHandle.rotation.x = Math.PI / 2;
    frontHandle.position.set(3 * width / 4, 0, thickness / 2);
    this.hinge.add(frontHandle);

    const backHandle = new T.Mesh(new T.CylinderGeometry(handleGeometry), this.handleMaterial);
    backHandle.rotation.x = -Math.PI / 2;
    backHandle.position.set(3 * width / 4, 0, -thickness / 2);
    this.hinge.add(backHandle);
  }
}


const defaultDrawerParams = {
  ...defaultObjParams,
  wallThickness: 0.1,
  handleMaterial: new T.MeshStandardMaterial({ color: "silver" }),
}
/**
 * Creates a box that holds a drawer with a handle
 */
export class Drawer extends T.Group {
  constructor(config) {
    super();
    Object.assign(this, defaultObjParams, config);
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const depth = this.scale.z;
    const thick = this.wallThickness;
    
    // Create the box that the drawer sits in
    const containerParams = { ...this };
    containerParams.position = new T.Vector3(0, 0, 0);
    const container = new OpenBox( containerParams );
    this.add(container);

    // Create the drawer and handle
    const drawerParams = { ...this };
    drawerParams.position = new T.Vector3(0, 0, 0);
    drawerParams.scale = new T.Vector3(width-thick, height-thick, depth-thick);
    const drawer = new OpenBox(drawerParams);
    this.add(drawer);

    const handleParams = {...this};
    handleParams.position = new T.Vector3(0, 0, 0);
    handleParams.scale = new T.Vector3(.4, .2, .1); // Length, Height, Radius
    handleParams.rotationY = halfPi;
    const handle = new Handle(handleParams);
    drawer.add(handle);
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
export class OpenBox extends T.Group {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super();
    Object.assign(this, defaultOpenBoxParams, config);
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;

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
    }
    if(this.openSide != "top") {
      const top = new T.Mesh(verticalGeometry, this.Material);
      top.position.set(0, (height - thick) / 2, 0);
    }
    
    // Create the left and right sides
    const lateralGeometry = new T.BoxGeometry(thick, height - (2*thick), depth);
    if(this.openSide != "left") {
      const left = new T.Mesh(lateralGeometry, this.Material);
      left.position.set((thick - width) / 2, 0, 0);
      this.add(left)
    }
    if(this.openSide != "right") {
      const right = new T.Mesh(lateralGeometry, this.Material);
      right.position.set((width - thick) / 2, 0, 0);
      this.add(right)
    }

    // Create the back and front sides
    const longitudinalGeometry = new T.BoxGeometry(width - (2*thick), height - (2*thick), thick);
    if(this.openSide != "back") {
      const back = new T.Mesh(longitudinalGeometry, this.Material);
      back.position.set(0, 0, (depth - thick) / 2);
      this.add(back);
    }
    if(this.openSide != "front") {
      const front = new T.Mesh(longitudinalGeometry, this.Material);
      front.position.set(0, 0, (thick - depth) / 2);
      this.add(front)
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
export class Table extends T.Group {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super();
    Object.assign(this, defaultTableParams, config);
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const depth = this.scale.z;

    // Create the top of the table
    const top = new T.Mesh(new T.BoxGeometry(width, this.topThickness, depth), this.Material);
    top.position.set(0, height, 0);
    this.add(top);

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
      const leg = new T.Mesh(legGeo, this.legMaterial);
      leg.position.set(lx, ly, lz);
      this.add(leg);
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
export class Window extends T.Group {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super();
    Object.assign(this, defaultWindowParams, config);
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const thickness = this.scale.z;

    // Frame top
    const horizontalGeometry = new T.BoxGeometry(width - thickness, thickness, thickness)
    this.frameTop = new T.Mesh(horizontalGeometry, this.Material);
    this.frameTop.position.set(0, (height- thickness) / 2, 0);
    this.frameTop.castShadow = this.castShadow;
    this.frameTop.receiveShadow = this.receiveShadow;
    this.add(this.frameTop);

    // Frame bottom
    this.frameBottom = new T.Mesh(horizontalGeometry, this.Material);
    this.frameBottom.position.set(0, (-height+ thickness) / 2, 0);
    this.frameBottom.castShadow = this.castShadow;
    this.frameBottom.receiveShadow = this.receiveShadow;
    this.add(this.frameBottom);

    // Frame left
    const verticalGeometry = new T.BoxGeometry(thickness, height, thickness);
    this.frameLeft = new T.Mesh(verticalGeometry, this.Material);
    this.frameLeft.position.set((-width + thickness) / 2, 0, 0);
    this.frameLeft.castShadow = this.castShadow;
    this.frameLeft.receiveShadow = this.receiveShadow;
    this.add(this.frameLeft);

    // Frame right
    this.frameRight = new T.Mesh(verticalGeometry, this.Material);
    this.frameRight.position.set((width - thickness) / 2, 0, 0);
    this.frameRight.castShadow = this.castShadow;
    this.frameRight.receiveShadow = this.receiveShadow;
    this.add(this.frameRight);

    // Glass
    this.glass = new T.Mesh(new T.PlaneGeometry(width, height), this.glassMaterial);
    this.glass.material.side = T.DoubleSide;
    this.glass.position.z = 0.05;
    this.add(this.glass);
  }
}




