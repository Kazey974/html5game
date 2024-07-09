import { BoxGeometry, Mesh, MeshNormalMaterial, Object3D } from "./lib/three_v0.166.0.min.js";
import { initPhysics } from "./modules/physics.js";
import camera from "./modules/camera.js";
import state from "./modules/state.js";
import controls from "./modules/controls.js";
import update from "./modules/update.js";
import networking from "./modules/networking.js";

export default {
    init() {
        state.players = [];
        state.serverInputs = [];

        networking.init();
        controls.init();
        camera.init()
        
        initPhysics();

        const object = new Object3D();
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshNormalMaterial();
        const mesh = new Mesh(geometry, material);
        object.add(mesh);
        object.position.setX(5);
        object.position.setY(5);
        object.position.setZ(-5);

        state.level.add(object);

        update.add(() => {
            for(let id in state.players) {
                state.players[id].input(id);
            }
        }, "applyInputs");
    }
}