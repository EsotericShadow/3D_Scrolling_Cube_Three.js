// cubeControls.js
export function createCubeControls(cube, wireframe, glowWireframe, changeCallback) {
  let verticalIndex = 0, horizontalIndexY = 0, horizontalIndexZ = 0;
  let currentRotX = 0, currentRotY = 0, currentRotZ = 0;
  let targetRotX = 0, targetRotY = 0, targetRotZ = 0;
  let isAnimating = false;

  const toRad = deg => deg * Math.PI / 180;
  const lerpSpeed = 0.1;
  const swipeThreshold = 75;
  const touchMult = 2;
  const deadZone = 10;
  let accumulatedDeltaX = 0, accumulatedDeltaY = 0, lockedAxis = null;
  let lastX = 0, lastY = 0;

  function updateRotation() {
    let animating = false;
    if (Math.abs(currentRotX - targetRotX) > 0.1) {
      currentRotX += (targetRotX - currentRotX) * lerpSpeed;
      animating = true;
    } else currentRotX = targetRotX;

    if (Math.abs(currentRotY - targetRotY) > 0.1) {
      currentRotY += (targetRotY - currentRotY) * lerpSpeed;
      animating = true;
    } else currentRotY = targetRotY;

    if (Math.abs(currentRotZ - targetRotZ) > 0.1) {
      currentRotZ += (targetRotZ - currentRotZ) * lerpSpeed;
      animating = true;
    } else currentRotZ = targetRotZ;

    isAnimating = animating;
    if (isAnimating) accumulatedDeltaX = accumulatedDeltaY = 0;

    cube.rotation.set(toRad(currentRotX), toRad(currentRotY), toRad(currentRotZ));
    wireframe.rotation.set(toRad(currentRotX), toRad(currentRotY), toRad(currentRotZ));
    glowWireframe.rotation.set(toRad(currentRotX), toRad(currentRotY), toRad(currentRotZ));
  }

  function changeFace(direction) {
    if (isAnimating) return;

    if (direction === 'up') {
      verticalIndex++;
      targetRotX = -90 * verticalIndex;
    } else if (direction === 'down') {
      verticalIndex--;
      targetRotX = -90 * verticalIndex;
    } else if (direction === 'left') {
      if (verticalIndex % 2 === 0) {
        horizontalIndexY++;
        targetRotY = 90 * horizontalIndexY;
      } else {
        horizontalIndexZ--;
        targetRotZ = 90 * horizontalIndexZ;
      }
    } else if (direction === 'right') {
      if (verticalIndex % 2 === 0) {
        horizontalIndexY--;
        targetRotY = 90 * horizontalIndexY;
      } else {
        horizontalIndexZ++;
        targetRotZ = 90 * horizontalIndexZ;
      }
    }

    accumulatedDeltaX = accumulatedDeltaY = 0;
    lockedAxis = null;
    isAnimating = true;
    changeCallback?.(direction);
  }

  function onWheel(e) {
    if (isAnimating) return;
    e.preventDefault();
    const deltaX = e.deltaX || 0, deltaY = e.deltaY || 0;

    if (e.shiftKey) {
      accumulatedDeltaX += deltaX;
      accumulatedDeltaY = 0;
    } else {
      if (Math.abs(deltaY) >= Math.abs(deltaX)) {
        accumulatedDeltaY += deltaY;
        accumulatedDeltaX = 0;
      } else {
        accumulatedDeltaX += deltaX;
        accumulatedDeltaY = 0;
      }
    }

    if (Math.abs(accumulatedDeltaX) > swipeThreshold)
      changeFace(accumulatedDeltaX > 0 ? 'right' : 'left');
    else if (Math.abs(accumulatedDeltaY) > swipeThreshold)
      changeFace(accumulatedDeltaY > 0 ? 'up' : 'down');
  }

  function onTouchStart(e) {
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    lockedAxis = null;
    accumulatedDeltaX = accumulatedDeltaY = 0;
  }

  function onTouchMove(e) {
    if (isAnimating) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = lastX - currentX;
    const deltaY = lastY - currentY;

    if (!lockedAxis && (Math.abs(deltaX) > deadZone || Math.abs(deltaY) > deadZone)) {
      lockedAxis = Math.abs(deltaX) >= Math.abs(deltaY) ? 'x' : 'y';
    }

    if (lockedAxis === 'x') {
      accumulatedDeltaX += deltaX * touchMult;
      accumulatedDeltaY = 0;
    } else if (lockedAxis === 'y') {
      accumulatedDeltaY += deltaY * touchMult;
      accumulatedDeltaX = 0;
    }

    if (Math.abs(accumulatedDeltaX) > swipeThreshold)
      changeFace(accumulatedDeltaX > 0 ? 'right' : 'left');
    else if (Math.abs(accumulatedDeltaY) > swipeThreshold)
      changeFace(accumulatedDeltaY > 0 ? 'up' : 'down');

    lastX = currentX;
    lastY = currentY;
  }

  function onTouchEnd() {
    lockedAxis = null;
    accumulatedDeltaX = accumulatedDeltaY = 0;
  }

  function attachControls(isMobile) {
    if (!isMobile) {
      window.addEventListener('wheel', onWheel, { passive: false });
    } else {
      window.addEventListener('touchstart', onTouchStart, { passive: false });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { passive: false });
    }
  }

  return {
    updateRotation,
    attachControls
  };
}
