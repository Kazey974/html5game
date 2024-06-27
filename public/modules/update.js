export default {
    list: [],
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