import { Server } from "socket.io";
import { Gameobject } from "./objectServer.js";
import { initPhysics, jsify } from "./physicsServer.js";

export const state = {};
const PHYSICS_STEP = 10;

export const gameServer = async (server) => {
    console.log("//SERVER START");
    const io = new Server(server);
    state.players = {};
    state.time = Date.now();
    state.deltaTime = 0;
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

        if (!(Date.now % 1000)) {
            console.log(Date() + " - Current players : " + Object.keys(state.players));
        }
        
        if (state.jolt && Object.keys(state.players).length) {
            updatePlayers();
            state.jolt.Step(state.deltaTime * 1/30, 1);
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
        let magnitude = 1 * state.deltaTime;
        let velocityRatio = 1 / 2;
        let rotationRatio = 1 / 60;
        let player = state.players[socket.id].object;

        if (inputs.includes("up")) {
            player.setVelocity(0, magnitude * velocityRatio, 0, true);
        } else if (inputs.includes("down")) {
            player.setVelocity(0, -magnitude * velocityRatio, 0, true);
        }

        if (inputs.includes("left")) {
            player.setRotation(magnitude * rotationRatio);
        } else if (inputs.includes("right")) {
            player.setRotation(-magnitude * rotationRatio);
        }
    }

    function updatePlayers() {
        let physicState = {};
        let list = [];
        physicState = {};
        physicState.list = {};
        physicState.time = Math.floor(state.time / 100) * 100;

        for(let id in state.players) {
            let rigidbody = state.players[id].object.rigidbody;
            let playerState = {
                id: id,
                position: jsify(rigidbody.GetPosition(), "Vec3"),
                rotation: jsify(rigidbody.GetRotation(), "Quat"),
                velocity: jsify(rigidbody.GetLinearVelocity(), "Vec3"),
                angular: jsify(rigidbody.GetAngularVelocity(), "Vec3"),
            };

            list.push(playerState);
        }

        Object.assign(physicState.list, list);
        
        io.emit("physics", physicState);
    }

    function deletePlayer(socket) {
        console.log("IO - user disconnected : " + socket.id);
        io.emit("removePlayer", socket.id);
        state.players[socket.id].object.remove();
        delete state.players[socket.id];
    }
};