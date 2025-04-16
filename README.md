📄 **Neon Cube – Project Documentation**

---

### Overview

Neon Cube is a futuristic, immersive web experience that showcases a rotating, glowing 3D cube built with Three.js. User interactions via mouse wheel or touch gestures drive the cube’s orientation changes, creating a dynamic, cyber-themed effect. The project features enhanced rotation logic to ensure that horizontal swipes are applied relative to the cube’s current vertical orientation. This prevents unintended diagonal rotations by switching the horizontal control axis (Y vs. Z) depending on the cube’s vertical flip state.

---

### 🧱 File Structure

- **index.html** — Main HTML structure
- **styles.css** — Styling for layout, typography, and visual effects
- **script.js** — JavaScript for 3D rendering, gesture handling, and animation logic

---

### 🔹 index.html

**Purpose:**  
Defines the basic layout and structure of the web app. It includes:

- A full-screen flexbox layout comprising:
  - A central cube container for the 3D scene
- JavaScript module inclusion via `<script type="module" src="script.js"></script>`

**Key Elements:**

| Element ID / Class       | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `#cube-container`        | Placeholder div where the animated 3D cube is rendered |

---

### 🎨 styles.css

**Purpose:**  
Provides styling for layout, responsive behavior, and visual effects such as glow.

**Key Features:**

- **Background:**  
  Dark vertical gradient (from `#000` to `#222`) establishes a high-contrast, cyberpunk atmosphere.
- **Layout:**  
  A fixed, full-screen flexbox design centers the cube.
- **Responsive Design:**  
  Media queries adjust cube dimensions for desktop and mobile devices.
- **Mobile-Specific:**  
  On mobile, the cube is enlarged for better interaction.

---

### 🧠 script.js

**Purpose:**  
Manages the 3D scene setup, the animation rendering loop, gesture handling, and text transitions using Three.js and DOM manipulation.

**Libraries Used:**

- **Three.js:**  
  Renders the 3D cube and manages the WebGL scene.
- **ES Modules:**  
  The code leverages JavaScript modules loaded via the `type="module"` attribute.

**Key Components:**

1. **🔲 Cube Construction**

   - **Geometry:**  
     The cube is constructed with a wireframe style using TubeGeometry for each edge.
   - **Layers:**  
     - **Bright Core:** Thin, vivid edges.
     - **Glow Layer:** A thicker, semi-transparent version slightly scaled up to produce a neon glow effect.

2. **💡 Lighting**

   - Uses a single ambient light (`#fff`) to uniformly illuminate the scene.

3. **🧭 Camera**

   - A perspective camera is positioned at `z = 2`, facing the cube to provide a clear, central view of the animation.

4. **🧭 Face Rotation & Orientation Logic**

   - **Vertical Rotation (X-axis):**  
     Vertical swipes adjust the cube’s rotation around the X-axis in discrete 90° increments. A `verticalIndex` variable tracks these vertical flips.
   - **Horizontal Rotation:**  
     Horizontal swipes apply rotation relative to the cube’s vertical orientation:
     - When `verticalIndex` is even (cube is “upright” or inverted), horizontal movements update the Y-axis.
     - When `verticalIndex` is odd (cube is rotated 90°/270° vertically), horizontal movements update the Z-axis.
   - **Outcome:**  
     This adaptive control ensures that left/right swipes always result in a consistent, viewer-relative flip without unexpected diagonal rotations.

5. **🧲 Interaction**

   - **Input Methods:**  
     Supports both mouse wheel (desktop) and touch gestures (mobile).
   - **Axis Locking:**  
     Input handlers lock movement to the dominant axis (with additional shift-key handling for forced horizontal gestures).
   - **Threshold & Sensitivity:**  
     Configurable constants (e.g., `swipeThreshold`, `touchMult`) determine the amount of gesture required to trigger a rotation.

6. **Notable Constants**

   | Constant         | Purpose                                                  |
   | ---------------- | -------------------------------------------------------- |
   | `blocksCount`    | Number of text entries per column                        |
   | `fadeRange`      | Distance (in pixels) over which text fades               |
   | `swipeThreshold` | Minimum delta required to trigger a rotation             |
   | `lerpSpeed`      | Speed factor for rotation interpolation                  |
   | `touchMult`      | Multiplier to adjust the sensitivity of touch gestures   |

---

### 🧪 Future Enhancements

- **Additional Interactions:**  
  Introduce click or tap support for rotating the cube.
- **Dynamic Text Editing:**  
  Allow live updates to cube face text via an integrated editor.
- **Audio Enhancements:**  
  Add ambient sound effects or background music to enhance the immersive experience.
- **Extended Reality (XR) Support:**  
  Adapt the experience for WebXR to support AR/VR environments.

---

### 📌 Summary

Neon Cube is a striking visual showcase that leverages WebGL and JavaScript to create an interactive, stylized 3D cube paired with synchronized scrolling text. With its modular structure and adaptive interaction logic—including orientation-aware horizontal rotation and mobile-specific optimizations—this project offers both aesthetic appeal and technical flexibility. Whether used for branding, a portfolio, or artistic expression, Neon Cube demonstrates how a careful balance of design and code can produce a futuristic web experience that feels both smooth and immersive.

