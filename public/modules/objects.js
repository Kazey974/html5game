import { Quat, Vec3, createSphereBody, destroy } from "./physics.js";
import { Euler, Object3D, Vector3 } from "../lib/three_v0.166.0.min.js";
import update from "./update.js"
import state from "./state.js";

const MOVING = false;

export class Gameobject {
    constructor(name, id, x = 0, y = 0, z = 0) {
        this.name = name;
        this.id = id;
        this.object = new Object3D();
        this.object.position.setX(x);
        this.object.position.setY(y);
        this.object.position.setZ(z);
        this.shouldDestroy = [];
        
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

    setRotation(modifier = 0) {
        if (this.rigidbody) {
            let currentRotation = this.rigidbody.GetRotation();
            let temp = Math.asin(currentRotation.GetZ()) + modifier;
            if (temp < (-Math.PI / 2) || temp > (Math.PI / 2)) {
                temp = -temp;
            }
            let newRotation = new Quat(
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