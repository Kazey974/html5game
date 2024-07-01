import state from "./state.js";
import update from "./update.js";

export default {
    following: {x: 0, y: 0, z: 0},

    //TODO: Fix camera not following at great speeds
    centerOn(x, y, z) {
        if (state.camera) {
            state.camera.position.setX(x);
            state.camera.position.setY(y);
            state.camera.position.setZ(z + 10);
        }
    },
    follow(object) {
        this.following = object;
    },
    init() {
        update.add(() => {
            if (this.following.position !== undefined) {
                this.centerOn(this.following.position.x, this.following.position.y, this.following.position.z);
            }
        })
    }
}