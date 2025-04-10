export function initPhysics(state, world) {
    state.physics = world;
    state.physics.gravity.set(0, 0, 0);

    var timeBefore = Date.now();
    
    state.update.add(() => {
        let timeStep = 1 / 30;
        state.physics.step(
            timeStep,
            state.deltaTime / 1000,
            2
        );
    });
};