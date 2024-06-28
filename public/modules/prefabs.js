import { Gameobject } from "./objects.js";
import state from "./state.js";

export default {
    ship(id, position = {x: 0, y: 0}, color = 0xffffff) {
        const object = new Gameobject("ship", id, position.x, position.y).addTo(state.level).addCircleBody().setPhysicsPos();
        const image = PIXI.Sprite.from("placeholder");
        image.tint = color;
        image.scale.set(0.5);
        object.container.addChild(image);
        object.setPivot();

        return object;
    }
}