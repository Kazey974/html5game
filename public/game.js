import { Gameobject } from "./modules/objects.js"
import { initPhysics } from "./modules/physics.js";
import camera from "./modules/camera.js";
import loader from "./loader.js"
import state from "./modules/state.js";
import controls from "./modules/controls.js";
import prefabs from "./modules/prefabs.js";
import update from "./modules/update.js";

export default {
    init() {
        const level = new PIXI.Container();
        state.level = level;
        state.players = [];
        state.socket = io();
        state.stage.addChild(level);

        initPhysics();
        camera.init()

        let rect = new PIXI.Graphics().rect(0,0,10,10).fill(0xffffff);
        rect.x = 200;
        rect.y = 200;
        state.level.addChild(rect);
        
        state.socket.on("connect", () => {
        });

        state.socket.on("initPlayer", (data) => {
            let ship = prefabs.ship(data.id, data.position, data.color);
            state.players[data.id] = ship;

            if (state.socket.id === data.id) {
                controls.setBody(ship);
                camera.follow(ship.container);
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