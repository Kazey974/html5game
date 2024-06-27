import settings from "./settings.js";
import state from "./state.js";
import update from "./update.js";

export default {
    object: null,
    rigidbody: null,
    keysPressed: new Set(),
    setBody(object) {
        this.object = object;
        this.rigidbody = object.rigidbody;
        update.remove("control");
        this.init();
    },
    init() {
        window.onkeydown = (e) => { this.keysPressed.add(e.code); };
        window.onkeyup = (e) => { this.keysPressed.delete(e.code); };

        update.add(() => {
            let magnitude = 0.01 * state.deltaTime;
            if (settings.defaultControls.up.filter((k) => this.keysPressed.has(k)).length) {
                this.object.addVelocity(0, -magnitude, true);
            } else if (settings.defaultControls.down.filter((k) => this.keysPressed.has(k)).length) {
                this.object.addVelocity(0, magnitude, true);
            }

            if (settings.defaultControls.left.filter((k) => this.keysPressed.has(k)).length) {
                this.object.setRotation(-magnitude * 4);
            } else if (settings.defaultControls.right.filter((k) => this.keysPressed.has(k)).length) {
                this.object.setRotation(magnitude * 4);
            }
        }, "control");
    }
}