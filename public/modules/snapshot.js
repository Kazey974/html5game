import { jsify } from "../utils.js";
import state from "./state.js";

export class Snapshot {
    constructor() {
        this.list = {};
    }

    set() {
        if (!state.players[state.socket.id].rigidbody) {
            return;
        }

        let timestamp = Math.floor(Date.now() / 100);
        if (!(timestamp in this.list)) {
            this.list[timestamp] = {
                position: jsify(state.players[state.socket.id].rigidbody.GetPosition(), "Vec3"),
                rotation: jsify(state.players[state.socket.id].rigidbody.GetRotation(), "Quat"),
                velocity: jsify(state.players[state.socket.id].rigidbody.GetLinearVelocity(), "Vec3"),
                angular: jsify(state.players[state.socket.id].rigidbody.GetAngularVelocity(), "Vec3")
            }
        }
        
        if (Object.keys(this.list).length > 10) {
            let lowest = Math.min(...Object.keys(this.list));
            delete this.list[lowest];
        }
    }
};