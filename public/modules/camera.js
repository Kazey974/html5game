export default {
    following: undefined,
    state: undefined,
    update: undefined,
    offset: 10,
    
    init(state) {
        this.state = state;
        this.update = state.update;

        this.update.add(() => {
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
        if (this.state.camera) {
            this.state.camera.position.setX(x);
            this.state.camera.position.setY(y);
            this.state.camera.position.setZ(z + this.offset);
        }
    },
}