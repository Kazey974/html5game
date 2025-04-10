import { Server } from "socket.io";
import { Gameobject } from "./public/modules/objects.js";

export const state = {
    players: {},
    inputs: {},
    time: Date.now(),
    deltaTime: 0
};

export const gameServer = async (server) => {
    console.log("//SERVER START");
    const io = new Server(server);

    const nextInterval = {
        get(int) {
            this[int] ??= Math.floor(Date.now() / int) * int;

            if (Date.now() >= this[int]) {
                this[int] = Math.floor((Date.now() + int) / int) * int;
                return true;
            }

            return false;
        },
    };

    // await initPhysics();

    io.on("connection", (socket) => {
        console.log("IO - user connected : " + socket.id, Object.keys(state.players).length);

        initPlayer(socket);

        socket.on("disconnect", () => {
            deletePlayer(socket);
        });
    
        socket.on("inputs", (inputs) => {
            getInputs(socket, inputs);
        });
    });
    
    setInterval(() => {
        state.deltaTime = Date.now() - state.time;
        state.time = Date.now();

        if (nextInterval.get(10000)) {
            console.log(new Date().toISOString() + " - Current players : " + Object.keys(state.players).length
            + "\n" + Object.keys(state.players));
        }

        if (nextInterval.get(10) && state.deltaTime) {
            for (let id in state.inputs) {
                let player = state.players[id].object;

                if (player.rigidbody) {
                    let [up, down, right, left] = [
                        "up" in state.inputs[id],
                        "down" in state.inputs[id],
                        "right" in state.inputs[id],
                        "left" in state.inputs[id],
                    ];

                    player.move(up, down, right, left);
                }
            }

            updatePlayers();
        }
    })

    function initPlayer(socket) {
        state.inputs[socket.id] = {};
        let position = {x: Math.random() * 3, y: Math.random() * 3,  z: 0};
        let isValid = false;

        // Will use collision later
        while(!isValid) {
            isValid = true;
            for (let id in state.players) {
                let player = state.players[id];
                let diff = Math.abs(position.x - player.position.x) + Math.abs(position.y - player.position.y);
                if (diff < 3) {
                    isValid = false;
                }
            }

            if (!isValid) {
                position.y -= 3;
            }
        }

        let ship = new Gameobject("ship", socket.id, position.x, position.y, position.z, false);

        let newPlayer = {
            id: socket.id,
            object: ship,
            position: position,
            color: Math.floor(Math.random() * 0xffffff)
        };
    
        io.emit("playerJoined", {
            id: newPlayer.id,
            position: newPlayer.position,
            color: newPlayer.color,
            time: Math.floor(state.time / 100) * 100
        });

        let existingObjects = {};

        for (let id in state.players) {
            existingObjects[id] = {};
            Object.assign(existingObjects[id], {
                id: state.players[id].id,
                position: state.players[id].position,
                color: state.players[id].color
            });
        }

        console.log("SENDING TO : " + socket.id);
        console.log(existingObjects);
        
        io.to(socket.id).emit("initOtherObjects", existingObjects);
    
        state.players[socket.id] = {};
        Object.assign(state.players[socket.id], newPlayer);
    }

    function getInputs(socket, inputs) {
        inputs.forEach(i => {
            if (i.includes("pressed")) {
                state.inputs[socket.id][i.substr(7).toLowerCase()] = true;
            } else if (i.includes("released")) {
                delete state.inputs[socket.id][i.substr(8).toLowerCase()];
            }
        });
    }

    function updatePlayers() {
        let serverState = {
            list: {},
            time: Math.floor(state.time / 100) * 100
        };

        let list = [];

        for(let id in state.players) {
            let rigidbody = state.players[id].object.rigidbody;
            let playerState = {
                id: id,
                timestamp: Math.floor(Date.now() / 100),
                position: 0,
                rotation: 0,
                velocity: 0,
                angular: 0,
                currentInputs: state.inputs[id] ?? {}
            };

            list.push(playerState);
        }

        Object.assign(serverState.list, list);
        
        io.timeout(5000).emit("sync", serverState);
    }

    function deletePlayer(socket) {
        console.log("IO - user disconnected : " + socket.id);
        io.emit("removePlayer", socket.id);
        state.players[socket.id].object.remove();
        delete state.inputs[socket.id];
        delete state.players[socket.id];
    }
};