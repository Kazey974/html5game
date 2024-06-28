import { createCircleBody } from "./physics.js";
import { Euler, Object3D } from "../lib/three_v0.166.0.min.js";
import Box2D from "../lib/Box2D_v2.3.1_min.js";
import settings from "./settings.js";
import update from "./update.js"
import state from "./state.js";

export class Gameobject {
    constructor(name, id, x = 0, y = 0) {
        this.name = name;
        this.id = id;
        this.object = new Object3D();
        this.object.position.setX(x);
        this.object.position.setY(y);
        
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

    addCircleBody() {
        this.rigidbody = createCircleBody(this.object.position.x, this.object.position.y, 0.1, true);

        return this;
    }

    setPhysicsPos() {
        update.add(() => {
            let physicsPos = this.rigidbody.GetPosition();
            this.object.position.setX(physicsPos.x * settings.BOX2D_CONVERSION_SCALE);
            this.object.position.setY(physicsPos.y * settings.BOX2D_CONVERSION_SCALE);

            let physicsRotation = this.rigidbody.GetAngle();
            let euler = new Euler(0,0,physicsRotation * (Math.PI / 180));
            this.object.setRotationFromEuler(euler);
        }, [this.name, this.id, ".physicspos"].join());

        return this;
    }

    setVelocity(x, y, relative = false) {
        if (this.rigidbody) {
            let direction = new Box2D.b2Vec2(x, y);

            if (relative) {
                direction = this.rigidbody.GetWorldVector(direction);
            }
            
            this.rigidbody.SetLinearVelocity(direction);

            return this;
        }
    }

    addVelocity(x, y, relative = false) {
        if (this.rigidbody) {
            let direction = new Box2D.b2Vec2(x, y);
            let current = this.rigidbody.GetLinearVelocity();

            if (relative) {
                direction = this.rigidbody.GetWorldVector(direction);
                direction = new Box2D.b2Vec2(
                    direction.x + current.x,
                    direction.y + current.y
                );
            }
            
            this.rigidbody.SetLinearVelocity(direction);

            return this;
        }
    }

    setRotation(modifier = 0) {
        if (this.rigidbody) {
            let currentRotation = this.rigidbody.GetAngle();
            let currentPosition = this.rigidbody.GetPosition();

            this.rigidbody.SetTransform(
                currentPosition,
                currentRotation + modifier
            );
        }

        return this;
    }

    remove() {
        update.remove([this.name, this.id, ".physicspos"].join());
        this.parent.remove(this.object);
        state.physicsWorld.DestroyBody(this.rigidbody);
        delete state.players[this.id];
    }
}