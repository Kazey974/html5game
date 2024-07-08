export default {
    list: [],
    nextInterval: {
        set(int) {
            this[int] = Math.floor(Date.now() / int) * int;
        },
        increment(int) {
            this[int] = Math.floor((this[int] + int) / int) * int;
        }
    },
    proc() {
        for(let key in this.list) {
            if (typeof this.list[key] === "function") {
                this.list[key]();
            }
        }
    },
    add(func,id = this.list.length) {
        this.list[id] = func;
    },
    remove(id) {
        delete this.list[id];
    }
}