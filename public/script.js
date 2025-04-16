import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { createCubeControls } from './cubeControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0f0f);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

// Cube materials
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Wireframe overlays
const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true });
const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
scene.add(wireframe);

const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.2 });
const glowWireframe = new THREE.Mesh(geometry, glowMaterial);
scene.add(glowWireframe);

// Responsive resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Mobile detection
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Controls
const controls = createCubeControls(cube, wireframe, glowWireframe, direction => {
  console.log('Cube face changed:', direction);
});

controls.attachControls(isMobile);

// Animate loop
function animate() {
  controls.updateRotation();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
