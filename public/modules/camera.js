import state from "./state.js";
import update from "./update.js";

export default {
    following: {x: 0, y: 0},

    centerOn(x, y) {
        if (state.level) {
            state.level.pivot.x = this.following.x;
            state.level.pivot.y = this.following.y;

            if (state.level.x !== (window.innerWidth / 2)) {
                state.level.x = (window.innerWidth / 2);
            }

            if (state.level.y !== (window.innerHeight / 2)) {
                state.level.y = (window.innerHeight / 2);
            }

            console.log(
                [state.level.pivot.x, state.level.pivot.y],
                [this.following.x, this.following.y]
            );
        }
    },
    follow(object) {
        this.following = object;
    },
    init() {
        update.add(() => {
            this.centerOn(this.following.x, this.following.y);
        })
    }
}