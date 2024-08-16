import { Quat, Vec3, createSphereBody, destroy } from "./physics.js";
import { Euler, Object3D, Vector3 } from "../lib/three_v0.166.0.min.js";
import update from "./update.js"
import state from "./state.js";
import controls from "./controls.js";
import settings from "./settings.js";
import { Snapshot } from "./snapshot.js";
import { jsify } from "../utils.js";

export class Gameobject {
    constructor(name, id, x = 0, y = 0, z = 0) {
        this.name = name;
        this.id = id;

        this.object = new Object3D();
        this.object.position.setX(x);
        this.object.position.setY(y);
        this.object.position.setZ(z);

        this.shouldDestroy = [];
        this.currentInputs = {};
        this.magnitude = settings.physics.magnitude;
        this.velocityRatio = settings.physics.velocityRatio;
        this.rotationRatio = settings.physics.rotationRatio;
        this.snapshots = new Snapshot();
        
        return this;
    }

    processInputs() {
        let id = [this.name, this.id, ".processInputs"].join("");
        update.add(() => {
            let local = this.id === state.socket.id;
            let up, down, left, right;
    
            if (local) {
                [up, down, left,right] = [
                    controls.get("up"),
                    controls.get("down"),
                    controls.get("left"),
                    controls.get("right"),
                ];
            } else if (state.players[id]) {
                [up, down, left, right] = [
                    "up" in state.players[id].currentInputs,
                    "down" in state.players[id].currentInputs,
                    "left" in state.players[id].currentInputs,
                    "right" in state.players[id].currentInputs
                ];
            }
    
            if (this.rigidbody) {
                if (up) {
                    this.setVelocity(0, this.magnitude * this.velocityRatio, 0, true);
                } else if (down) {
                    this.setVelocity(0, -this.magnitude * this.velocityRatio, 0, true);
                }
    
                if (left) {
                    this.setRotation(this.magnitude * this.rotationRatio);
                } else if (right) {
                    this.setRotation(-this.magnitude * this.rotationRatio);
                }
            }
    
            if (local) {
                let inputDiff = [];
    
                if (up && !("up" in this.currentInputs)) {
                    this.currentInputs["up"] = true;
                    inputDiff.push("pressedUp");
                } else if (down && !("down" in this.currentInputs)) {
                    this.currentInputs["down"] = true;
                    inputDiff.push("pressedDown");
                }
    
                if (left && !("left" in this.currentInputs)) {
                    this.currentInputs["left"] = true;
                    inputDiff.push("pressedLeft");
                } else if (right && !("right" in this.currentInputs)) {
                    this.currentInputs["right"] = true;
                    inputDiff.push("pressedRight");
                }
    
                if (!up && "up" in this.currentInputs) {
                    delete this.currentInputs["up"];
                    inputDiff.push("releasedUp");
                }
                if (!down && "down" in this.currentInputs) {
                    delete this.currentInputs["down"];
                    inputDiff.push("releasedDown");
                }
                if (!left && "left" in this.currentInputs) {
                    delete this.currentInputs["left"];
                    inputDiff.push("releasedLeft");
                }
                if (!right && "right" in this.currentInputs) {
                    delete this.currentInputs["right"];
                    inputDiff.push("releasedRight");
                }
    
                if (inputDiff.length) {
                    state.socket.emit('inputs', inputDiff);
                }
            }
        }, id);

        this.shouldDestroy.push(id);

        return this;
    }

    addTo(parent) {
        this.parent = parent;
        parent.add(this.object);

        return this;
    }

    addChild(child) {
        this.object.add(child);

        return this;
    }

    addSphereBody() {
        this.rigidbody = createSphereBody(state.players.length, this.object.position.x, this.object.position.y, this.object.position.z, 1, true);

        return this;
    }

    // Sync Jolt position to ThreeJS position
    setPhysicsPos() {
        let id = [this.name, this.id, ".physicspos"].join("");
        
        update.add(() => {
            let physicsPos = this.rigidbody.GetPosition();
            let newPos = this.object.position.lerp(new Vector3(physicsPos.GetX(), physicsPos.GetY(), physicsPos.GetZ()), 0.5);
            this.object.position.set(newPos.x, newPos.y, newPos.z);

            let physicsRotation = this.rigidbody.GetRotation().GetEulerAngles();
            let euler = new Euler(physicsRotation.GetX(), physicsRotation.GetY(), physicsRotation.GetZ());
            this.object.setRotationFromEuler(euler);

            if (this.id === state.socket.id) {
                this.snapshots.set();
            }
        }, id);

        this.shouldDestroy.push(id);
        return this;
    }

    interpolateNetworkPosition() {
        let id = [this.name, this.id, ".interpolate"].join("");

        update.add(() => {
            if (this.id in state.networking.players) {
                let data = state.networking.players[this.id];

                if (this.rigidbody) {
                    if (this.id === state.socket.id) {
                        this.interpolateLocalPlayer();
                    } else {
                        let position = jsify(this.rigidbody.GetPosition(), "Vec3")
                        let rotation = jsify(this.rigidbody.GetRotation(), "Quat")
                        let velocity = jsify(this.rigidbody.GetLinearVelocity(), "Vec3")
                        let angular = jsify(this.rigidbody.GetAngularVelocity(), "Vec3")
                        let newPosition, newRotation, newVelocity, newAngular = null;

                        let xDifference = Math.abs(position.x - data.position.x);
                        let yDifference = Math.abs(position.y - data.position.y);

                        if (xDifference + yDifference < 1) {
                            delete state.networking.players[this.id];
                        } else if (xDifference + yDifference > 20) {
                            newPosition = Vec3(
                                data.position.x,
                                data.position.y,
                                0
                            );
                            newRotation = Quat(
                                data.rotation.x,
                                data.rotation.y,
                                data.rotation.z,
                                data.rotation.w,
                            );
                            newVelocity = Vec3(
                                data.velocity.x,
                                data.velocity.y,
                                data.velocity.z,
                            );
                            newAngular = Vec3(
                                data.angular.x,
                                data.angular.y,
                                data.angular.z,
                            );
                        } else {
                            let interpolated = this.interpolate(
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
                            );

                            newPosition = Vec3(
                                interpolated.position.x,
                                interpolated.position.y,
                                0
                            );
                            newRotation = Quat(
                                interpolated.rotation.x,
                                interpolated.rotation.y,
                                interpolated.rotation.z,
                                interpolated.rotation.w,
                            );
                            newVelocity = Vec3(
                                interpolated.velocity.x,
                                interpolated.velocity.y,
                                interpolated.velocity.z,
                            );
                            newAngular = Vec3(
                                interpolated.angular.x,
                                interpolated.angular.y,
                                interpolated.angular.z,
                            );
                        }

                        if (newPosition && newRotation && newVelocity && newAngular) {
                            state.physicsWorld.SetPositionRotationAndVelocity(
                                this.rigidbody.GetID(),
                                newPosition,
                                newRotation,
                                newVelocity,
                                newAngular
                            );

                            destroy(newPosition, newRotation, newVelocity, newAngular);
                        }
                    }
                }
            }
        }, id);

        this.shouldDestroy.push(id);

        return this;
    }

    interpolateLocalPlayer() {

    }

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

    setVelocity(x, y, z, relative = false) {
        if (this.rigidbody) {
            if (!this.rigidbody.IsActive()) {
                state.physicsWorld.ActivateBody(
                    this.rigidbody.GetID()
                );
            }
            
            let forward = this.rigidbody.GetRotation().RotateAxisY();
            let direction = !relative ? Vec3(x, y, z) : forward.Mul(y);

            this.rigidbody.SetLinearVelocity(direction);

            if (!relative) {
                destroy(direction);
            }
        }

        return this;
    }

    setAngularVelocity(modifier) {
        if (this.rigidbody) {
            let vec3 = Vec3(0, 0, modifier);

            state.physicsWorld.SetAngularVelocity(this.rigidbody.GetID(),vec3);

            destroy(vec3);
        }

        return this;
    }

    setRotation(modifier = 0) {
        if (this.rigidbody) {
            let currentRotation = this.rigidbody.GetRotation();
            let temp = Math.asin(currentRotation.GetZ()) + modifier;
            if (temp < (-Math.PI / 2) || temp > (Math.PI / 2)) {
                temp = -temp;
            }
            let newRotation = Quat(
                currentRotation.GetX(),
                currentRotation.GetY(),
                Math.sin(temp),
                Math.cos(temp)
            );

            state.physicsWorld.SetRotation(
                this.rigidbody.GetID(),
                newRotation,
                "Activate"
            );

            destroy(newRotation);
        }

        return this;
    }

    remove() {
        for (let id of this.shouldDestroy) {
            update.remove(id);
        }

        this.parent.remove(this.object);

        if (this.rigidbody) {
            state.physicsRemoveQueue.push(this.rigidbody.GetID());
        }

        if (state.players[this.id]) {
            delete state.players[this.id];
        }
    }
}