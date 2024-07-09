import { destroy, jsify, Quat, Vec3 } from "./physics.js";
import camera from "./camera.js";
import prefabs from "./prefabs.js";
import state from "./state.js";
import update from "./update.js";

export default {
    init() {
        state.socket = io();

        state.socket.on("connect", () => {

        });

        setInterval(() => {
            const start = Date.now();

            state.socket.emit("ping", Date.now() - start)
        }, 1000)

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

        state.socket.on("sync", (data, callback) => {
            console.log("Sync success");
            this.syncToServer(data.list);

            if (typeof callback === "function") {
                callback({
                    id: state.socket.id
                });
            }
        });

        state.socket.on("removePlayer", (id) => {
            if (state.players[id] !== undefined) {
                state.players[id].remove();
            }
        });
    },

    syncToServer(list) {
        for (let index in list) {
            let data = list[index];
            let player = state.players[data.id];
            
            //PHYSICS
            if (state.physicsWorld) {
                let interpolated = this.interpolate(
                    {
                        position: jsify(player.rigidbody.GetPosition(), "Vec3"),
                        rotation: jsify(player.rigidbody.GetRotation(), "Quat"),
                    }, {
                        position: data.position,
                        rotation: data.rotation,
                    }
                )

                this.setPhysicsPosition(
                    player,
                    interpolated.position,
                    interpolated.rotation,
                    data.velocity,
                    data.angular
                );
            }

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
                let value = (A[key][dimension] + B[key][dimension]) / 2;
                out[key][dimension] = value;
            }
        }

        return out;
    }
}