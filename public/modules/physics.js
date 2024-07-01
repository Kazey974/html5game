import Jolt from "../lib/jolt_v0.24.0.js";
import settings from "./settings.js";
import state from "./state.js";
import update from "./update.js";

const LAYER_NON_MOVING = 0;
const LAYER_MOVING = 1;

export function initPhysics() {

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

    state.physicsDeactivateQueue = [];
    state.physicsDestroyQueue = [];
    state.physicsSystem = physicsSystem;
    state.physicsWorld = physicsSystem.GetBodyInterface();
    
    Jolt.destroy(joltSettings);

    update.add(() => {
        if (state.physicsDeactivateQueue.length) {
            let id  = state.physicsDeactivateQueue.pop();
            state.physicsWorld.DeactivateBody(id);
            state.physicsDestroyQueue.push({
                id: id,
                time: state.time + 1
            });
        }

        //FIX MEMORY ACCESS OUT OF BOUNDS
        // if (state.physicsDestroyQueue.length
        // && state.physicsDestroyQueue[0].time < state.time) {
        //     let id = state.physicsDestroyQueue.shift();
        //     state.physicsWorld.DestroyBody(id);
        // }
        
        jolt.Step(state.deltaTime, 1);
    }, 'physicsWorld.step');


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
    body.SetRestitution(0);

    let constraintSettings = new Jolt.SixDOFConstraintSettings();
    constraintSettings.MakeFreeAxis(Jolt.SixDOFConstraintSettings_EAxis_TranslationX);
    constraintSettings.MakeFreeAxis(Jolt.SixDOFConstraintSettings_EAxis_TranslationY);
    constraintSettings.SetLimitedAxis(Jolt.SixDOFConstraintSettings_EAxis_TranslationZ, 0, 0);
    constraintSettings.SetLimitedAxis(Jolt.SixDOFConstraintSettings_EAxis_RotationX, 0, 0);
    constraintSettings.SetLimitedAxis(Jolt.SixDOFConstraintSettings_EAxis_RotationY, 0, 0);
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