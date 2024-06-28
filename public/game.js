import { BoxGeometry, Mesh, MeshNormalMaterial, Object3D } from "./lib/three_v0.166.0.min.js";
import { Gameobject } from "./modules/objects.js"
import { initPhysics } from "./modules/physics.js";
import camera from "./modules/camera.js";
// import loader from "./loader.js"
import state from "./modules/state.js";
import controls from "./modules/controls.js";
import prefabs from "./modules/prefabs.js";
import update from "./modules/update.js";

export default {
    init() {
        state.players = [];
        state.socket = io();

        initPhysics();
        camera.init()

        const object = new Object3D();
        const geometry = new BoxGeometry(0.2, 0.2, 0.2);
        const material = new MeshNormalMaterial();
        const mesh = new Mesh(geometry, material);
        object.add(mesh);
        object.position.setX(1);
        object.position.setY(1);
        object.position.setZ(-1);

        state.level.add(object);
        
        state.socket.on("connect", () => {
        });

        state.socket.on("initPlayer", (data) => {
            console.log("initPlayer", data.id, data.position);
            let ship = prefabs.ship(data.id, data.position, data.color);
            state.players[data.id] = ship;

            if (state.socket.id === data.id) {
                controls.setBody(ship);
                camera.follow(ship.object);
            }
        })

        state.socket.on("initObjects", (data) => {
            for(let key in data) {
                if (key !== state.socket.id) {
                    let object = data[key];
                    let ship = prefabs.ship(object.id, object.position, object.color);
                    state.players[object.id] = ship;
                }
            }
        })

        state.socket.on("removePlayer", (id) => {
            if (state.players[id] !== undefined) {
                state.players[id].remove();
            }
        });
    }
}