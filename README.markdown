# 🌌 Cubic Matrix Navigation

**Cubic Matrix Navigation** is a futuristic, interactive 3D web experience powered by [Three.js](https://threejs.org/). It features a rotating cube where each face showcases unique content—headers, descriptions, and clickable links—textured with a dynamic video loop. Designed for seamless use across devices, it offers intuitive navigation via mouse, touch, or keyboard, with adaptive performance optimizations and a guided tutorial system.

This project is perfect for creating engaging navigation hubs to share multiple links or content categories in a compact, visually stunning format. Future plans include a user-friendly interface for generating and managing personalized cubes through customizable forms.

---

## ✨ Features

- **Interactive 3D Cube** 🎲  
  A six-sided cube rotates to display distinct content on each face, enhanced with a looping video texture for a sci-fi aesthetic.
- **Dynamic Content** 📝  
  Each face features a header, description, and call-to-action (CTA) link, updated dynamically based on the front-facing side.
- **Cross-Device Compatibility** 📱💻  
  Supports mouse wheel, touch gestures, and keyboard inputs, with responsive design for mobile, tablet, and desktop.
- **Performance Optimizations** 🚀  
  - Adjusts rendering quality (antialiasing, pixel ratio) and video resolution based on device capabilities.
  - Disables glow effects on low-performance devices for smooth performance.
  - Respects `prefers-reduced-motion` settings with adjustable animation speeds.
- **Enhanced User Experience** 🌟  
  - Interactive tutorial overlay with animated cues to teach navigation.
  - Pulsing directional indicators for intuitive controls.
  - Touch feedback, swipe trails, and haptic feedback (on supported devices) for engaging interactions.
  - Inactivity hints to guide users after idle periods.
- **Responsive Design** 📏  
  Adapts cube size, field of view, and typography for optimal viewing on all screen sizes.
- **Accessibility** ♿  
  Supports reduced motion preferences and includes basic keyboard navigation.

---

## 🛠️ Prerequisites

To run Cubic Matrix Navigation, ensure you have:

- **Modern Web Browser** 🌐  
  Chrome, Firefox, Safari, or Edge (latest versions recommended).
- **Web Server** 🖥️  
  A local or remote server to serve HTML, CSS, JavaScript, and video files (e.g., Node.js, Apache, or GitHub Pages).
- **Video File** 🎥  
  A looping MP4 video named `cube_texture.mp4` for the cube’s texture, placed in the project root.

---

## 📦 Installation

Follow these steps to set up the project locally:

1. **Clone or Download the Repository**  
   ```bash
   git clone <repository-url>
   cd cubic-matrix-navigation
   ```

2. **Verify Project Structure**  
   Ensure the following files are in the root directory:
   ```
   ├── index.html
   ├── styles.css
   ├── script.js
   ├── cube_texture.mp4
   ```

3. **Serve the Project**  
   Use a local web server to avoid CORS issues:
   - **Node.js**:
     ```bash
     npm install -g http-server
     http-server .
     ```
   - **Python**:
     ```bash
     python3 -m http.server 8080
     ```
   - Access at `http://localhost:8080`.

4. **Add Video Texture**  
   Place a looping MP4 video (`cube_texture.mp4`) in the root directory. Optimize it for web (e.g., 512x512 resolution for low-performance devices).

---

## 🚀 Usage

- **Navigating the Cube**  
  - **Desktop**: Scroll with the mouse wheel or use arrow keys to rotate the cube (up, down, left, right).
  - **Mobile**: Swipe in any direction to rotate.
  - Click or tap a cube face to open its linked URL in a new tab.
- **Tutorial**  
  A tutorial overlay appears on first load, demonstrating swipe directions. Dismiss it with the “Got it!” button or re-trigger via inactivity hints.
- **Customizing Content**  
  Edit the `faceContents` and `faceLinks` arrays in `script.js` to update headers, descriptions, and CTA links.

Example configuration in `script.js`:
```javascript
const faceContents = [
  { header: "Home", description: "Welcome to your navigation hub.", cta: "https://example.com" },
  // Add more face content here
];
```

---

## 🎨 Customization

Tailor the cube to your needs with these options:

1. **Update Content & Links**  
   Modify `faceContents` and `faceLinks` in `script.js` to change text and URLs for each face.
2. **Change Video Texture**  
   Replace `cube_texture.mp4` with another looping MP4. Adjust resolution for performance:
   ```javascript
   if (isLowPerfDevice) {
     video.width = 512;
     video.height = 512;
   }
   ```
3. **Adjust Styling**  
   Edit `styles.css` to tweak colors, fonts, or layout. Example background change:
   ```css
   .container {
     background: linear-gradient(to bottom, #000, #333);
   }
   ```
4. **Modify Tutorial**  
   Customize `tutorialDirections` or animation timing in `script.js` to alter the tutorial sequence.

---

## 🔮 Future Development

Cubic Matrix Navigation is poised to become a platform for user-generated navigation cubes. Planned features include:

- **User Dashboard** 🖱️  
  A web interface for users to input cube content (links, text, videos) via forms.
- **Dynamic Cube Generation** ⚙️  
  Backend API to create and store cube configurations based on user inputs.
- **Customization Options** 🎨  
  Parameters for cube size, rotation speed, textures, and color schemes.
- **Analytics** 📊  
  Track user interactions with cube faces to provide engagement insights.

---

## 🐞 Troubleshooting

- **Cube Not Visible**  
  - Ensure `cube_texture.mp4` is in the root directory and accessible.
  - Check the browser console for Three.js or video loading errors.
- **Rotation Issues**  
  - Verify `touch-action: none` in `styles.css` to prevent page scrolling.
  - Ensure no overlapping elements block touch or wheel events.
- **Performance Lag**  
  - Test on low-performance devices. Reduce video resolution or disable glow effects in `script.js`.
- **Tutorial Not Showing**  
  - Confirm `showTutorial` is called after video loading in `script.js`.

---

## 🤝 Contributing

We welcome contributions to enhance Cubic Matrix Navigation! To contribute:

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit changes:
   ```bash
   git commit -m 'Add your feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a pull request with tests and documentation.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE). See the `LICENSE` file for details.

---

## 🙌 Acknowledgments

- **[Three.js](https://threejs.org/)**: For powering the 3D cube rendering.
- **[Orbitron Font](https://fonts.google.com/specimen/Orbitron)**: For the futuristic typography.
- **Community**: For inspiration and feedback on interactive web experiences.

---

**Explore the Cube, Connect the Future!** 🌌