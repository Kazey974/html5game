export default {
    keysPressed: new Set(),
    init() {
        window.onkeydown = (e) => { this.keysPressed.add(e.code); };
        window.onkeyup = (e) => { this.keysPressed.delete(e.code); };
    }
}