import { Quat, Vec3, createSphereBody, destroy } from "./physicsServer.js";
import { state } from "./gameServer.js";

export class Gameobject {
    constructor(name, id, x = 0, y = 0, z = 0) {
        this.name = name;
        this.id = id;
        this.object = {position: {x: x, y: y, z: z}};
        this.shouldDestroy = [];
        
        return this;
    }

    addSphereBody() {
        this.rigidbody = createSphereBody(state.players.length, this.object.position.x, this.object.position.y, this.object.position.z, 1, true);

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
        state.physicsWorld.RemoveBody(this.rigidbody.GetID());
    }
}