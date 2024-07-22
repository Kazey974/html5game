import { destroy, jsify, Quat, Vec3 } from "./physics.js";
import camera from "./camera.js";
import prefabs from "./prefabs.js";
import state from "./state.js";
import update from "./update.js";
import controls from "./controls.js";

export default {
    init() {
        state.socket = io();
        state.networking = {};
        state.networking.players = {};

        state.socket.on("connect", () => {
            this.startInterpolating();
        });

        state.socket.on("initPlayer", (data) => {
            let ship = prefabs.ship(data.id, data.position, data.color);
            state.players[data.id] = ship;

            if (state.socket.id === data.id) {
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

        state.socket.on("sync", (data) => {
            this.syncToServer(data.list);
        });

        state.socket.on("removePlayer", (id) => {
            if (state.players[id] !== undefined) {
                state.players[id].remove();
            }

            delete state.networking.players[id];
        });
    },

    startInterpolating() {
        setInterval(() => {
            if (state.networking.players) {
                for (let id in state.networking.players) {
                    let data = state.networking.players[id];
                    let player = state.players[id];
            
                    if (!player) {
                        continue;
                    }
                    
                    if (state.physicsWorld) {
                        let position = jsify(player.rigidbody.GetPosition(), "Vec3")
                        let rotation = jsify(player.rigidbody.GetRotation(), "Quat")
                        let velocity = jsify(player.rigidbody.GetLinearVelocity(), "Vec3")
                        let angular = jsify(player.rigidbody.GetAngularVelocity(), "Vec3")

                        let xDifference = Math.abs(position.x - data.position.x);
                        let yDifference = Math.abs(position.y - data.position.y);

                        let interpolated = {
                            position: data.position,
                            rotation: data.rotation,
                            velocity: data.velocity,
                            angular: data.angular
                        };

                        if (xDifference <= 2 && yDifference <= 2) {
                            console.log("Position matches for " + id);
                            delete state.networking.players[id];
                            continue;
                        } else if (xDifference < 20 && xDifference < 20) {
                            console.log("Interpolate " + id);
                            interpolated = this.interpolate(
                                {
                                    position: position,
                                    rotation: rotation,
                                    velocity: velocity,
                                    angular: angular
                                }, {
                                    position: data.position,
                                    rotation: data.rotation,
                                    velocity: data.velocity,
                                    angular: data.angular
                                }
                            )
                        } else {
                            console.log("Teleport " + id);
                        }

                        this.setPhysicsPosition(
                            player,
                            interpolated.position,
                            interpolated.rotation,
                            interpolated.velocity,
                            interpolated.angular
                        );
                    }
                }
            }
        }, 5);
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

    setPhysicsPosition(
        player,
        position,
        rotation,
        velocity,
        angular
    ) {
        let newPosition = Vec3(
            position.x,
            position.y,
            0
        );

        let newRotation = Quat(
            rotation.x,
            rotation.y,
            rotation.z,
            rotation.w
        );
        
        let newVelocity = Vec3(
            velocity.x,
            velocity.y,
            velocity.z,
        );
        
        let newAngular = Vec3(
            angular.x,
            angular.y,
            angular.z,
        );

        state.physicsWorld.SetPositionAndRotationWhenChanged(
            player.rigidbody.GetID(),
            newPosition,
            newRotation
        );

        state.physicsWorld.SetLinearVelocity(
            player.rigidbody.GetID(),
            newVelocity
        );

        state.physicsWorld.SetAngularVelocity(
            player.rigidbody.GetID(),
            newAngular
        );

        destroy(newPosition, newRotation, newVelocity, newAngular);
    },

    interpolate(A, B) {
        let out = {};
        for (let key in A) {
            out[key] = {};
            for (let dimension in A[key]) {
                let diff = A[key][dimension] - B[key][dimension];
                
                out[key][dimension] = B[key][dimension] + (diff / 2);
            }
        }

        return out;
    }
}