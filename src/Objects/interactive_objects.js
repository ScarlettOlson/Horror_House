import * as T from '../../CS559-Three/build/three.module.js';
import * as objs from './objects.js';
import * as simpleObjs from './simple_objects.js';

const twoPi = 2 * Math.PI;
const halfPi = Math.PI / 2;

const defaultInteractiveParams = {
  ...simpleObjs.defaultObjParams,
  label: "Interactable",
  hint: "Interact (E)"
}
/**
 * Interactable base
 */
export class Interactable extends simpleObjs.Object {
  constructor(config, defaultParams) {
    super(config, defaultParams);
  }

  onInteract() {
    console.log("Default Interact Not Overridden");
  }
}


const defaultInteractiveNoteParams = {
  ...defaultInteractiveParams,
  label: "Note",
  hint: "Pick Up",
  content: "Password Piece: -1",
  passwordPiece: "null",
  passwordIndex: -1,
}
/**
 * Note with password piece
 */
export class InteractiveNote extends Interactable {
  constructor({ config }) {
    super(config, defaultInteractiveNoteParams);

    this.collected = false;
    this.bobOffset = Math.random() * Math.PI * 2; // Random starting phase for animation

    const noteParams = {...this};
    noteParams.position = new T.Vector3(0, 0, 0);
    this.note = new Note(noteParams);
    this.add(this.note);

    this.bobOffset = 0;
    this.collected = false;
  }

  setInvisible() {
    this.note.visible = false;
  }

  update(dt) {
    if (!this.collected) {
      // Subtle floating/bobbing animation
      const bobSpeed = 1.5;
      const bobAmount = 0.1;
      this.bobOffset += dt * bobSpeed;
      const bobY = Math.sin(this.bobOffset) * bobAmount;

      this.mesh.position.y = bobY;

      // Gentle rotation (only rotate around Y axis, not the whole note)
      this.note.mesh.rotation.y = Math.PI + Math.sin(this.bobOffset * 0.5) * 0.2;
    }
  }

}

const defaultInteractiveDoorParams = {
  ...simpleObjs.defaultDoorParams,
  openAngle: halfPi
}
/**
 * Door that can be opened and closed
 */
export class InteractiveDoor extends Interactable {
  constructor(config) {
    super(config, defaultInteractiveDoorParams);

    this.openAngle = openAngle;
    this.open = false;

    // Create door using Door class
    const doorParams = {...this};
    doorParams.position = new T.Vector3(0, 0, 0);
    const door = new Door(doorParams);
    this.add(door);

    // Store references to door components
    this.frame = door;
    this.hinge = door.hinge;
    this.door = door.door;
    this.frameLeft = door.frameLeft;
    this.frameTop = door.frameTop;
    this.frameRight = door.frameRight;
  }

  onInteract() {
    this.open = !this.open;
  }

  update(dt) {
    let target = 0;
    if (this.open) {
      target = this.openAngle;
    }
    const curr = this.hinge.rotation.y;
    const speed = 4.0;
    this.hinge.rotation.y = T.MathUtils.damp(curr, target, speed, dt);
  }
}


const defaultInteractiveDrawerCabinetParams = {
  ...objs.defaultDrawerCabinetParams,
  label: "Drawer",
  hint: "Open/Close",
  extendDistance: 0.75,
}
/**
 * Simple sliding drawer
 */
export class InteractiveDrawerCabinet extends Interactable {
  constructor(config) {
    super(config, defaultInteractiveDrawerCabinetParams);

    const drawerParmas = {...this};
    drawerParmas.position = new T.Vector3(0, 0, 0);
    const mesh = new DrawerCabinet(drawerParmas);
    this.add(mesh);

    this.open = false;
    this.drawer = mesh.drawer;
  }
  onInteract() {
    this.open = !this.open;
    // if (this.sound && this.sound.buffer) {
    //   if (this.sound.isPlaying) this.sound.stop();
    //   this.sound.play();
    // }
  }

  // initAudio(listener, buffer) {
  //   this.sound = new T.PositionalAudio(listener);
  //   this.sound.setBuffer(buffer);
  //   this.sound.setRefDistance(10);
  //   this.sound.setVolume(6.0);
  //   this.add(this.sound);
  // }

  update(dt) {
    let target = 0;
    if (this.open) {
      target = this.extend;
    }
    const curr = this.drawer.position.z;
    this.drawer.position.z = T.MathUtils.damp(curr, target, 6.0, dt);
  }
}


const defaultInteractiveDoorCabinetParams = {
  ...objs.defaultDoorCabinetParams,
  maxOpenAngle: halfPi,
}

export class InteractiveCabinet extends Interactable {
  constructor(config) {
    super(config, defaultInteractiveDoorCabinetParams);

    // Create the cabinet door
    const cabinetParams = {...this};
    cabinetParams.position = new T.Vector3(0, 0, 0);
    this.cabinet = new DoorCabinet(cabinetParams);
    this.add(this.cabinet);

    // Door state
    this.isOpen = false;
    this.closedAngle = 0;
    this.animationSpeed = 3;
    this.hint = hint;
  }

  onInteract() {
    this.isOpen = !this.isOpen;
    // if (this.sound && this.sound.buffer) {
    //   if (this.sound.isPlaying) this.sound.stop();
    //   this.sound.play();
    // }
  }

  // initAudio(listener, buffer) {
  //   this.sound = new T.PositionalAudio(listener);
  //   this.sound.setBuffer(buffer);
  //   this.sound.setRefDistance(10);
  //   this.sound.setVolume(6.0);
  //   this.add(this.sound);
  // }


  update(dt) {

    const targetAngle = this.isOpen ? this.openAngle : this.closedAngle;
    const currentAngle = this.cabinet.hinge.rotation.y;
    const angleDiff = targetAngle - currentAngle;

    if (Math.abs(angleDiff) < 0.01) {
      // Close enough, snap to target
      this.cabinet.hinge.rotation.y = targetAngle;
    } 
    else {
      // Smoothly animate towards target
      const step = Math.sign(angleDiff) * this.animationSpeed * dt;
      if (Math.abs(step) > Math.abs(angleDiff)) {
        this.cabinet.hinge.rotation.y = targetAngle;
      } 
      else {
        this.cabinet.hinge.rotation.y += step;
      }
    }
  }
}

const defaultInteractiveLockParams = {
  ...defaultInteractiveParams,
  label: "Lock",
  hint: "Find the passkey to Unlock",
}
/**
 * Basement lock
 */
export class Lock extends Interactable {
  constructor(config) {
    super(config, defaultInteractiveLockParams);
    const geom = new T.TorusGeometry(0.12, 0.03, 16, 24);
    const mesh = new T.Mesh(geom, material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    this.add(mesh);
    this.unlocked = false;
  }
  tryUnlock(foundValues) {
    // Require all four: indices 1..4
    const allFound = [1, 2, 3, 4].every(i => foundValues.has(i));
    if (allFound) {
      this.unlocked = true;
      return true;
    }
    return false;
  }
}

const defaultInteractiveLockedDoor = {
  ...defaultInteractiveParams,
  label: "Locked Door",
  hint: "Locked (Requires Password)",

}
export class BasementDoor extends InteractiveDoor {
  constructor(config) {
    super(config, defaultInteractiveLockedDoor);
    this.isLocked = true;

    // Add a temporary lock mesh
    const lockGeom = new T.BoxGeometry(0.1, 0.15, 0.05);
    const lockMat = new T.MeshStandardMaterial({ color: 0xFF0000 }); // Red for locked
    this.lockMesh = new T.Mesh(lockGeom, lockMat);
    // Position on the handle
    this.lockMesh.position.set(this.width - 0.2, 0, 0.05);
    this.door.add(this.lockMesh);
  }

  unlock() {
    this.isLocked = false;
    this.hint = 'Open/Close (E)';
    if (this.lockMesh) {
      this.door.remove(this.lockMesh);
      this.lockMesh = null;
    }
  }

  onInteract() {
    if (this.isLocked) {
      // Maybe play a sound or shake
      return;
    }
    super.onInteract();
  }
}



