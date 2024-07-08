import game from "../game.js";
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
        state.currentInputs = {};

        update.add(() => {
            let magnitude = 1;
            let velocityRatio = 1 / 2;
            let rotationRatio = 1 / 20;
            let [up, down, left,right ] = [
                settings.defaultControls.up.filter((k) => this.keysPressed.has(k)).length,
                settings.defaultControls.down.filter((k) => this.keysPressed.has(k)).length,
                settings.defaultControls.left.filter((k) => this.keysPressed.has(k)).length,
                settings.defaultControls.right.filter((k) => this.keysPressed.has(k)).length
            ];
            let inputDiff = [];

            if (!(Date.now() % 10)) {
                if (up) {
                    this.object.setVelocity(0, magnitude * velocityRatio, 0, true);
                    if (!("up" in state.currentInputs)) {
                        state.currentInputs["up"] = true;
                        inputDiff.push("pressedUp");
                    }
                } else if (down) {
                    this.object.setVelocity(0, -magnitude * velocityRatio, 0, true);
                    if (!("down" in state.currentInputs)) {
                        state.currentInputs["down"] = true;
                        inputDiff.push("pressedDown");
                    }
                }
    
                if (left) {
                    this.object.setRotation(magnitude * rotationRatio);
                    if (!("left" in state.currentInputs)) {
                        state.currentInputs["left"] = true;
                        inputDiff.push("pressedLeft");
                    }
                } else if (right) {
                    this.object.setRotation(-magnitude * rotationRatio);
                    if (!("right" in state.currentInputs)) {
                        state.currentInputs["right"] = true;
                        inputDiff.push("pressedRight");
                    }
                }

                if (!up && "up" in state.currentInputs) {
                    delete state.currentInputs["up"];
                    inputDiff.push("releasedUp");
                } else if (!down && "down" in state.currentInputs) {
                    delete state.currentInputs["down"];
                    inputDiff.push("releasedDown");
                } else if (!left && "left" in state.currentInputs) {
                    delete state.currentInputs["left"];
                    inputDiff.push("releasedLeft");
                } else if (!right && "right" in state.currentInputs) {
                    delete state.currentInputs["right"];
                    inputDiff.push("releasedRight");
                }
    
                if (inputDiff.length) {
                    state.socket.emit('inputs', inputDiff);
                }
            }
        }, "control");
    }
}