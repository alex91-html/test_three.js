import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ✅ Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputEncoding = THREE.sRGBEncoding; // Use outputEncoding instead of outputColorSpace
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xe5e5e5);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ✅ Scene & Camera Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Set the background color to white

// Adjust camera FOV based on screen size
const fov = window.innerWidth < 600 ? 60 : 45; // Increase FOV for smaller screens
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(4, 5, 11);
camera.lookAt(0, 0, 0);

// ✅ Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0; // Allow rotation underneath the model
controls.maxPolarAngle = Math.PI; // Allow rotation underneath the model
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

// ✅ Lights
const spotLight = new THREE.SpotLight(0xffffff, 3, 100, 0.2, 0.5);
spotLight.position.set(0, 25, 0);
scene.add(spotLight);

const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Optional: Add a helper to see the light direction
const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 2);
scene.add(lightHelper);

// ✅ Load Model (GLTF + Bin)
const loader = new GLTFLoader().setPath('./assets/');
loader.load(
  'cage.glb',
  (gltf) => {
    const mesh = gltf.scene;
    mesh.position.set(0, 1.05, -1);

    // Adjust model scale based on screen size
    const scale = window.innerWidth < 600 ? 0.05 : 0.1; // Smaller scale for smaller screens
    mesh.scale.set(scale, scale, scale);

    scene.add(mesh);
    console.log('✅ Model loaded:', mesh);

    // 🔍 Check if Textures Are Loaded
    mesh.traverse((child) => {
      if (child.isMesh) {
        // Ensure the material is not transparent
        child.material.transparent = false;
        child.material.opacity = 1;

        // Apply reflective, silver-like material properties
        child.material = new THREE.MeshStandardMaterial({
          color: 0xaaaaaa, // Light grey color
          metalness: 1, // Fully metallic
          roughness: 0.1, // Low roughness for high reflectivity
          envMapIntensity: 1, // Ensure environment map intensity is set
        });

        // Optionally, apply an environment map for reflections
        const envMapLoader = new THREE.CubeTextureLoader().setPath('https://threejs.org/examples/textures/cube/Bridge2/');
        const envMap = envMapLoader.load([
          'posx.jpg', 'negx.jpg',
          'posy.jpg', 'negy.jpg',
          'posz.jpg', 'negz.jpg'
        ]);
        child.material.envMap = envMap;
        child.material.needsUpdate = true;
      }
    });
  },
  undefined,
  (error) => {
    console.error('❌ Model failed to load:', error);
  }
);

// ✅ Animation Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  const newFov = window.innerWidth < 600 ? 60 : 45;
  camera.fov = newFov;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});