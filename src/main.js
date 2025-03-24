import * as THREE from "three";
import { GUI } from "lil-gui";
import { OrbitControls, Timer } from "three/examples/jsm/Addons.js";
import vertexShader from "./shaders/test/vertexShader.glsl";
import fragmentShader from "./shaders/test/fragmentShader.glsl";
import "./style.css";

/*
 * Bases
 */

const canvas = {
  width: innerWidth,
  height: innerHeight,
  aspect: innerWidth / innerHeight,
  dom: document.querySelector("canvas#webgl"),
};

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(1));

const camera = new THREE.PerspectiveCamera(75, canvas.aspect, 0.01, 100);
camera.position.set(1, 1, 1);
scene.add(camera);

const control = new OrbitControls(camera, canvas.dom);
const gui = new GUI();

/*
 * Gometry, Texture & Material
 */

const loadingManager = new THREE.LoadingManager();
loadingManager.onError = (err) => console.error("Error loading texture", err);

const textureLoader = new THREE.TextureLoader(loadingManager);

// Geometry
const geometry = new THREE.PlaneGeometry(3, 2, 100, 100);

// Material
const material = new THREE.RawShaderMaterial({
  transparent: true,
  // wireframe: true,

  vertexShader,
  fragmentShader,

  uniforms: {
    uFrequency: { value: new THREE.Vector2(10, 5) },
    uTime: { value: 0 },
    uMap: { value: textureLoader.load("/flag.jpg") },
  },

  side: THREE.DoubleSide,
});

gui.add(material.uniforms.uFrequency.value, "x").min(0).max(20).step(0.01);
gui.add(material.uniforms.uFrequency.value, "y").min(0).max(20).step(0.01);

scene.add(new THREE.Mesh(geometry, material));

/*
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas.dom });
renderer.setSize(canvas.width, canvas.height);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

/*
 * Animation
 */
const timer = new Timer();

renderer.setAnimationLoop((ts) => {
  timer.update(ts);
  const _elapsed = timer.getElapsed();

  material.uniforms.uTime.value = _elapsed;

  control.update();
  renderer.render(scene, camera);
});

/*
 * Events
 */

window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  canvas.aspect = innerWidth / innerHeight;

  camera.aspect = canvas.aspect;
  camera.updateProjectionMatrix();

  renderer.setSize(canvas.width, canvas.height);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

window.addEventListener("dblclick", (_) => {
  document.fullscreenElement
    ? document?.exitFullscreen()
    : canvas.dom?.requestFullscreen();
});
