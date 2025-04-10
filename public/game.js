import { initPhysics } from "./modules/physics.js";
import camera from "./modules/camera.js";
import controls from "./modules/controls.js";
import networking from "./modules/networking.js";
import * as CANNON from "cannon-es";

export default {
    init(state) {
        initPhysics(state, new CANNON.World());

        controls.init();
        camera.init(state)
        networking.init(state, camera);
    }
}