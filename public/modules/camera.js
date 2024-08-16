import state from "./state.js";
import update from "./update.js";

export default {
    following: undefined,
    
    init() {
        update.add(() => {
            if (this.following?.position) {
                this.centerOn(this.following.position.x, this.following.position.y, this.following.position.z);
            }
        }, "camera")
    },

    /**
     * Follow object with position(x,y,z)
     * @param object - {position: {x: ,y: ,z: }}
     */
    follow(object) {
        this.following = object;
    },

    //TODO: add lerp/tween
    centerOn(x, y, z) {
        if (state.camera) {
            state.camera.position.setX(x);
            state.camera.position.setY(y);
            state.camera.position.setZ(z + 10);
        }
    },
}