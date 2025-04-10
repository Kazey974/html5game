import { Ship } from "./objects.js";

export default {
    state: undefined,
    camera: undefined,

    init(state, camera) {
        this.camera = camera;
        this.state = state;

        this.state.socket = io();

        this.state.socket.on("connect", () => {
            console.log("connect");
            
        });

        this.state.socket.on("playerJoined", (data) => {
            console.log("playerJoined");
            let local = this.state.socket.id === data.id;

            if (local) {
                state.level.clear();
            }

            let ship = new Ship("ship", data.id, data.position.x, data.position.y, data.position.z, data.color);
            this.state.players[data.id] = ship;
            ship.addTo(state.level);
            ship.addSphereBody(state);
            ship.setPhysicsPosition();

            if (local) {
                camera.follow(ship.object);
                ship.processLocalInputs();
            } else {
                ship.processDistantInputs();
            }
        })

        this.state.socket.on("initOtherObjects", (data) => {
            console.log("initOtherObjects");
            for(let key in data) {
                if (key !== this.state.socket.id) {
                    let object = data[key];
                    let ship = new Ship("ship", object.id, object.position.x, object.position.y, object.position.z, object.color);
                    this.state.players[object.id] = ship;
                    ship.addTo(state.level);
                    ship.addSphereBody(state);
                    ship.setPhysicsPosition();
                    ship.processDistantInputs();
                }
            }
        })

        this.state.socket.on("sync", (data) => {
            this.syncToServer(data.list);
        });

        this.state.socket.on("removePlayer", (id) => {
            console.log("removePlayer");
            if (this.state.players[id]) {
                this.state.players[id].remove();
            }

            if (this.state.networking.players[id]) {
                delete this.state.networking.players[id];
            }
        });
    },

    syncToServer(list) {
        for (let index in list) {
            let data = list[index];
            this.state.networking.players[data.id] = data;

            //INPUTS
            if (data.id !== this.state.socket.id) {
                this.state.players[data.id].currentInputs = data.currentInputs;
            }
        }
    },
}