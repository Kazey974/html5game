import { Server } from "socket.io";
import { Gameobject } from "./objectServer.js";
import { initPhysics, jsify } from "./physicsServer.js";

export const state = {};

export const gameServer = async (server) => {
    console.log("//SERVER START");
    const io = new Server(server);
    state.players = {};
    state.inputs = {};
    state.time = Date.now();
    state.deltaTime = 0;

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

    await initPhysics();

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
                let magnitude = 1;
                let velocityRatio = 1 / 2;
                let rotationRatio = 1 / 20;
                let player = state.players[id].object;

                if ("up" in state.inputs[id]) {
                    player.setVelocity(0, magnitude * velocityRatio, 0, true);
                } else if ("down" in state.inputs[id]) {
                    player.setVelocity(0, -magnitude * velocityRatio, 0, true);
                }
        
                if ("left" in state.inputs[id]) {
                    player.setRotation(magnitude * rotationRatio);
                } else if ("right" in state.inputs[id]) {
                    player.setRotation(-magnitude * rotationRatio);
                }
            }

            updatePlayers();
        }
        
        if (state.jolt && Object.keys(state.players).length) {
            if (state.deltaTime) {
                state.jolt.Step(state.deltaTime / 30, 1);
            }
        }
    })

    function initPlayer(socket) {
        let position = {x: Math.random() * 3, y: Math.random() * 3,  z: 0};
        let isValid = false;

        // Will use jolt collision later
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

        let ship = new Gameobject("ship", socket.id, position.x, position.y, position.z).addSphereBody();

        let newPlayer = {
            id: socket.id,
            object: ship,
            position: position,
            color: Math.random() * 0xffffff
        };
    
        io.emit("initPlayer", {
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
        
        io.to(socket.id).emit("initObjects", existingObjects);
    
        state.players[socket.id] = {};
        Object.assign(state.players[socket.id], newPlayer);
    }

    function getInputs(socket, inputs) {

        if (!state.inputs[socket.id]) {
            state.inputs[socket.id] = {};
        }

        inputs.forEach(i => {
            if (i.includes("pressed")) {
                state.inputs[socket.id][i.substr(7).toLowerCase()] = true;
            } else if (i.includes("released")) {
                delete state.inputs[socket.id][i.substr(8).toLowerCase()];
            }
        });
    }

    function updatePlayers() {
        let serverState = {};
        let list = [];
        serverState = {};
        serverState.list = {};
        serverState.time = Math.floor(state.time / 100) * 100;

        for(let id in state.players) {
            let rigidbody = state.players[id].object.rigidbody;
            let playerState = {
                id: id,
                time: Date.now(),
                position: jsify(rigidbody.GetPosition(), "Vec3"),
                rotation: jsify(rigidbody.GetRotation(), "Quat"),
                velocity: jsify(rigidbody.GetLinearVelocity(), "Vec3"),
                angular: jsify(rigidbody.GetAngularVelocity(), "Vec3"),
                currentInputs: state.inputs[id] ?? {}
            };

            list.push(playerState);
        }

        Object.assign(serverState.list, list);
        
        let start = Date.now();
        io.timeout(1000).emit("sync", serverState, (err, responses) => {
            if (err) {
                //Packet error
            } else {
                for(let response of responses) {
                    let latency = Date.now() - start;
                    state.players[response.id].latency = latency;
                }
            }
        });
    }

    function deletePlayer(socket) {
        console.log("IO - user disconnected : " + socket.id);
        io.emit("removePlayer", socket.id);
        state.players[socket.id].object.remove();
        delete state.inputs[socket.id];
        delete state.players[socket.id];
    }
};