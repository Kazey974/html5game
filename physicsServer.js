import initJolt from "./public/lib/jolt_v0.24.0.js";
import { state } from "./gameServer.js";

const LAYER_NON_MOVING = 0;
const LAYER_MOVING = 1;
var Jolt = null;

export async function initPhysics() {
    initJolt().then((init) =>{
        Jolt = init;
        let objectFilter = new Jolt.ObjectLayerPairFilterTable(2);
        objectFilter.EnableCollision(LAYER_NON_MOVING, LAYER_MOVING);
        objectFilter.EnableCollision(LAYER_MOVING, LAYER_MOVING);
        const BP_LAYER_NON_MOVING = new Jolt.BroadPhaseLayer(LAYER_NON_MOVING);
        const BP_LAYER_MOVING = new Jolt.BroadPhaseLayer(LAYER_MOVING);

        let bpInterface = new Jolt.BroadPhaseLayerInterfaceTable(2, 2);
        bpInterface.MapObjectToBroadPhaseLayer(LAYER_NON_MOVING, BP_LAYER_NON_MOVING);
        bpInterface.MapObjectToBroadPhaseLayer(LAYER_MOVING, BP_LAYER_MOVING);
        Jolt.destroy(BP_LAYER_MOVING, BP_LAYER_NON_MOVING);

        let joltSettings = new Jolt.JoltSettings();
        joltSettings.mObjectLayerPairFilter = objectFilter;
        joltSettings.mBroadPhaseLayerInterface = bpInterface;
        joltSettings.mObjectVsBroadPhaseLayerFilter = new Jolt.ObjectVsBroadPhaseLayerFilterTable(
            joltSettings.mBroadPhaseLayerInterface, 2,
            joltSettings.mObjectLayerPairFilter, 2
        );

        const jolt = new Jolt.JoltInterface(joltSettings);
        let physicsSystem = jolt.GetPhysicsSystem();
        physicsSystem.SetGravity(new Jolt.Vec3(0, 0, -1));

        state.physicsSystem = physicsSystem;
        state.physicsWorld = physicsSystem.GetBodyInterface();
        state.jolt = jolt;
        
        Jolt.destroy(joltSettings);
    })
};

export function createSphereBody(id, x, y, z, width, dynamic = false, ratio = 1) {
    let material = new Jolt.PhysicsMaterial();
    let shape = new Jolt.SphereShape(width / ratio, material);
    let motion = dynamic ? Jolt.EMotionType_Dynamic : Jolt.EMotionType_Static;

    let bodyPosition = new Jolt.RVec3(x, y, z);
    let bodyRotation = new Jolt.Quat(0, 0, 0, 1);
    let creationSettings = new Jolt.BodyCreationSettings(
        shape, bodyPosition, bodyRotation, motion, LAYER_MOVING
    );

    let body = state.physicsWorld.CreateBody(creationSettings);
    // Wait for next version of jolt.wasm-compat.js
    // let body = state.physicsWorld.CreateBodyWithID(id, creationSettings);

    let constraintSettings = new Jolt.SixDOFConstraintSettings();
    constraintSettings.MakeFixedAxis(Jolt.SixDOFConstraintSettings_EAxis_TranslationZ);
    constraintSettings.MakeFixedAxis(Jolt.SixDOFConstraintSettings_EAxis_RotationX);
    constraintSettings.MakeFixedAxis(Jolt.SixDOFConstraintSettings_EAxis_RotationY);
    state.physicsSystem.AddConstraint(constraintSettings.Create(Jolt.Body.sFixedToWorld, body));
    
    state.physicsWorld.AddBody(body.GetID(), Jolt.EActivation_Activate);
    
    Jolt.destroy(bodyPosition);
    Jolt.destroy(bodyRotation);
    Jolt.destroy(creationSettings);
    Jolt.destroy(constraintSettings)

    return body;
};

export function Vec3(x, y, z) {
    return new Jolt.Vec3(x, y, z);
}

export function Quat(x, y, z, w) {
    return new Jolt.Quat(x, y, z, w);
}

export function destroy(object) {
    Jolt.destroy(object);
}

export function jsify(object, type) {
    switch (type) {
        case "Vec3":
            return {
                x: object.GetX(),
                y: object.GetY(),
                z: object.GetZ(),
            };
        case "Quat":
            return {
                x: object.GetX(),
                y: object.GetY(),
                z: object.GetZ(),
                w: object.GetW(),
            }
    }
}