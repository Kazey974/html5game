export default {
    list: [],
    paused: [],
    nextInterval: {
        get(int, id = int) {
            this[id] ??= Math.floor(Date.now() / int) * int;

            if (Date.now() >= this[id]) {
                this[id] = Math.floor((Date.now() + int) / int) * int;
                return true;
            }

            return false;
        },
    },
    proc() {
        for(let key in this.list) {
            if (typeof this.list[key] === "function" && !this.paused.includes(key)) {
                this.list[key]();
            }
        }
    },
    add(func,id = this.list.length) {
        this.list[id] = func;
    },
    remove(id) {
        delete this.list[id];
    },
    pause(id, shouldPause = undefined) {
        let i = this.paused.indexOf(id);
        if (i > -1 && shouldPause !== true) {
            this.paused.splice(id, 1);
        } else if (shouldPause !== false) {
            this.paused.push(id);
        }
    }
}