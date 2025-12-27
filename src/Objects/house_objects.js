import * as T from '../../CS559-Three/build/three.module.js';
import * as interactiveObjs from './interactive_objects.js';
import * as simpleObjs from './simple_objects.js';


// Classes for complex objects

export const defaultWallWithWindowParams = {
  ...simpleObjs.defaultWindowParams,
  windowOffsetX: 0,
  windowOffsetY: 0,
  windowWidth: 0.5,
  windowHeight: 0.5,
}
export class WallWithWindow extends simpleObjs.Object {
  constructor(config) {
    super(config, defaultWallWithWindowParams);

    // Create bottom wall
    const bottomHeight = (this.height/2) + this.windowOffsetY - (this.windowHeight/2);
    if(bottomHeight > 0) {
      const bottomWallParams = {...this};
      bottomWallParams.position = new T.Vector3(0, (bottomHeight - this.height) / 2, 0);
      bottomWallParams.scale = new T.Vector3(this.width, bottomHeight, this.depth);
      // bottomWallConfig.textureSpacingX = 1;
      // bottomWallConfig.textureSpacingY = 1;

      const bottomWall = new simpleObjs.Wall(bottomWallParams);
      this.add(bottomWall);
    }

    // Create left wall
    const leftWidth = (this.width/2) + this.windowOffsetX - (this.windowWidth/2);
    if(leftWidth > 0) {
      const leftWallParams = {...this};
      leftWallParams.position = new T.Vector3((leftWidth - this.width) / 2, 0, 0);
      leftWallParams.scale = new T.Vector3(leftWidth, this.height, this.depth);

      const leftWall = new simpleObjs.Wall(leftWallParams);
      this.add(leftWall);
    }

    // Create right wall
    const rightWidth = (this.width/2) - this.windowOffsetX - (this.windowWidth/2);
    if(rightWidth > 0) {
      const rightWallParams = {...this};
      rightWallParams.position = new T.Vector3((this.width - rightWidth) / 2, 0, 0);
      rightWallParams.scale = new T.Vector3(rightWidth, this.height, this.depth);

      const rightWall = new simpleObjs.Wall(rightWallParams);
      this.add(rightWall);
    }

    // Create Top Wall
    const topHeight = (this.height/2) - this.windowOffsetY - (this.windowHeight/2);
    if(topHeight > 0) {
      const topWallParams = {...this};
      topWallParams.position = new T.Vector3(0, (this.height - topHeight) / 2, 0);
      topWallParams.scale = new T.Vector3(this.width - leftWidth - rightWidth, topHeight, this.depth);

      const topWall = new simpleObjs.Wall(topWallParams);
      this.add(topWall);
    }

    // Create the window
    const windowParams = {...this};
    windowParams.position = new T.Vector3(this.windowOffsetX, this.windowOffsetY, 0);
    windowParams.scale = new T.Vector3(this.windowWidth, this.windowHeight, this.depth);

    const window = new simpleObjs.window(windowParams);
    this.add(window);
  }
}


export const defaultWallWithPassageParams = {
  ...simpleObjs.defaultObjParams,
  passageOffsetX: 0,
  passageWidth: 0.2,
  passageHeight: 0.7,
}
export class WallWithPassage extends simpleObjs.Objects {
  constructor(config) {
    super(config, defaultWallWithPassageParams);

    
    // Create left wall
    const leftWidth = (this.width/2) + this.passageOffsetX - (this.passageWidth/2);
    if(leftWidth > 0) {
      const leftWallParams = {...this};
      leftWallParams.position = new T.Vector3((leftWidth - this.width) / 2, 0, 0);
      leftWallParams.scale = new T.Vector3(leftWidth, this.height, this.depth);

      const leftWall = new simpleObjs.Wall(leftWallParams);
      this.add(leftWall);
    }

    // Create right wall
    const rightWidth = (this.width/2) - this.passageOffsetX - (this.passageWidth/2);
    if(rightWidth > 0) {
      const rightWallParams = {...this};
      rightWallParams.position = new T.Vector3((this.width - rightWidth) / 2, 0, 0);
      rightWallParams.scale = new T.Vector3(rightWidth, this.height, this.depth);

      const rightWall = new simpleObjs.Wall(rightWallParams);
      this.add(rightWall);
    }

    // Create Top Wall
    const topHeight = (this.height/2) - (this.passageHeight/2);
    if(topHeight > 0) {
      const topWallParams = {...this};
      topWallParams.position = new T.Vector3(0, (this.height - topHeight) / 2, 0);
      topWallParams.scale = new T.Vector3(this.width - leftWidth - rightWidth, topHeight, this.depth);

      const topWall = new simpleObjs.Wall(topWallParams);
      this.add(topWall);
    }
  } 
}


export const defaultDoorCabinetParams = {
  ...defaultObjParams,
  wallThickness: 0.05,
  hingeSide: "left",
  doorHeight: 0.5,
  doorWidth: 0.5,
  doorMaterial: new T.MeshStandardMaterial({ color: "green" }),
  handleMaterial: new T.MeshStandardMaterial({ color: "silver" }),
}
export class DoorCabinet extends T.Group {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super();
    Object.assign(this, defaultDoorCabinetParams, config);
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const depth = this.scale.z;

    // Parameter Saftey Check
    if(width < 2*this.wallThickness + doorWidth) {
      throw new EvalError("The cabinet is not wide enough for the given parameters");
    }
    if(height <= 2*this.wallThickness + doorHeight) {
      throw new EvalError("The cabinet is not tall enough for the given parameters");
    }
    if(depth <= 2*this.wallThickness) {
      throw new EvalError("The cabinet is not deep enough for the given parameters");
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

    // Create the hing
    this.hinge = new T.Group();
    if(this.hingeSide == "left") {
      this.hinge.position.set((this.wallThickness - width) / 2, 0, depth / 2);
    }
    else if(this.hingeSide == "right") {
      this.hinge.position.set((width - this.wallThickness) / 2, 0, depth / 2);
    }
    else {
      throw new EvalError("Hinge Side: " + this.hingeSide + "is not a valid position");
    }
    this.add(this.hinge);

    // Create the door
    const doorGeom = new T.BoxGeometry(doorWidth, doorHeight, wallThickness);
    const door = new T.Mesh(doorGeom, this.doorMaterial);
    door.position.set(0, 0, (depth - this.wallThickness) / 2);
    this.hinge.add(door);
    this.door = door;

    // TODO:    CREATE HANDLE SHAPE and add it to the door
    const handleShape = new T.Curve();
  }
}


export const defaultDrawerCabinetParams = {
  ...defaultObjParams,
  wallThickness: 0.1,
  drawerWidth: 0.5,
  drawerHeight: 0.2,
  drawerDepth: 0.8,
  drawerMaterial: new T.MeshStandardMaterial({ color:"green" }),
  handleMaterial: new T.MeshStandardMaterial({ color:"silver" }),
}
export class DrawerCabinet extends T.Group {
  constructor(config) {
    // Create Group, set it's position, and set it's orientation
    super(config, defaultDrawerCabinetParams);

    // Get shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const depth = this.scale.z;
    const thick = this.wallThickness;

    // Parameter Saftey Check
    if(width < 2*thick + this.drawerWidth) {
      throw new EvalError("The cabinet is not wide enough for the given parameters");
    }
    if(height <= 2*thick + this.drawerHeight) {
      throw new EvalError("The cabinet is not tall enough for the given parameters");
    }
    if(depth <= thick + this.drawerDepth) {
      throw new EvalError("The cabinet is not deep enough for the given parameters");
    }

    // Create the main body
    const body = new OpenBox({ ...this });
    this.add(body);

    const drawerParams = {...this};
    drawerParams.position = new T.Vector3(0, 0, 0);
    drawerParams.scale = new T.Vector3(this.drawerHeight, this.drawerHeight, this.drawerDepth);
    const drawer = new OpenBox(drawerParams);
    
    this.add(drawer);
    this.drawer = drawer;
  }
}


export const defaultDrawerParams = {
  ...defaultObjParams,
  wallThickness: 0.1,
  handleMaterial: new T.MeshStandardMaterial({ color: "silver" }),
}
/**
 * Creates a box that holds a drawer with a handle
 */
export class Drawer extends Object {
  constructor(config) {
    super(config, defaultDrawerParams);

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

