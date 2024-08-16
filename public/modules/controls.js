import settings from "./settings.js";

export default {
    keysPressed: new Set(),
    init() {
        window.onkeydown = (e) => { this.keysPressed.add(e.code); };
        window.onkeyup = (e) => { this.keysPressed.delete(e.code); };
    },
    get(key) {
        return settings.defaultControls[key].filter((k) => this.keysPressed.has(k)).length;
    }
}