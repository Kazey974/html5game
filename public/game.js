import loader from "./loader.js"
import { Gameobject } from "./modules/objects.js"
import state from "./modules/state.js";
import PIXI from "./lib/PixiJS_v8.2.0.js";

export default {
    init() {
        const player = new Gameobject("player").addTo(state.stage);
        const playerShip = PIXI.Sprite.from("placeholder");
        player.container.addChild(playerShip);
    }
}