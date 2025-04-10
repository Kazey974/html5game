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
                position: state.players[state.socket.id],
                rotation: state.players[state.socket.id],
                velocity: state.players[state.socket.id],
                angular: state.players[state.socket.id]
            }
        }
        
        if (Object.keys(this.list).length > 10) {
            let lowest = Math.min(...Object.keys(this.list));
            delete this.list[lowest];
        }
    }

    get(timestamp) {
        let out = false;

        for (let t in this.list) {
            if (t < timestamp) {
                delete this.list[t];
            }
        }

        if (timestamp in this.list) {
            out = this.list[timestamp];
            delete this.list[timestamp];
        }

        return out;
    }

    update(timestamp, data) {
        for (let t in this.list) {
            if (t > timestamp) {
                this.list[t].position.x += data.position.x;
                this.list[t].position.y += data.position.y;
                this.list[t].rotation.x += data.rotation.x;
                this.list[t].rotation.y += data.rotation.y;
                this.list[t].rotation.z += data.rotation.z;
                this.list[t].rotation.w += data.rotation.w;
                this.list[t].velocity.x += data.velocity.x;
                this.list[t].velocity.y += data.velocity.y;
                this.list[t].velocity.z += data.velocity.z;
                this.list[t].angular.x += data.angular.x;
                this.list[t].angular.y += data.angular.y;
                this.list[t].angular.z += data.angular.z;
            }
        }
    }
};