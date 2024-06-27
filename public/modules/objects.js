import { createCircleBody } from "./physics.js";
import Box2D from "../lib/Box2D_v2.3.1_min.js";
import settings from "./settings.js";
import update from "./update.js"

export class Gameobject {
    constructor(name, x = 0, y = 0) {
        this.name = name;

        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;
        
        return this;
    }

    addTo(parent) {
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
        }, this.name + ".physicspos");

        return this;
    }

    setLinearVelocity(x, y) {
        if (this.rigidbody) {
            this.rigidbody.SetLinearVelocity(
                new Box2D.b2Vec2(x, y)
            );
        }

        return this;
    }
}