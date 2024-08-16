import camera from "./camera.js";
import prefabs from "./prefabs.js";
import state from "./state.js";

export default {
    init() {
        state.socket = io();

        state.socket.on("connect", () => {
            
        });

        state.socket.on("playerJoined", (data) => {
            let ship = prefabs.ship(data.id, data.position, data.color);
            state.players[data.id] = ship;

            if (state.socket.id === data.id) {
                camera.follow(ship.object);
            }
        })

        state.socket.on("initOtherObjects", (data) => {
            for(let key in data) {
                if (key !== state.socket.id) {
                    let object = data[key];
                    let ship = prefabs.ship(object.id, object.position, object.color);
                    state.players[object.id] = ship;
                }
            }
        })

        state.socket.on("sync", (data) => {
            this.syncToServer(data.list);
        });

        state.socket.on("removePlayer", (id) => {
            if (state.players[id]) {
                state.players[id].remove();
            }

            if (state.networking.players[id]) {
                delete state.networking.players[id];
            }
        });
    },

    syncToServer(list) {
        for (let index in list) {
            let data = list[index];
            state.networking.players[data.id] = data;

            //INPUTS
            if (data.id !== state.socket.id) {
                state.players[data.id].currentInputs = data.currentInputs;
            }
        }
    },
}