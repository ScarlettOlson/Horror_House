import * as T from '../../CS559-Three/build/three.module.js';
import { validateNumber } from '../validation.js';
import * as interactiveObjs from './interactive_objects.js';
import * as simpleObjs from './simple_objects.js';
import * as validate from '../validation.js'


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

    // Get Shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const depth = this.scale.z;

    // Validate parameters
    validate.validateNumber(this.windowOffsetX, "windowOffsetX", min = -width/2, max = width/2);
    validate.validateNumber(this.windowOffsetY, "windowOffsetY", min = -height/2, min = height/2);
    validate.validateNumber(this.windowWidth, "windowWidth", max = width);
    validate.validateNumber(this.windowHeight, "windowHeight", max = height);

    // Create bottom wall
    const bottomHeight = (height/2) + this.windowOffsetY - (this.windowHeight/2);
    if(bottomHeight > 0) {
      const bottomWallParams = {...this};
      bottomWallParams.position = new T.Vector3(0, (bottomHeight - height) / 2, 0);
      bottomWallParams.scale = new T.Vector3(width, bottomHeight, depth);
      // bottomWallConfig.textureSpacingX = 1;
      // bottomWallConfig.textureSpacingY = 1;

      const bottomWall = new simpleObjs.Wall(bottomWallParams);
      this.add(bottomWall);
    }

    // Create left wall
    const leftWidth = (width/2) + this.windowOffsetX - (this.windowWidth/2);
    if(leftWidth > 0) {
      const leftWallParams = {...this};
      leftWallParams.position = new T.Vector3((leftWidth - width) / 2, 0, 0);
      leftWallParams.scale = new T.Vector3(leftWidth, height, depth);

      const leftWall = new simpleObjs.Wall(leftWallParams);
      this.add(leftWall);
    }

    // Create right wall
    const rightWidth = (width/2) - this.windowOffsetX - (this.windowWidth/2);
    if(rightWidth > 0) {
      const rightWallParams = {...this};
      rightWallParams.position = new T.Vector3((width - rightWidth) / 2, 0, 0);
      rightWallParams.scale = new T.Vector3(rightWidth, height, depth);

      const rightWall = new simpleObjs.Wall(rightWallParams);
      this.add(rightWall);
    }

    // Create Top Wall
    const topHeight = (height/2) - this.windowOffsetY - (this.windowHeight/2);
    if(topHeight > 0) {
      const topWallParams = {...this};
      topWallParams.position = new T.Vector3(0, (height - topHeight) / 2, 0);
      topWallParams.scale = new T.Vector3(width - leftWidth - rightWidth, topHeight, depth);

      const topWall = new simpleObjs.Wall(topWallParams);
      this.add(topWall);
    }

    // Create the window
    const windowParams = {
        ...this,
        position: new T.Vector3(this.windowOffsetX, this.windowOffsetY, 0),
        scale: new T.Vector3(this.windowWidth, this.windowHeight, depth),
    };
    const window = new simpleObjs.Window(windowParams);
    this.add(window);
  }
}


export const defaultWallWithPassageParams = {
  ...simpleObjs.defaultObjParams,
  passageOffsetX: 0,
  passageWidth: 0.2,
  passageHeight: 0.7,
}
export class WallWithPassage extends simpleObjs.Object {
  constructor(config) {
    super(config, defaultWallWithPassageParams);

    // Get Shape Params
    const width = this.scale.x;
    const height = this.scale.y;
    const depth = this.scale.z;

    // Validate parameters
    validate.validateNumber(this.passageOffsetX, "passageOffset", min = -width/2, max = width/2);
    validate.validateNumber(this.passageWidth, "passageWidth", max = width);
    validate.validateNumber(this.passageHeight, "passageHeight", max = width);

    
    // Create left wall
    const leftWidth = (width/2) + this.passageOffsetX - (this.passageWidth/2);
    if(leftWidth > 0) {
      const leftWallParams = {...this};
      leftWallParams.position = new T.Vector3((leftWidth - width) / 2, 0, 0);
      leftWallParams.scale = new T.Vector3(leftWidth, height, depth);

      const leftWall = new simpleObjs.Wall(leftWallParams);
      this.add(leftWall);
    }

    // Create right wall
    const rightWidth = (width/2) - this.passageOffsetX - (this.passageWidth/2);
    if(rightWidth > 0) {
      const rightWallParams = {...this};
      rightWallParams.position = new T.Vector3((width - rightWidth) / 2, 0, 0);
      rightWallParams.scale = new T.Vector3(rightWidth, height, depth);

      const rightWall = new simpleObjs.Wall(rightWallParams);
      this.add(rightWall);
    }

    // Create Top Wall
    const topHeight = (height/2) - (this.passageHeight/2);
    if(topHeight > 0) {
      const topWallParams = {...this};
      topWallParams.position = new T.Vector3(0, (height - topHeight) / 2, 0);
      topWallParams.scale = new T.Vector3(width - leftWidth - rightWidth, topHeight, depth);

      const topWall = new simpleObjs.Wall(topWallParams);
      this.add(topWall);
    }
  } 
}


export const defaultDoorCabinetParams = {
    ...simpleObjs.defaultObjParams,
    wallThickness: 0.05,
    hingeSide: "left",
    doorHeight: 0.5,
    doorWidth: 0.5,
    doorMaterial: new T.MeshStandardMaterial({ color: "green" }),
    handleMaterial: new T.MeshStandardMaterial({ color: "silver" }),
}
export class DoorCabinet extends simpleObjs.Object {
    constructor(config) {
        // Create Group, set it's position, and set it's orientation
        super(config, defaultDoorCabinetParams);

        // Get shape Params
        const width = this.scale.x;
        const height = this.scale.y;
        const depth = this.scale.z;

        // Validate Entries
        validate.validateNumber(this.wallThickness, "wallThickness", max=this.scale.min/2);
        validate.validateNumber(this.doorHeight, "doorHeight", max=height - (2 * this.wallThickness));
        validate.validateNumber(this.doorWidth, "doorWidth", max=width - (2 * this.wallThickness));
        validate.validateMaterial(this.doorMaterial, "doorMaterial");
        validate.validateMaterial(this.handleMaterial, "handleMaterial");

        // Create the back wall
        const backGeometry = new T.BoxGeometry(width, height, this.wallThickness);
        const backWall = new T.Mesh(backGeometry, this.Material);
        backWall.castShadow = this.castShadow;
        backWall.receiveShadow = this.receiveShadow;
        backWall.position.set(0, 0, (this.wallThickness - depth) / 2);
        this.add(backWall);

        // Create the Side Walls
        const verticalDimensions = {
        width: this.wallThickness,
        height: height - this.wallThickness,
        depth: depth - this.wallThickness,
        widthSegments: 1,
        heightSegments: 1,
        depthSegments: 1,
        }
        const verticalGeometry = new T.BoxGeometry(...verticalDimensions);

        const leftWall = new T.Mesh(verticalGeometry, this.Material);
        leftWall.position.set((this.wallThickness - width) / 2, 0, 0);
        leftWall.castShadow = this.castShadow;
        leftWall.receiveShadow = this.receiveShadow;

        const rightWall = new T.Mesh(verticalGeometry, this.Material);
        rightWall.position.set((width - this.wallThickness) / 2, 0, 0);
        rightWall.castShadow = this.castShadow;
        rightWall.receiveShadow = this.receiveShadow;
        this.add(leftWall, rightWall);

        // Create the top and bottom walls
        const horizontalDimensions = {
        width: width - 2 * this.wallThickness,
        height: this.wallThickness,
        depth: depth - this.wallThickness,
        widthSegments: 1,
        heightSegments: 1,
        depthSegments: 1,
        };
        const horizontalGeometry = new T.BoxGeometry(...horizontalDimensions);

        const bottomWall = new T.Mesh(horizontalGeometry, this.Material);
        bottomWall.position.set(0, (this.wallThickness - height) / 2, 0);
        bottomWall.castShadow = this.castShadow;
        bottomWall.receiveShadow = this.receiveShadow;

        const topWall = new T.Mesh(horizontalGeometry, this.Material);
        topWall.position.set(0, (height - this.wallThickness) / 2, 0);
        topWall.castShadow = this.castShadow;
        topWall.receiveShadow = this.receiveShadow;

        this.add(topWall, bottomWall);

        // Create the hing and door
        const hinge = new T.Group();
        const doorGeom = new T.BoxGeometry(doorWidth, doorHeight, wallThickness);
        const door = new T.Mesh(doorGeom, this.doorMaterial);
        let handlePosition = new T.Vector3(3 * doorWidth / 8, 0, 0);
        if(this.hingeSide == "left") {
            hinge.position.set((this.wallThickness - width) / 2, 0, depth / 2);
            door.position.set(doorWidth/2, 0, (depth - this.wallThickness) / 2);
        }
        else if(this.hingeSide == "right") {
            hinge.position.set((width - this.wallThickness) / 2, 0, depth / 2);
            door.position.set(-doorWidth/2, 0, (depth - this.wallThickness) / 2);
            handlePosition.x *= -1; // Flip handle Position
        }
        else {
            throw new EvalError("Hinge Side: " + this.hingeSide + "is not a valid position");
        }
        hinge.add(door);
        this.add(hinge);

        // Create the handle for the door
        const handleParams = {
            ...this,
            postion: handlePosition,
            scale: new T.Vector3(doorHeight/3, 2*thick, thick/4),
            material: this.handleMaterial,
        };
        const handle = new Handle(handleParams);
        door.add(handle);
    }
}


export const defaultDrawerCabinetParams = {
  ...simpleObjs.defaultObjParams,
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

    validate.validateNumber(this.wallThickness, "wallThickness", max = this.scale.min/2);
    validate.validateNumber(this.drawerWidth, "drawerWidth", max = width - 2*thick);
    validate.validateNumber(this.drawerHeight, "drawerHeight", max = height - 2*thick);
    validate.validateNumber(this.drawerDepth, "drawerDepth", max = depth - thick);
    validate.validateMaterial(this.drawerMaterial, "drawerMaterial");
    validate.validateMaterial(this.handleMaterial, "handleMaterial");

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
  ...simpleObjs.defaultObjParams,
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

    // Validate parameters
    validate.validateNumber(this.wallThickness, "wallThickness", max = width/2);
    validate.validateMaterial(this.handleMaterial, "handleMaterial");
    
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

