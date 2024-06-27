import Box2D from "../lib/Box2D_v2.3.1_min.js";
import settings from "./settings.js";
import state from "./state.js";
import update from "./update.js";

export function initPhysics() {
    const world = new Box2D.b2World(new Box2D.b2Vec2(0, 0));
    world.SetAllowSleeping(true);
    state.physicsWorld = world;

    update.add(() => {
        world.Step(1/30, 2, 2);
    }, 'physicsWorld.step');
};

function createBody(x, y, dynamic) {
    x = x / settings.BOX2D_CONVERSION_SCALE;
    y = y / settings.BOX2D_CONVERSION_SCALE;

    var bodyDef = new Box2D.b2BodyDef();
    if (dynamic) {
        bodyDef.set_type(Box2D.b2_dynamicBody);
    }
    bodyDef.position.Set(x,y);
    return state.physicsWorld.CreateBody(bodyDef);
}

export function createCircleBody(x, y, width, dynamic = false, ratio = 1) {
    width = width / settings.BOX2D_CONVERSION_SCALE;
    
    var body = createBody(x, y, dynamic);
    var bodyShape = new Box2D.b2CircleShape();
    bodyShape.m_radius = (width) / ratio;
    body.CreateFixture(bodyShape, 1);

    return body;
};