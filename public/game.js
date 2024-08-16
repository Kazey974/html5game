import { initPhysics } from "./modules/physics.js";
import camera from "./modules/camera.js";
import state from "./modules/state.js";
import controls from "./modules/controls.js";
import update from "./modules/update.js";
import networking from "./modules/networking.js";

export default {
    init() {
        networking.init();
        controls.init();
        camera.init()
        
        initPhysics();
    }
}