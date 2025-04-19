/**
 * Config Module
 * Handles device detection, performance settings, and constants
 */

// Enhanced device detection with feature detection
const isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);
const isTablet = !isMobile && window.matchMedia('(max-width: 1024px)').matches;
const isLandscape = window.matchMedia('(orientation: landscape)').matches;
const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Performance optimization - detect device capabilities
const isLowPerfDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 
                        navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

// Adaptive sizing based on device
const cubeSize = isMobile ? 1.5 : 1;
const wireframeScale = isMobile ? cubeSize / 2 : 1;

// Adaptive animation speeds
const lerpSpeed = hasReducedMotion ? 0.2 : (isLowPerfDevice ? 0.15 : 0.1);
const animationDuration = hasReducedMotion ? 150 : 300;

// Adaptive camera settings
const fov = isMobile ? 80 : (isTablet ? 75 : 70);
const cameraDistance = isMobile ? 2.5 : (isTablet ? 2.2 : 2);

// Gesture settings
const minSwipeDistance = isMobile ? 30 : 50;
const gestureTimeout = 500; // ms

// Face content and links
const faceContents = [
  { header: "Home", description: "Welcome to Evergreen Web Solutions.", cta: "https://evergreenwebsolutions.ca" },
  { header: "Services", description: "Explore our range of services.", cta: "https://evergreenwebsolutions.ca/Services" },
  { header: "Web Design", description: "Learn about our web design offerings.", cta: "https://evergreenwebsolutions.ca/web-design" },
  { header: "App Development", description: "Discover our app development services.", cta: "https://evergreenwebsolutions.ca/App-Development" },
  { header: "AI Automation", description: "Explore AI automation solutions.", cta: "https://evergreenwebsolutions.ca/AI-Automation" },
  { header: "Business Digitization", description: "Digitize your business with us.", cta: "https://evergreenwebsolutions.ca/Business-Digitization" }
];

const faceLinks = [
  "https://evergreenwebsolutions.ca",
  "https://evergreenwebsolutions.ca/Services",
  "https://evergreenwebsolutions.ca/web-design",
  "https://evergreenwebsolutions.ca/App-Development",
  "https://evergreenwebsolutions.ca/AI-Automation",
  "https://evergreenwebsolutions.ca/Business-Digitization"
];

// Export all configuration variables
export {
  isMobile,
  isTablet,
  isLandscape,
  hasReducedMotion,
  isLowPerfDevice,
  cubeSize,
  wireframeScale,
  lerpSpeed,
  animationDuration,
  fov,
  cameraDistance,
  minSwipeDistance,
  gestureTimeout,
  faceContents,
  faceLinks
};
