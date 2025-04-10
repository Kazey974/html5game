import * as CANNON from "cannon-es";
import * as THREE from "three";
import update from "./update.js"
import state from "./state.js";
import controls from "./controls.js";
import { Snapshot } from "./snapshot.js";

export class Gameobject {
    constructor(name, id, x = 0, y = 0, z = 0, client = true) {
        this.name = name;
        this.id = id;
        this.position = {
            x: x,
            y: y,
            z: z
        };
        this.moveSpeed = 0;
        this.maxSpeed = 0;
        this.rigidbody = null;
        this.size = 0.5;

        if (client) {
            this.object = new THREE.Object3D();
            this.object.position.setX(this.position.x);
            this.object.position.setY(this.position.y);
            this.object.position.setZ(this.position.z);
        }

        this.shouldDestroy = [];
        this.currentInputs = {};
        this.snapshots = new Snapshot();
        
        return this;
    }

    move(up, down, right, left) {
        if (this.rigidbody) {
            let vec3 = null;

            if (up) {
                vec3 = new CANNON.Vec3(0, this.moveSpeed, 0);
            } else if (down) {
                vec3 = new CANNON.Vec3(0, -this.moveSpeed, 0);
            }
    
            if (right) {
                vec3 = new CANNON.Vec3(this.moveSpeed, 0, 0);
            } else if (left) {
                vec3 = new CANNON.Vec3(-this.moveSpeed, 0, 0);
            }

            if (vec3) {
                let velocity = this.rigidbody.velocity;

                if (velocity.length() >= this.maxSpeed
                    && !vec3.almostEquals(velocity)) {
                    this.rigidbody.applyImpulse(
                        velocity.negate(),
                        CANNON.Vec3.ZERO
                    );
                }

                this.rigidbody.applyImpulse(
                    vec3,
                    CANNON.Vec3.ZERO,
                );
            }
        }
    }

    processLocalInputs() {
        let processId = [this.name, this.id, ".processLocalInputs"].join("");
        update.add(() => {
            let up, down, left, right;
    
            [up, down, right, left] = [
                controls.get("up"),
                controls.get("down"),
                controls.get("right"),
                controls.get("left"),
            ];

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

            this.move(up, down, right, left);
        }, processId);

        this.shouldDestroy.push(processId);

        return this;
    }

    processDistantInputs() {
        let processId = [this.name, this.id, ".processDistantInputs"].join("");
        update.add(() => {
            let up, down, left, right;

            if (state.players[this.id]) {
                let player = state.players[this.id];
                [up, down, right, left] = [
                    "up" in player.currentInputs,
                    "down" in player.currentInputs,
                    "right" in player.currentInputs,
                    "left" in player.currentInputs,
                ];

                this.move(up, down, right, left);
            }
        }, processId);

        this.shouldDestroy.push(processId);

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

    updatePosition() {
        let processId = [this.name, this.id, ".updatePosition"].join("");
        update.add(() => {
            this.object.position.lerp(this.position, 0.25);
        }, processId);

        this.shouldDestroy.push(processId);
    }

    setPhysicsPosition() {
        if (this.rigidbody) {
            let processId = [this.name, this.id, ".setPhysicsPosition"].join("");
            update.add(() => {
                this.position.x = this.rigidbody.position.x;
                this.position.y = this.rigidbody.position.y;
                this.position.z = this.rigidbody.position.z;
            }, processId);
    
            this.shouldDestroy.push(processId);
        }
    }

    addSphereBody(state) {
        if (state.physics) {
            this.rigidbody = new CANNON.Body({
                mass: 100,
                position: new CANNON.Vec3(
                    this.position.x,
                    this.position.y,
                    this.position.z,
                ),
                shape: new CANNON.Sphere(this.size),
            });
    
            state.physics.addBody(this.rigidbody);
        }
    }

    remove() {
        for (let id of this.shouldDestroy) {
            update.remove(id);
        }

        if (this.parent) {
            this.parent.remove(this.object);
        }

        if (this.rigidbody) {
            state.physics.removeBody(this.rigidbody);
        }

        if (state.players[this.id]) {
            delete state.players[this.id];
        }
    }
}

export class Ship extends Gameobject {
    constructor(name, id, x = 0, y = 0, z = 0, color = 0xffffff) {
        super(name, id, x, y, z, true);

        this.moveSpeed = 2;
        this.maxSpeed = 10;

        //Visuals
        const geometry = new THREE.SphereGeometry(this.size);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        this.addChild(mesh);
        this.updatePosition();
    }
}