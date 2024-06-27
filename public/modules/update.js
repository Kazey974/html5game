export default {
    list: [],
    proc() {
        for(let key in this.list) {
            if (typeof this.list[key] === "function") {
                this.list[key]();
            }
        }
    },
    addUpdate(func,id = this.list.length) {
        this.list[id] = func;
    },
    removeUpdate(id) {
        delete this.list[id];
    }
}