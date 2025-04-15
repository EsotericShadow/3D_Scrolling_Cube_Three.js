const isMobile = window.matchMedia("(max-width: 768px)").matches || 'ontouchstart' in window;

const scene = new THREE.Scene();
const cubeContainer = document.getElementById('cube-container');
const camera = new THREE.PerspectiveCamera(75, cubeContainer.clientWidth / cubeContainer.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(cubeContainer.clientWidth, cubeContainer.clientHeight);
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(window.devicePixelRatio);
cubeContainer.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 2;

function render() {
  renderer.render(scene, camera);
}

let virtualScroll = 0;
const leftText = document.querySelector('.text-column.left .text-content');
const rightText = document.querySelector('.text-column.right .text-content');
const textHeight = document.querySelector('.text-inner').offsetHeight;

const touchMultiplier = 2; // Adjustable: 1 to 4
const rotationFactor = Math.PI / textHeight; // 180 degrees per text loop

if (!isMobile) {
  window.addEventListener('wheel', (event) => {
    event.preventDefault();
    const delta = event.deltaY;
    virtualScroll += delta;
    cube.rotation.y = -virtualScroll * rotationFactor;
    let offset = -((virtualScroll % textHeight + textHeight) % textHeight);
    leftText.style.transform = `translateY(${offset}px)`;
    rightText.style.transform = `translateY(${offset}px)`;
    render();
  }, { passive: false });
} else {
  let lastTouchY = 0;
  window.addEventListener('touchstart', (event) => {
    event.preventDefault();
    lastTouchY = event.touches[0].clientY;
  }, { passive: false });

  window.addEventListener('touchmove', (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const delta = (lastTouchY - touch.clientY) * touchMultiplier;
    lastTouchY = touch.clientY;
    virtualScroll += delta;
    cube.rotation.y = -virtualScroll * rotationFactor;
    let offset = -((virtualScroll % textHeight + textHeight) % textHeight);
    leftText.style.transform = `translateY(${offset}px)`;
    rightText.style.transform = `translateY(${offset}px)`;
    requestAnimationFrame(render);
  }, { passive: false });
}

render();

window.addEventListener('resize', () => {
  const width = cubeContainer.clientWidth;
  const height = cubeContainer.clientHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  render();
});
