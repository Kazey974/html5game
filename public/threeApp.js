import * as THREE from "./lib/three_v0.166.0.min.js";
import state from "./modules/state.js";
import update from "./modules/update.js";
import game from "./game.js";

const width = window.innerWidth, height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100);
camera.position.z = 2;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setAnimationLoop(ticker)
document.body.appendChild(renderer.domElement);

state.level = scene;
state.camera = camera;
state.time = Date.now();

function ticker() {
    state.deltaTime = Date.now() - state.time;
    state.time = Date.now();
 
    update.proc();
	renderer.render(scene, camera);
}

game.init();