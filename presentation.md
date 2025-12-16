---
title: Graphics Final Project- Horror House
author: Scarlett Olson and Michael Cortese (Group 5602)
---

## Horror House

**An Interactive 3D Hide & Seek Game**

- **Group ID**: 5602
- **NetIDs**: mcortese2, nwolson
- **Link**: [Project Page](#)

<!-- pause -->

### Concept

In this game you have been trapped inside of your house by a giant alien eye whom consumes your life force by looking at you. It doesn't seem able to break into the house, but it keeps peering through your windows trying to find you. You hope to hide in the basement before the eye can spot you, hoping it will eventually go away. Unfortunatly you locked your basement door with a combination lock and have forgot the password. You must search all over your house for the 4 pieces of paper containing the basement code, before you are found.

<!-- end_slide -->

## Requirements & Modes

### Technologies

- **Core**: THREE.js (No external game framework)
- **Physics**: Custom collision logic
- **Assets**: Loaded models, Textures, and Sounds

### Game Modes

1. **Prototype Mode**:
   - Primitive geometries only.
   - Focus on mechanics and physics.
2. **Full Mode**:
   - Detailed loaded models.
   - Full textures and lighting.

<!-- end_slide -->

## Interaction & Controls

**Input Methods**

- **Mouse**: Camera control (Look around) & Interaction (Click).
- **Keyboard**: Movement (WASD).
- **Mobile Friendly**: Designed with touch interaction compatibility in mind.

<!-- pause -->

**Mechanics**

- **Movement**: First-person physics-based controller.
- **Interaction**: Raycasting to detect objects (drawers, doors).
- **State**: Objects have open/close states (Drawers).

<!-- end_slide -->

## Technical Architecture

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

### Code Structure

- `src/main.js`:
  - Scene initialization.
  - Render loop.
- `src/interactive.js`:
  - Interaction logic (Raycaster).
  - Door/Drawer classes.
- `src/objects.js`:
  - Game object definitions.
  - Materials & Geometries.

<!-- column: 1 -->

### Asset Management

- **Models**: GLB/GLTF loading.
- **Audio**: Ambient music & Sound effects (`drawer.mp3`).
- **Textures**: Environmental textures.

<!-- reset_layout -->

<!-- end_slide -->

## Advanced Features

### Animation & Automation

- **Animation**:
  - Smooth transitions for interacting with objects (opening/closing drawers).
  - Animated environment elements.

- **Sound**:
  - Spatial audio for interactions.
  - Ambient background track.

<!-- end_slide -->

## Conclusion

**Future Improvements**

- Multiplayer networking.
- More complex maps and props.
- timer and scoring system.

### Thank You

[View Project on GitHub](https://github.com/ScarlettOlson/Prop_Hunt)
