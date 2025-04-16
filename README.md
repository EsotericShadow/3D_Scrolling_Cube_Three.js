

# 📄 Neon Cube – Project Documentation

## Overview

**Neon Cube** is a futuristic, immersive web experience that showcases a rotating, glowing 3D cube built with `Three.js`, surrounded by vertically scrolling text columns. User interactions like mouse wheels or touch gestures change the cube's orientation and cycle through paired text blocks, producing a dynamic, cyber-themed effect.

---

## 🧱 File Structure

```
index.html        # Main HTML structure
styles.css        # Styling for layout and typography
script.js         # JavaScript for 3D rendering and interaction logic
```

---

## 🔹 `index.html`

### Purpose
Defines the basic layout and structure of the web app. It includes:

- Google Fonts (`Orbitron`) for futuristic typography.
- A full-screen flexbox layout with:
  - Two vertical text columns (`left` and `right`)
  - A central cube container
- JavaScript module linked at the bottom

### Key Elements

| Element ID / Class   | Description |
|----------------------|-------------|
| `#cube-container`    | Placeholder for the animated 3D cube |
| `.text-column.left`  | Left-aligned block of text |
| `.text-column.right` | Right-aligned block of text |
| `#left-text`         | Container for left-side messages |
| `#right-text`        | Container for right-side messages |

---

## 🎨 `styles.css`

### Purpose
Provides styling for layout, responsive behavior, and visual effects like glow and fade.

### Key Features

- **Background**: Vertical gradient (`#000` to `#222`) sets a high-contrast dark theme.
- **Font**: Futuristic `Orbitron` font for all text.
- **Layout**: Fixed full-screen `flexbox` to center the cube and text columns.
- **Responsive Design**: Adjusts cube and text sizes for desktop and mobile via media queries.
- **Text Styling**: Text blocks have opacity and transform controlled by JavaScript for fade-in effects.
- **Visual Hierarchy**:
  - Larger cube on desktop
  - Mobile-friendly dimensions and touch support

---

## 🧠 `script.js`

### Purpose
Handles the 3D scene setup, rendering loop, gesture handling, and text transitions using `Three.js` and DOM manipulation.

### Libraries Used

- **Three.js**: For rendering 3D cube
- **ES Modules**: Script loaded with `type="module"`

---

### Key Components

#### 1. 🔲 **Cube Construction**

- Built with `BoxGeometry`, but rendered as a **wireframe** using `TubeGeometry` for each edge.
- Two layers:
  - **Bright core**: Thin, sharp edges
  - **Glow layer**: Thicker, translucent version slightly scaled up

#### 2. 💡 **Lighting**

- Uses a single ambient light (`#fff`) for uniform brightness.

#### 3. 🧭 **Camera**

- Perspective camera placed at `z = 2` facing the cube.

---

#### 4. 🔄 **Text Blocks**

- Left and right arrays of messages populate `.text-content` sections.
- Text elements fade in/out and translate vertically based on cube rotation and scroll state.
- Text changes are tied to cube faces: e.g., scrolling or swiping up rotates the cube and loads the next message.

---

#### 5. 🔁 **Animation & Rendering**

- Main loop runs in `requestAnimationFrame(updateScene)`.
- Interpolates cube rotation using linear interpolation (lerp).
- Updates both wireframes and text styling every frame.

---

#### 6. 🧭 **Face Rotation Logic**

- Cube has 6 named faces: `A`, `B`, `C`, `D`, `Top`, `Bottom`.
- Each direction (up/down/left/right) maps to another face.
- Rotations are predefined per face and animated smoothly.

---

#### 7. 🧲 **Interaction**

- Handles:
  - **Mouse Wheel** (desktop)
  - **Touch gestures** (mobile)
- Axis-locking logic ensures deliberate direction change.
- Swipes beyond a threshold trigger cube rotation and update the text index.

---

### Notable Constants

| Constant        | Purpose |
|-----------------|---------|
| `blocksCount`   | Number of text entries per column |
| `fadeRange`     | Distance in px for full fade effect |
| `swipeThreshold`| Minimum gesture delta to trigger rotation |
| `lerpSpeed`     | Speed of rotation interpolation |
| `touchMult`     | Sensitivity multiplier for touch gestures |

---

## 🧪 Future Enhancements

- Add click/tap support for rotating cube
- Add live text editor for updating cube face text dynamically
- Add sound effects or background audio
- Export to WebXR for AR/VR integration

---

## 📌 Summary

This project serves as a stunning visual showcase using WebGL and JavaScript to create an interactive, stylized cube surrounded by synchronized scrolling text. The modular structure allows for easy customization and scaling, whether for branding, portfolio presentation, or artistic expression.
