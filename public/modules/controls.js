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
            let magnitude = 0.0005 * state.deltaTime;
            let [up, down, left,right ] = [
                settings.defaultControls.up.filter((k) => this.keysPressed.has(k)).length,
                settings.defaultControls.down.filter((k) => this.keysPressed.has(k)).length,
                settings.defaultControls.left.filter((k) => this.keysPressed.has(k)).length,
                settings.defaultControls.right.filter((k) => this.keysPressed.has(k)).length
            ];
            let inputs = [];

            if (up) {
                this.object.addVelocity(0, magnitude, true);
                inputs.push("up");
            } else if (down) {
                this.object.addVelocity(0, -magnitude, true);
                inputs.push("down");
            }

            if (left) {
                this.object.setRotation(magnitude * 4);
                inputs.push("left");
            } else if (right) {
                this.object.setRotation(-magnitude * 4);
                inputs.push("right");
            }

            if (inputs.length) {
                state.socket.emit('inputs', inputs);
            }
        }, "control");
    }
}