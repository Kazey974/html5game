import Box2D from "../lib/Box2D_v2.3.1_min.js";
import state from "./state.js";

export function initPhysics() {
    const world = new Box2D.b2World(new Box2D.b2Vec2(0, 0));
    world.SetAllowSleeping(true);
    state.physicsWorld = world;

    update.addFunc(() => {
        world.Step(1/30, 1, 2);
    });
};