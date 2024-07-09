import { Quat, Vec3, createSphereBody, destroy } from "./physics.js";
import { Euler, Object3D, Vector3 } from "../lib/three_v0.166.0.min.js";
import update from "./update.js"
import state from "./state.js";
import controls from "./controls.js";
import settings from "./settings.js";

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
        
        return this;
    }

    input(id) {
        if (this.rigidbody) {
            let magnitude = 1;
            let velocityRatio = 1 / 2;
            let rotationRatio = 1 / 20;
            let local = id === state.socket.id;
            let up, down, left, right;

            if (local) {
                [up, down, left,right] = [
                    settings.defaultControls.up.filter((k) => controls.keysPressed.has(k)).length,
                    settings.defaultControls.down.filter((k) => controls.keysPressed.has(k)).length,
                    settings.defaultControls.left.filter((k) => controls.keysPressed.has(k)).length,
                    settings.defaultControls.right.filter((k) => controls.keysPressed.has(k)).length
                ];
            } else {
                [up, down, left, right] = [
                    "up" in state.players[id].currentInputs,
                    "down" in state.players[id].currentInputs,
                    "left" in state.players[id].currentInputs,
                    "right" in state.players[id].currentInputs
                ];
            }

            if (up) {
                this.setVelocity(0, magnitude * velocityRatio, 0, true);
            } else if (down) {
                this.setVelocity(0, -magnitude * velocityRatio, 0, true);
            }

            if (left) {
                this.setRotation(magnitude * rotationRatio);
            } else if (right) {
                this.setRotation(-magnitude * rotationRatio);
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
        }

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

    setPhysicsPos() {
        let id = [this.name, this.id, ".physicspos"].join("");
        
        update.add(() => {
            let physicsPos = this.rigidbody.GetPosition();
            let newPos = this.object.position.lerp(new Vector3(physicsPos.GetX(), physicsPos.GetY(), physicsPos.GetZ()), 0.5);
            this.object.position.set(newPos.x, newPos.y, newPos.z);

            let physicsRotation = this.rigidbody.GetRotation().GetEulerAngles();
            let euler = new Euler(physicsRotation.GetX(), physicsRotation.GetY(), physicsRotation.GetZ());
            this.object.setRotationFromEuler(euler);
        }, id);

        this.shouldDestroy.push(id);
        return this;
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

    addVelocity(x, y, z, relative = false) {
        if (this.rigidbody) {
            let forward = this.rigidbody.GetRotation().RotateAxisY();
            let direction = !relative ? Vec3(x, y, z) : forward.Mul(y);

            this.rigidbody.AddForce(direction);

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
        state.physicsRemoveQueue.push(this.rigidbody.GetID());
        delete state.players[this.id];
    }
}