import * as T from '../CS559-Three/build/three.module.js';
import { InteractiveCabinet, InteractiveDoor, InteractiveDrawer, InteractiveNote, BasementDoor } from './interactive.js';
import { createShineShader } from './load_texture.js';

const twoPi = 2 * Math.PI;
const halfPi = Math.PI / 2;


export function createHouse(
  w, h, d, t, 
  floorMat, ceilingMat, wallMat, frameMat, doorMat, handleMat, glassMat,
  couchMat, bookshelfMat, drawerMat, noteMat, tableMat, isPrototype
) {
  const doorW = 1.5;
  const doorH = Math.min(h, 2.5);

  // Create Groups
  const house = new T.Group();
  let groundObjs = [];
  let obstacles = [];
  let interactables = [];

  // Create Floor and ceiling
  // const floor = new Floor({ w, d, h: 0.01, mat: floorMat });
  // const ceil = new Floor({ w, d, h, mat: floorMat });
  // house.add(floor);
  // house.add(ceil);
  // groundObjs.push(floor);
  // obstacles.push(floor);

  // Build the exterior walls, windows, and doors of the house
  const exterior = createHouseExterior(w, h, d, t, floorMat, wallMat, frameMat, doorMat, handleMat, glassMat);
  house.add(exterior.group);
  exterior.groundObjs.forEach(obj => groundObjs.push(obj));
  exterior.obstacles.forEach(obj => obstacles.push(obj));
  exterior.interactables.forEach(obj => interactables.push(obj));


  // Create Bedroom walls with doors into the rooms
  const bedrooms = createBedroomWalls(h, t, doorW, doorH, wallMat, frameMat, doorMat, handleMat);
  house.add(bedrooms.group);
  bedrooms.obstacles.forEach(obj => obstacles.push(obj));
  bedrooms.interactables.forEach(obj => interactables.push(obj));

  // Create the furniture inside of the bedrooms
  const bedroomFurniture = createBedroomFurniture(couchMat, frameMat, drawerMat, handleMat, bookshelfMat);
  bedroomFurniture.objects.forEach(obj => house.add(obj));
  bedroomFurniture.obstacles.forEach(obj => obstacles.push(obj));
  bedroomFurniture.interactables.forEach(obj => interactables.push(obj));


  const kitchen = createKitchen({
    x: 7, y: 0, z: 6.5,
    w: 6, h: h, d: 7,
    wallT: t, wallMat, drawerMat, handleMat,
    doorW, doorH
  });
  kitchen.objects.forEach(obj => house.add(obj));
  kitchen.obstacles.forEach(obj => obstacles.push(obj));
  kitchen.interactables.forEach(obj => interactables.push(obj));

  // Create the dining Room
  const diningRoom = createDiningRoom(h, t, wallMat, tableMat, doorW, doorH);
  diningRoom.objects.forEach(obj => house.add(obj));
  diningRoom.obstacles.forEach(obj => obstacles.push(obj));

  // Create the basement rooom
  const basementRoom = createBasementRoom(h, t, wallMat, frameMat, doorW, doorH, doorMat, handleMat);
  basementRoom.objects.forEach(obj => house.add(obj));
  basementRoom.obstacles.forEach(obj => obstacles.push(obj));
  basementRoom.interactables.forEach(obj => interactables.push(obj));

  // Create the Living Room
  const livingRoom = createLivingRoom(h, couchMat, tableMat, drawerMat, handleMat);
  livingRoom.objects.forEach(obj => house.add(obj));
  livingRoom.obstacles.forEach(obj => obstacles.push(obj));
  livingRoom.interactables.forEach(obj => interactables.push(obj));

  // Create and place the notes
  // First Note is on a shelf in the fartest away door
  const note1 = new InteractiveNote({
    passwordPiece: '26',
    content: 'I found this note hidden on the old bookshelf.\nIndex: 1\nPassword piece: 26',
    material: noteMat,
    position: new T.Vector3(-2.3, 1.8, -6),
    passwordIndex: 0,
    useShineShader: !isPrototype,
    rotationY: 0,
  });
  const note2 = new InteractiveNote({
    passwordPiece: '43',
    content: 'I found this note hidden in the bedroom closet\nIndex: 2\nPassword piece: 43',
    material: noteMat,
    position: new T.Vector3(-6, 1.5, 2.2),
    passwordIndex: 1,
    useShineShader: !isPrototype,
    rotationY: Math.PI,
  });
  const note3 = new InteractiveNote({
    passwordPiece: '91',
    content: 'I found this note hidden in the kitchen cupboard\nIndex: 3\nPassword piece: 91',
    material: noteMat,
    position: new T.Vector3(9.6, 1.5, 6.2),
    passwordIndex: 2,
    useShineShader: !isPrototype,
    rotationY: Math.PI/2,
  });
  house.add(note1, note2, note3);
  interactables.push(note1, note2, note3);

  return { house, groundObjs, obstacles, interactables };
}


export function createHouseExterior(w, h, d, t, floorMat, wallMat, frameMat, doorMat, handleMat, windowMat) {
  const doorW = 1.5;
  const doorH = Math.min(h, 2.5);
  const winW = 1.2;
  const winH = 1.0;
  const winY = 0.5; // Window center height from ground (middle of wall height)

  const group = new T.Group();
  let obstacles = [];
  let groundObjs = [];
  let interactables = [];

  // Compute edges of the house
  const frontZ = d / 2 + t / 2;
  const rightX = w / 2 + t / 2
  const backZ = -frontZ;
  const leftX = -rightX;

  // Create Front walls, Windows, and Door
  // Shifted to x=-0.5 to center in remaining hallway
  const frontLeftWindow = new WallWithWindow({
    x: -6, y: h / 2, z: frontZ, w: 8, h: h, t: t,
    winX: 0, winY: winY, winW: winW, winH: winH,
    wallMat: wallMat, frameMat: frameMat, glassMat: windowMat, rotationY: 0
  });
  const frontDoorWall = new WallWithPassage({
    x: -0.5, y: h / 2, z: frontZ, h: h, w: 3, t: t,
    passageX: 0, passageW: doorW, passageH: doorH,
    wallMat: wallMat, rotationY: 0
  })
  const frontDoor = new Door({
    x: -0.5, y: doorH / 2, z: frontZ,
    w: doorW, h: doorH, t: t,
    frameMat, doorMat, handleMat, rotationY: 0
  });
  const frontCenterWindow = new WallWithWindow({
    x: 3.5, y: h / 2, z: frontZ,
    w: 5, h: h, t: t,
    winX: -0.5, winY: winY, winW: winW, winH: winH,
    wallMat: wallMat, frameMat: frameMat, glassMat: windowMat, rotationY: 0
  });
  const frontRightWindow = new WallWithWindow({
    x: 8, y: h / 2, z: frontZ,
    w: 4, h: h, t: t,
    winX: 0, winY: winY, winW: winW, winH: winH,
    wallMat: wallMat, frameMat: frameMat, glassMat: windowMat, rotationY: 0
  });
  group.add(frontLeftWindow);
  group.add(frontCenterWindow);
  group.add(frontDoorWall);
  group.add(frontDoor);
  group.add(frontRightWindow);
  obstacles.push(frontLeftWindow);
  obstacles.push(frontDoorWall);
  obstacles.push(frontDoor);
  obstacles.push(frontCenterWindow);
  obstacles.push(frontRightWindow);


  // Create the Right walls and windows
  const rightFrontWindow = new WallWithWindow({
    x: rightX, y: h / 2, z: 7, w: 6, h: h, t: t,
    winX: 1, winY: winY, winW: winW, winH: winH,
    wallMat: wallMat, frameMat: frameMat, glassMat: windowMat, rotationY: -Math.PI / 2
  });
  const rightCenterWindow = new WallWithWindow({
    x: rightX, y: h / 2, z: 1, w: 6, h: h, t: t,
    winX: 0, winY: winY, winW: winW, winH: winH,
    wallMat: wallMat, frameMat: frameMat, glassMat: windowMat, rotationY: -Math.PI / 2
  });
  const rightBackWall = new Wall({
    x: rightX, y: h / 2, z: -6,
    w: 8, h: h, t: t, mat: wallMat, rotationY: Math.PI / 2
  });
  group.add(rightFrontWindow);
  group.add(rightCenterWindow);
  group.add(rightBackWall);
  obstacles.push(rightFrontWindow);
  obstacles.push(rightCenterWindow);
  obstacles.push(rightBackWall);

  // Create the Back Walls and Windows
  const backRightWall = new Wall({
    x: 6, y: h / 2, z: backZ,
    w: 8, h: h, t: t,
    mat: wallMat, rotationY: 0
  });
  const backCenterWindow = new WallWithWindow({
    x: -1, y: h / 2, z: backZ,
    w: 6, h: h, t: t,
    winX: -1, winY: winY, winW: 2 * winW, winH: 1.5 * winH,
    wallMat, frameMat, glassMat: windowMat, rotationY: Math.PI
  });
  const backLeftWindow = new WallWithWindow({
    x: -7, y: h / 2, z: backZ,
    w: 6, h: h, t: t,
    winX: 0, winY: winY, winW, winH,
    wallMat, frameMat, glassMat: windowMat, rotationY: Math.PI
  });
  group.add(backRightWall);
  group.add(backCenterWindow);
  group.add(backLeftWindow);
  obstacles.push(backRightWall);
  obstacles.push(backCenterWindow);
  obstacles.push(backLeftWindow);


  // Creaet Left Walls and Bedroom Windows
  const leftBackWindow = new WallWithWindow({
    x: leftX, y: h / 2, z: -7.5,
    w: 5, h: h, t: t,
    winX: 0, winY: winY, winW, winH,
    wallMat, frameMat, glassMat: windowMat, rotationY: -Math.PI / 2
  });
  const leftCenterWindow = new WallWithWindow({
    x: leftX, y: h / 2, z: -1.5,
    w: 7, h: h, t: t,
    winX: 0, winY: winY, winW, winH,
    wallMat, frameMat, glassMat: windowMat, rotationY: -Math.PI / 2
  });
  const leftFrontWindow = new WallWithWindow({
    x: leftX, y: h / 2, z: 6,
    w: 8, h: h, t: t,
    winX: 0, winY: winY, winW, winH,
    wallMat, frameMat, glassMat: windowMat, rotationY: -Math.PI / 2
  });
  group.add(leftBackWindow);
  group.add(leftCenterWindow);
  group.add(leftFrontWindow);
  obstacles.push(leftBackWindow);
  obstacles.push(leftCenterWindow);
  obstacles.push(leftFrontWindow);


  // Exterior ground/foundation
  const exteriorGround = new Floor({
    w: w,
    d: d,
    h: 0.01,
    mat: floorMat
  });
  group.add(exteriorGround);
  groundObjs.push(exteriorGround);
  obstacles.push(exteriorGround);

  // Roof (simple flat roof for now)
  const roof = new Floor({
    w: w,
    d: d,
    h: h,
    mat: wallMat
  });
  group.add(roof);
  obstacles.push(roof);

  return { group, obstacles, groundObjs, interactables };
}

export function createBedroomWalls(h, t, doorW, doorH, wallMat, frameMat, doorMat, handleMat) {
  const group = new T.Group();
  let obstacles = [];
  let interactables = [];

  // Create Bedroom walls with doors into the rooms
  const bedroomHallwayWall1 = new WallWithPassage({
    x: -2, y: h / 2, z: 6, w: 8, h, t,
    passageX: 0, passageW: doorW, passageH: doorH,
    wallMat, rotationY: -Math.PI / 2
  });
  const bedroomDoor1 = new InteractiveDoor({
    x: -2, y: doorH / 2, z: 6, w: doorW, h: doorH, t: t,
    frameMat, doorMat, handleMat, rotationY: -Math.PI / 2
  });
  group.add(bedroomHallwayWall1);
  group.add(bedroomDoor1);
  obstacles.push(bedroomHallwayWall1);
  obstacles.push(bedroomDoor1);
  interactables.push(bedroomDoor1);

  const bedroomHallwayWall2 = new WallWithPassage({
    x: -2, y: h / 2, z: -2, w: 8, h, t,
    passageX: -2, passageW: doorW, passageH: doorH,
    wallMat, rotationY: Math.PI / 2
  });
  const bedroomDoor2 = new InteractiveDoor({
    x: -2, y: doorH / 2, z: 0, w: doorW, h: doorH, t: t,
    frameMat, doorMat, handleMat, rotationY: -Math.PI / 2
  });
  group.add(bedroomHallwayWall2);
  group.add(bedroomDoor2);
  obstacles.push(bedroomHallwayWall2);
  obstacles.push(bedroomDoor2);
  interactables.push(bedroomDoor2);

  const bedroomHallwayWall3 = new WallWithPassage({
    x: -2, y: h / 2, z: -8, w: 4, h, t,
    passageX: 0, passageW: doorW, passageH: doorH,
    wallMat, rotationY: Math.PI / 2
  });
  const bedroomDoor3 = new InteractiveDoor({
    x: -2, y: doorH / 2, z: -8, w: doorW, h: doorH, t: t,
    frameMat, doorMat, handleMat, rotationY: -Math.PI / 2
  });
  group.add(bedroomHallwayWall3);
  group.add(bedroomDoor3);
  obstacles.push(bedroomHallwayWall3);
  obstacles.push(bedroomDoor3);
  interactables.push(bedroomDoor3);

  // Create walls separating the bedrooms
  const bedroomSeperateWall1 = new Wall({ x: -6, y: h / 2, z: 2, w: 8, h, t: t, mat: wallMat });
  const bedroomSeperateWall2 = new Wall({ x: -6, y: h / 2, z: -5, w: 8, h, t: t, mat: wallMat });
  group.add(bedroomSeperateWall1);
  group.add(bedroomSeperateWall2);
  obstacles.push(bedroomSeperateWall1);
  obstacles.push(bedroomSeperateWall2);

  return { group, obstacles, interactables };
}

export function createBedroomFurniture(bedMat, frameMat, drawerMat, handleMat, bookshelfMat) {
  let objects = [];
  let obstacles = [];
  let interactables = [];

  // Create Beds for each of the rooms
  const bed1 = new Bed({
    x: -9.1, y: 0, z: 8.4, w: 1.5, h: 3, d: 3, mattressH: 0.5,
    mattressMat: bedMat, frameMat, rotationY: Math.PI
  });
  const bed2 = new Bed({
    x: -8.4, y: 0, z: 1.1, w: 1.5, h: 3, d: 3, mattressH: 0.5,
    mattressMat: bedMat, frameMat, rotationY: Math.PI / 2
  });
  const bed3 = new Bed({
    x: -9.1, y: 0, z: -8.4, w: 1.5, h: 3, d: 3, mattressH: 0.5,
    mattressMat: bedMat, frameMat, rotationY: 0
  });
  objects.push(bed1, bed2, bed3);
  obstacles.push(bed1, bed2, bed3);


  // Create nightstand beside beds
  const nightstand1 = new InteractiveDrawer({
    x: -7.75, y: 0, z: 9.5, w: 1, h: 3, d: 1,
    drawerMat, handleMat, rotationY: Math.PI
  });
  const nightstand2 = new InteractiveDrawer({
    x: -9.2, y: 0, z: -0.2, w: 1, h: 3, d: 1,
    drawerMat, handleMat, rotationY: Math.PI / 2
  });
  const nightstand3 = new InteractiveDrawer({
    x: -7.75, y: 0, z: -9.3, w: 1, h: 3, d: 1,
    drawerMat, handleMat, rotationY: 0
  });
  objects.push(nightstand1, nightstand2, nightstand3);
  obstacles.push(nightstand1, nightstand2, nightstand3);


  // Create Bookshelfs for each of the rooms
  const bookShelf1 = new Bookshelf({
    x: -8.5, y: 0.05, z: 2.5, w: 0.8, h: 2, d: 3,
    mat: bookshelfMat, rotationY: -Math.PI / 2
  });
  const bookShelf2 = new Bookshelf({
    x: -3.5, y: 0.05, z: 2.5, w: 0.8, h: 2, d: 3,
    mat: bookshelfMat, rotationY: -Math.PI / 2
  });
  const bookShelf3 = new Bookshelf({
    x: -8.5, y: 0.05, z: -4.4, w: 0.8, h: 2, d: 3,
    mat: bookshelfMat, rotationY: -Math.PI / 2
  });
  const bookShelf4 = new Bookshelf({
    x: -3.5, y: 0.05, z: 1.4, w: 0.8, h: 2, d: 3,
    mat: bookshelfMat, rotationY: Math.PI / 2
  });
  const bookShelf5 = new Bookshelf({
    x: -3.5, y: 0.05, z: -6, w: 0.8, h: 2, d: 3,
    mat: bookshelfMat, rotationY: Math.PI / 2
  });
  const bookShelf6 = new Bookshelf({
    x: -8.5, y: 0.05, z: -6, w: 0.8, h: 2, d: 3,
    mat: bookshelfMat, rotationY: Math.PI / 2
  });

  objects.push(bookShelf1, bookShelf2, bookShelf3, bookShelf4, bookShelf5, bookShelf6);
  obstacles.push(bookShelf1, bookShelf2, bookShelf3, bookShelf4, bookShelf5, bookShelf6);

  // Create Dressers
  const dresser1 = new InteractiveCabinet({
    x: -6, y: 1.25, z: 2.5, w: 2, h: 2.5, d: 1,
    cabinetMat: drawerMat, handleMat, openAngle: 5 * Math.PI / 6
  });
  const dresser2 = new InteractiveCabinet({
    x: -6, y: 1.25, z: -4.4, w: 2, h: 2.5, d: 1,
    cabinetMat: drawerMat, handleMat, openAngle: 5 * Math.PI / 6
  });
  const dresser3 = new InteractiveCabinet({
    x: -6, y: 1.25, z: -6, w: 2, h: 2.5, d: 1,
    cabinetMat: drawerMat, handleMat,
    rotationY: Math.PI, openAngle: 5 * Math.PI / 6
  });
  objects.push(dresser1, dresser2, dresser3);
  obstacles.push(dresser1, dresser2, dresser3);
  interactables.push(dresser1, dresser2, dresser3);


  return { objects, obstacles, interactables }
}

export function createKitchen({
  x, y, z, w, h, d,
  wallT, wallMat, drawerMat, handleMat,
  doorW, doorH, rotationY = 0
}) {
  let objects = [];
  let obstacles = [];
  let interactables = [];
  let drawers = [];


  // --- Walls with passages (relative to group origin) ---
  const hallPassage = new WallWithPassage({
    x: x + (-w / 2), y: y + h / 2, z: z,
    w: d, h, t: wallT,
    passageX: 0, passageW: doorW, passageH: doorH,
    wallMat, rotationY: Math.PI / 2
  });

  const diningRoomPassage = new WallWithPassage({
    x: x, y: y + (h / 2), z: z + (-d / 2),
    w: w, h, t: wallT,
    passageX: 0, passageW: doorW, passageH: doorH,
    wallMat, rotationY: 0
  });

  objects.push(hallPassage);
  objects.push(diningRoomPassage);
  obstacles.push(hallPassage, diningRoomPassage);

  // --- Drawers along one wall (relative placement) ---
  const drawerW = w / 5;
  //const drawerH = 1.25 * drawerW;
  for (let i = -2; i < 2; i++) {
    const drawer = new InteractiveDrawer({
      x: x + wallT / 2 + (i * drawerW),
      y: y + drawerW / 2,
      z: z + (d - drawerW) / 2,
      w: drawerW, h: drawerW, d: drawerW,
      drawerMat, handleMat, rotationY: Math.PI
    });
    objects.push(drawer);
    drawers.push(drawer);
    obstacles.push(drawer);
    interactables.push(drawer);
  }

  // Create cabinets on the other wall
  for (let i = -3; i < 0; i++) {
    const cabinet = new InteractiveCabinet({
      x: x + d / 2 - drawerW,
      y: y + drawerW,
      z: z + wallT + ((i + 0.5) * drawerW),
      w: drawerW, h: 2 * drawerW, d: drawerW,
      cabinetMat: drawerMat, handleMat, rotationY: -Math.PI / 2
    });
    objects.push(cabinet)
    obstacles.push(cabinet);
    interactables.push(cabinet);
  }

  return { objects, obstacles, interactables, drawers };
}

export function createDiningRoom(h, t, wallMat, tableMat, doorW, doorH) {
  let objects = [];
  let obstacles = [];

  const passage1 = new WallWithPassage({
    x: 7, y: h / 2, z: -4, w: 6, h, t: t,
    passageX:0, passageW: doorW, passsageH: 1,
    wallMat: wallMat

  });
  const passage2 = new WallWithPassage({
    x: 4, y: h / 2, z: -0.5, w: 7, h, t,
    passageX: -1, passageW: doorW, passageH: doorH,
    wallMat, rotationY: Math.PI / 2
  });
  objects.push(passage1, passage2);
  obstacles.push(passage1, passage2);

  const table = new Table({
    x: 7, y: 0, z: -1, w: 2, h: 1, d: 3,
    mat: tableMat
  });
  objects.push(table);
  obstacles.push(table);

  return { objects, obstacles }
}

export function createBasementRoom(h, t, wallMat, frameMat, doorW, doorH, doorMat, handleMat) {
  let objects = [];
  let obstacles = [];
  let interactables = [];

  // West Wall (separating from Hall)
  // X range [1, 4] -> West boundary is at x=1
  // Z range [3, 10] -> Center Z=6.5, Length=7
  const westWall = new WallWithPassage({
    x: 1, y: h / 2, z: 6.5, w: 7, h, t,
    passageX: 0, passageW: doorW, passageH: doorH,
    wallMat, rotationY: -Math.PI / 2
  });

  // North Wall (separating from middle/dining area) with Basement Door
  // X range [1, 4] -> Center X=2.5, Length=3
  // Z=3
  // Passage needed for door
  const northWall = new WallWithPassage({
    x: 2.5, y: h / 2, z: 3, w: 3, h, t,
    passageX: 0, passageW: doorW, passageH: doorH,
    wallMat, rotationY: 0
  });

  const basementDoor = new BasementDoor({
    x: 2.5, y: doorH / 2, z: 3, w: doorW, h: doorH, t,
    frameMat, doorMat, handleMat, rotationY: 0
  });

  objects.push(westWall, northWall, basementDoor);
  obstacles.push(westWall, northWall, basementDoor);
  interactables.push(basementDoor);

  // --- Staircase Room (Behind the door) ---
  // Extends North from z=3 to z=-3
  // X range: same as vestibule (1 to 4)

  // West Wall of staircase (x=1, z=0, len=6)
  const stairWestInfo = { x: 1, y: h / 2, z: 0, w: 6, h, t };
  const stairWest = new Wall({ ...stairWestInfo, mat: wallMat, rotationY: -Math.PI / 2 });

  // East Wall of staircase (x=4, z=0, len=6)
  const stairEastInfo = { x: 4, y: h / 2, z: 0, w: 6, h, t };
  const stairEast = new Wall({ ...stairEastInfo, mat: wallMat, rotationY: -Math.PI / 2 });

  // Rear Wall (North end) (x=2.5, z=-3, len=3)
  const stairRear = new Wall({ x: 2.5, y: h / 2, z: -3, w: 3, h, t, mat: wallMat, rotationY: 0 });

  // Ceiling/Roof for stairs? (Optional, skipping for now as per prompt "literally just a descending staircase")

  objects.push(stairWest, stairEast, stairRear);
  obstacles.push(stairWest, stairEast, stairRear);

  // --- Stairs ---
  const stairCount = 10;
  const stairW = 2.5; // fits within 3 width room
  const stairD = 0.5;
  const stairH = 0.3;
  // Starting just inside the door at z=3, going down towards z=-3
  // Door is at z=3.
  for (let i = 0; i < stairCount; i++) {
    const step = new T.Mesh(new T.BoxGeometry(stairW, stairH, stairD), wallMat);
    // Position:
    // x: center 2.5
    // z: starts at 2.5 (just past door), decreases by depth
    const zPos = 2.5 - (i * stairD);
    // y: starts at 0, decreases by height
    const yPos = -0.15 - (i * stairH);

    step.position.set(2.5, yPos, zPos);
    step.receiveShadow = true;
    objects.push(step);
    obstacles.push(step);
  }

  return { objects, obstacles, interactables };
}

export function createLivingRoom(h, couchMat, tableMat, drawerMat, handleMat) {
  let objects = [];
  let obstacles = [];
  let interactables = [];

  const couch = new Couch({
    x:9.3, y:0, z:-7, w:6, h:2, d:1.2, mat:couchMat, rotationY: -Math.PI/2
  });
  const table = new Table({
    x:4, y:0, z:-8, w:1.5, h:1, d:3, mat:tableMat,
  });
  const drawer1 = new InteractiveDrawer({
    x:3.1, y:0.75, z:-3.7, w:1.5, h:1.25, d:1.25, drawerMat, handleMat, rotationY:Math.PI
  });
  const drawer2 = new InteractiveDrawer({
    x:1.6, y:0.75, z:-3.7, w:1.5, h:1.25, d:1.25, drawerMat, handleMat, rotationY:Math.PI
  });
  objects.push(couch, table, drawer1, drawer2);
  obstacles.push(couch, table, drawer1, drawer2);
  interactables.push(drawer1, drawer2);

  return { objects, obstacles, interactables };
}







// Classes for complex objects

export class WallWithWindow extends T.Group {
  constructor({
    x, y, z, w, h, t,
    winX, winY, winW, winH,
    wallMat, frameMat, glassMat,
    rotationY = 0
  }) {
    super();
    this.position.set(x, y, z);
    this.rotation.y = rotationY;

    // Window bounds relative to wall center
    const winBottom = winY - winH / 2;
    const winTop = winY + winH / 2;
    const winLeft = winX - winW / 2;
    const winRight = winX + winW / 2;

    // --- Top wall segment ---
    const topHeight = h / 2 - winTop;
    if (topHeight > 0) {
      const topWall = new T.Mesh(new T.BoxGeometry(w, topHeight, t), wallMat);
      topWall.position.set(0, winTop + topHeight / 2, 0);
      this.add(topWall);
    }

    // --- Bottom wall segment ---
    const bottomHeight = winBottom - (-h / 2);
    if (bottomHeight > 0) {
      const bottomWall = new T.Mesh(new T.BoxGeometry(w, bottomHeight, t), wallMat);
      bottomWall.position.set(0, -h / 2 + bottomHeight / 2, 0);
      this.add(bottomWall);
    }

    // --- Left wall segment ---
    const leftWidth = winLeft - (-w / 2);
    if (leftWidth > 0) {
      const leftWall = new T.Mesh(new T.BoxGeometry(leftWidth, winH, t), wallMat);
      leftWall.position.set(-w / 2 + leftWidth / 2, winY, 0);
      this.add(leftWall);
    }

    // --- Right wall segment ---
    const rightWidth = w / 2 - winRight;
    if (rightWidth > 0) {
      const rightWall = new T.Mesh(new T.BoxGeometry(rightWidth, winH, t), wallMat);
      rightWall.position.set(w / 2 - rightWidth / 2, winY, 0);
      this.add(rightWall);
    } WallWithPassage

    // --- Window itself ---
    this.window = new Window({
      x: winX, y: winY, z: 0,
      w: winW, h: winH, t,
      frameMat, glassMat
    });
    this.add(this.window);
  }
}

export class WallWithPassage extends T.Group {
  constructor({
    x, y, z, w, h, t,
    passageX, passageW, passageH,
    wallMat,
    rotationY = 0
  }) {
    super();
    this.position.set(x, y, z);
    this.rotation.y = rotationY;

    // Passage bounds relative to wall center
    const passLeft = passageX - passageW / 2;
    const passRight = passageX + passageW / 2;

    // --- Left wall segment ---
    const leftWidth = passLeft - (-w / 2);
    if (leftWidth > 0) {
      const leftWall = new T.Mesh(new T.BoxGeometry(leftWidth, h, t), wallMat);
      leftWall.position.set(-w / 2 + leftWidth / 2, 0, 0);
      leftWall.castShadow = true;
      leftWall.receiveShadow = true;
      this.add(leftWall);
    }

    // --- Right wall segment ---
    const rightWidth = w / 2 - passRight;
    if (rightWidth > 0) {
      const rightWall = new T.Mesh(new T.BoxGeometry(rightWidth, h, t), wallMat);
      rightWall.position.set(w / 2 - rightWidth / 2, 0, 0);
      rightWall.castShadow = true;
      rightWall.receiveShadow = true;
      this.add(rightWall);
    }

    // --- Top wall segment (above passage) ---
    const topHeight = h - passageH;
    if (topHeight > 0) {
      const topWall = new T.Mesh(new T.BoxGeometry(passageW, topHeight, t), wallMat);
      topWall.position.set(passageX, passageH + topHeight / 2 - h / 2, 0);
      topWall.castShadow = true;
      topWall.receiveShadow = true;
      this.add(topWall);
    }
  }
}




// Simple Objects
const defaultObjParams = {
  position: new T.Vector3(0, 0, 0),
  scale: new T.Vector3(1, 1, 1),
  material: new T.MeshStandardMaterial({ color: "red" }),
  rotationY: 0,
  castShadow: false,
  receiveShadow: false,
}
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

const defaultDoorParams = {
  ...defaultObjParams,
  frameMaterial: new T.MeshStandardMaterial({ color: "blue" }),
  handleMaterial: new T.MeshStandardMaterial({ color: "silver" }),
}
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

const defaultWindowParams = {
  ...defaultObjParams,
  glassMaterial: new T.MeshStandardMaterial({ color: "silver" }),
}
export class Window extends T.Group {
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

const defaultDoorcabinetParams = {
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
    Object.assign(this, defaultDoorcabinetParams, config);
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


const defaultDrawercabinetParams = {
  ...defaultObjParams,
  wallThickness: 0.1,
  drawerWidth: 0.5,
  drawerHeight: 0.2,
  drawerDepth: 0.8,
  drawerMaterial: new T.MeshStandardMaterial({ color:"green" }),
  handleMaterial: new T.MeshStandardMaterial({ color:"silve" }),
}
export class DrawerCabinet extends T.Group {
  constructor({ x, y, z, w, h, d, drawerMat, handleMat, rotationY }) {
    // Create Group, set it's position, and set it's orientation
    super();
    Object.assign(this, defaultDrawercabinetParams, config);
    this.position.copy(this.position);
    this.rotation.y = this.rotationY;

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

    const drawerParams = {
      position: new T.Vector3((height - thick) / 2, 0, 0),
      scale: new T.Vector3(this.drawerWidth, this.drawerHeight, this.drawerDepth),
      material: new T.MeshStandardMaterial({ color: "red" }),
      openSide: "top",
    }
    const drawer = new OpenBox(drawerParams);
    this.add(drawer);
    this.drawer = drawer;
  }
}

const defaultDrawerParams = {
  ...defaultObjParams,
  wallThickness: 0.1,
  handleMaterial: new T.MeshStandardMaterial({ color: "silver" }),
}
class Drawer extends T.Group {
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
 * Creates a box, the top of which is open
 */
class OpenBox extends T.Group {
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

class Handle extends T.Group {
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
 * The giant eye that peers through windows
 */
export class GiantEye extends T.Group {
  constructor({ texture, houseWindows, scene, getPlayerPos, getPlayerDir, model = null, config }) {
    super();
    this.houseWindows = houseWindows;
    this.scene = scene;
    this.getPlayerPos = getPlayerPos;
    this.getPlayerDir = getPlayerDir;
    this.config = config;
    this.visibleNow = false;
    this.timer = 0;
    this.nextPeek = this.randomInterval();
    this.peekDuration = this.config.visibleDuration;

    if (model) {
      // GLTF models are Groups, so we need to handle them differently
      // Clone the model to avoid modifying the original
      this.mesh = model.clone();

      // Find the actual mesh within the group for lookAt operations
      this.actualMesh = null;
      this.mesh.traverse((child) => {
        if (child.isMesh && !this.actualMesh) {
          this.actualMesh = child;
        }
      });

      // If no mesh found, use the group itself
      if (!this.actualMesh) {
        this.actualMesh = this.mesh;
      }

      // Adjust model scale - GLTF models might be too small or large
      // Scale to approximately match the sphere size (0.6 radius = 1.2 diameter)
      const box = new T.Box3().setFromObject(this.mesh);
      const size = box.getSize(new T.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      if (maxSize > 0) {
        const targetSize = 1.2; // Match sphere diameter
        const scale = targetSize / maxSize;
        this.mesh.scale.set(scale, scale, scale);
      }

      // Ensure materials are visible
      this.mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Make sure material is visible
          if (child.material) {
            child.material.visible = true;
          }
        }
      });
    } else {
      const geom = new T.SphereGeometry(0.6, 32, 32);
      const mat = new T.MeshPhongMaterial({
        map: texture,
        color: 0xffffff,
        shininess: 30,
      });
      this.mesh = new T.Mesh(geom, mat);
      this.actualMesh = this.mesh;
    }

    this.add(this.mesh);

    // Start off-scene
    this.position.set(0, 100, 0);
    scene.add(this);
  }

  randomInterval() {
    return this.config.intervalMin + Math.random() * (this.config.intervalMax - this.config.intervalMin);
  }

  chooseWindow() {
    return this.houseWindows[Math.floor(Math.random() * this.houseWindows.length)];
  }

  update(dt, obstacles) {
    this.timer += dt;

    if (!this.visibleNow && this.timer > this.nextPeek) {
      // Start peeking
      this.timer = 0;
      this.visibleNow = true;
      this.windowTarget = this.chooseWindow();

      const lookPos = new T.Vector3();
      this.windowTarget.getWorldPosition(lookPos);

      // Calculate "outward" direction from the center of the house (0,0,0)
      // This is more robust than relying on wall rotations
      const outward = new T.Vector3(lookPos.x, 0, lookPos.z).normalize();

      // Position the eye outside the window
      // Window is at lookPos. We want to be 'outward' from it.
      // Eye radius ~0.6-0.8. Wall thickness ~0.2. 
      // Distance 1.2 should be enough to be clearly outside but close.
      const eyePos = lookPos.clone().add(outward.multiplyScalar(1.2));

      // Ensure Eye is at window height (no extra Y offset)
      eyePos.y = lookPos.y;

      this.position.copy(eyePos);

      // Use actualMesh for lookAt if it's a Mesh, otherwise rotate the group
      if (this.actualMesh && this.actualMesh.isMesh) {
        this.actualMesh.lookAt(lookPos);
      } else {
        // For Groups, rotate the whole group
        this.lookAt(lookPos);
      }
    }

    if (this.visibleNow) {
      // Gently sway
      this.rotation.y += dt * 0.2;

      // Vision check (lose condition)
      const playerPos = this.getPlayerPos();
      const toPlayer = new T.Vector3().subVectors(playerPos, this.position);
      const dist = toPlayer.length();
      if (dist < this.config.sightDistance) {
        const dir = toPlayer.normalize();
        // Use actualMesh quaternion if available, otherwise use group quaternion
        const eyeQuat = this.actualMesh && this.actualMesh.quaternion ? this.actualMesh.quaternion : this.quaternion;
        const eyeForward = new T.Vector3(0, 0, 1).applyQuaternion(eyeQuat);
        const angle = Math.acos(T.MathUtils.clamp(eyeForward.dot(dir), -1, 1));
        if (angle < this.config.fov) {
          // Check line of sight (ray no obstacles)
          if (obstacles && obstacles.length > 0) {
            const ray = new T.Raycaster(this.position, dir, 0, dist);
            const hits = ray.intersectObjects(obstacles, true);

            let blocked = false;
            for (const hit of hits) {
              // Ignore transparent objects (like windows)
              if (hit.object.material && hit.object.material.transparent) {
                continue;
              }
              // If we hit something opaque closer than the player, vision is blocked
              blocked = true;
              break;
            }

            if (!blocked) {
              // Player is spotted -> game over
              return 'spotted';
            }
          }
        }
      }

      if (this.timer > this.peekDuration) {
        // End peeking
        this.timer = 0;
        this.visibleNow = false;
        this.nextPeek = this.randomInterval();
        this.position.set(0, 100, 0);
      }
    }
    return null;
  }
}

// Base Note class that extends THREE.Group
export class Note extends T.Group {
  constructor({ x = 0, y = 0, z = 0, material, useShineShader = false }) {
    super();

    this.position.set(x, y, z);
    this.useShineShader = useShineShader;
    this.shineMaterial = null;

    // Create shine shader material if needed
    if (useShineShader) {
      this.shineMaterial = createShineShader();
    }

    // Create a visual representation (paper/note) - make it bigger and vertical
    const geom = new T.PlaneGeometry(0.3, 0.4);
    const noteMaterial = useShineShader ? this.shineMaterial : material;
    this.mesh = new T.Mesh(geom, noteMaterial);

    // Keep it vertical (not flat) so it's easier to see and interact with
    this.mesh.rotation.y = Math.PI; // Face forward
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.add(this.mesh);

    this.baseMaterial = material; // Store base material for switching

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

    // Add an invisible sphere collider for easier interaction detection
    const sphereGeom = new T.SphereGeometry(0.5, 8, 8);
    const sphereMat = new T.MeshBasicMaterial({
      visible: false, // Invisible
      transparent: true,
      opacity: 0
    });
    this.collider = new T.Mesh(sphereGeom, sphereMat);
    this.add(this.collider);
  }

  setShineShader(enabled) {
    if (enabled && !this.shineMaterial) {
      // Create shine shader
      this.shineMaterial = createShineShader();
      this.mesh.material = this.shineMaterial;
    } else if (!enabled && this.shineMaterial) {
      // Switch back to base material
      this.mesh.material = this.baseMaterial;
    }
    this.useShineShader = enabled;
  }
}







