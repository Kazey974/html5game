import { createCircleBody } from "./physics.js";
import Box2D from "../lib/Box2D_v2.3.1_min.js";
import settings from "./settings.js";
import update from "./update.js"
import state from "./state.js";

export class Gameobject {
    constructor(name, id, x = 0, y = 0) {
        this.name = name;
        this.id = id;
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;
        
        return this;
    }

    addTo(parent) {
        this.parent = parent;
        parent.addChild(this.container);

        return this;
    }

    addChild(child) {
        this.container.addChild(child);

        return this;
    }

    setPivot(x = this.container.width / 2, y = this.container.height / 2) {
        this.container.pivot.x = x;
        this.container.pivot.y = y;

        return this;
    }

    addCircleBody() {
        this.rigidbody = createCircleBody(this.container.x, this.container.y, 10, true);

        return this;
    }

    setPhysicsPos() {
        update.add(() => {
            let physicsPos = this.rigidbody.GetPosition();
            this.container.x = physicsPos.x * settings.BOX2D_CONVERSION_SCALE;
            this.container.y = physicsPos.y * settings.BOX2D_CONVERSION_SCALE;

            let physicsRotation = this.rigidbody.GetAngle();
            this.container.rotation = physicsRotation;
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
        this.parent.removeChild(this.container);
        state.physicsWorld.DestroyBody(this.rigidbody);
        delete state.players[this.id];
    }
}