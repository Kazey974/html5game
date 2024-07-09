export default {
    list: [],
    nextInterval: {
        get(int) {
            this[int] ??= Math.floor(Date.now() / int) * int;

            if (Date.now() >= this[int]) {
                this[int] = Math.floor((Date.now() + int) / int) * int;
                return true;
            }

            return false;
        },
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