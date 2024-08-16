import { Server } from "socket.io";
import { Gameobject } from "./objectServer.js";
import { initPhysics } from "./physicsServer.js";
import { jsify } from "./public/utils.js";
import settings from "./public/modules/settings.js";

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
                let magnitude = settings.physics.magnitude;
                let velocityRatio = settings.physics.velocityRatio;
                let rotationRatio = settings.physics.rotationRatio;
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
        state.inputs[socket.id] = {};
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
                position: jsify(rigidbody.GetPosition(), "Vec3"),
                rotation: jsify(rigidbody.GetRotation(), "Quat"),
                velocity: jsify(rigidbody.GetLinearVelocity(), "Vec3"),
                angular: jsify(rigidbody.GetAngularVelocity(), "Vec3"),
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