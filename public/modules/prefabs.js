import { Mesh, MeshBasicMaterial, SphereGeometry } from "../lib/three_v0.166.0.min.js";
import { Gameobject } from "./objects.js";
import state from "./state.js";

export default {
    ship(id, position = {x: 0, y: 0}, color = 0xffffff) {
        const object = new Gameobject("ship", id, position.x, position.y).addTo(state.level).addCircleBody().setPhysicsPos();
        const geometry = new SphereGeometry(0.2);
        const material = new MeshBasicMaterial({ color: color });
        const mesh = new Mesh(geometry, material);
        object.addChild(mesh);

        return object;
    }
}