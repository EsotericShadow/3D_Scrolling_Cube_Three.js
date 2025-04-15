 document.addEventListener('DOMContentLoaded', () => {
      'use strict';

      const isMobile = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;

      const scene = new THREE.Scene();
      const cubeContainer = document.getElementById('cube-container');
      const camera = new THREE.PerspectiveCamera(75, cubeContainer.clientWidth / cubeContainer.clientHeight, 0.1, 1000);
      camera.position.z = 2;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(cubeContainer.clientWidth, cubeContainer.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.domElement.style.pointerEvents = 'none';
      cubeContainer.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 1));

      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const edges = new THREE.EdgesGeometry(geometry);

      const brightMat = new THREE.LineBasicMaterial({ color: new THREE.Color('hsl(200, 100%, 60%)') });
      const wireframe = new THREE.LineSegments(edges, brightMat);

      const glowMat = new THREE.LineBasicMaterial({
        color: new THREE.Color('hsl(200, 100%, 60%)'),
        transparent: true,
        opacity: 0.4,
      });
      const glowWireframe = new THREE.LineSegments(edges, glowMat);
      glowWireframe.scale.set(1.1, 1.1, 1.1);

      scene.add(glowWireframe);
      scene.add(wireframe);

      const leftText = document.getElementById('left-text');
      const rightText = document.getElementById('right-text');

      const leftMessages = [
        'Designs that defy convention.',
        'Minimalist. Modular. Mind‑blowing.',
        'Web experiences with a pulse.',
        'A new dimension of interactivity.',
        'Explore the edge of digital design.',
        'Your brand in real time.',
        'Precision meets emotion.',
        "Design that's alive.",
        'Technically beautiful.',
        'Inspired by the future.'
      ];

      const rightMessages = [
        'Enter a hyper‑immersive world.',
        'Innovation meets aesthetics.',
        '3D is just the beginning.',
        'Crafted for high‑speed minds.',
        'From code to consciousness.',
        'Made for visionaries.',
        'Where tech meets art.',
        'Interactive identity design.',
        'Design beyond the screen.',
        'Step into another layer.'
      ];

      function createTextBlock(msg) {
        const wrapper = document.createElement('div');
        wrapper.className = 'text-inner';
        wrapper.innerHTML = `<div class="text-block"><p>${msg}</p></div>`;
        return wrapper;
      }

      let contentHeight = 0;
      let rotationFactor = 0;
      let virtualScroll = 0;
      let textBlocks = [];
      const fadeRange = 150;
      const translateMax = 20;
      const touchMult = 2;
      let centerOffset = 0;

      const easeInOutQuad = x => x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2;

      function calculateContentHeight() {
        contentHeight = 0;
        textBlocks.forEach(block => {
          const rect = block.getBoundingClientRect();
          const style = window.getComputedStyle(block);
          const mb = parseFloat(style.marginBottom);
          contentHeight += rect.height + mb;
        });
      }

      function setup() {
        leftMessages.forEach(m => leftText.appendChild(createTextBlock(m)));
        rightMessages.forEach(m => rightText.appendChild(createTextBlock(m)));
        textBlocks = Array.from(document.querySelectorAll('.text-block'));

        requestAnimationFrame(() => {
          calculateContentHeight();
          const first = textBlocks[0];
          const rect = first.getBoundingClientRect();
          centerOffset = (window.innerHeight / 2) - (rect.height / 2);
          rotationFactor = Math.PI / (rect.height + parseFloat(window.getComputedStyle(first).marginBottom));
          updateScene();
        });
      }

      function updateScene() {
        glowWireframe.rotation.y = -virtualScroll * rotationFactor;
        wireframe.rotation.y = -virtualScroll * rotationFactor;

        const hue = (virtualScroll * 0.1) % 360;
        const h = (hue + 360) % 360 / 360;
        brightMat.color.setHSL(h, 1, 0.6);
        glowMat.color.setHSL(h, 1, 0.6);

        const r = ((virtualScroll % contentHeight) + contentHeight) % contentHeight;
        const offset = centerOffset - r;
        leftText.style.transform = `translateY(${offset}px)`;
        rightText.style.transform = `translateY(${offset}px)`;

        const midY = window.innerHeight / 2;
        textBlocks.forEach(block => {
          const bRect = block.getBoundingClientRect();
          const bCenter = bRect.top + bRect.height / 2;
          const dist = Math.abs(bCenter - midY);
          const t = Math.min(dist / fadeRange, 1);
          const eased = easeInOutQuad(t);
          const opacity = 1 - eased;
          block.style.opacity = opacity;
          block.style.transform = `translateY(${translateMax * (1 - opacity)}px)`;
        });

        renderer.render(scene, camera);
      }

      function onWheel(e) {
        e.preventDefault();
        virtualScroll += e.deltaY;
        updateScene();
      }

      let lastY = 0;
      function onTouchStart(e) {
        e.preventDefault();
        lastY = e.touches[0].clientY;
      }

      function onTouchMove(e) {
        e.preventDefault();
        const y = e.touches[0].clientY;
        virtualScroll += (lastY - y) * touchMult;
        lastY = y;
        updateScene();
      }

      if (!isMobile) {
        window.addEventListener('wheel', onWheel, { passive: false });
      } else {
        window.addEventListener('touchstart', onTouchStart, { passive: false });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
      }

      window.addEventListener('resize', () => {
        const w = cubeContainer.clientWidth;
        const h = cubeContainer.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        calculateContentHeight();
        const first = textBlocks[0];
        const rect = first.getBoundingClientRect();
        centerOffset = (window.innerHeight / 2) - (rect.height / 2);
        rotationFactor = Math.PI / (rect.height + parseFloat(window.getComputedStyle(first).marginBottom));

        updateScene();
      });

      setup();
    });
