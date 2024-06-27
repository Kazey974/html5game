import { Gameobject } from "./modules/objects.js"
import { initPhysics } from "./modules/physics.js";
import camera from "./modules/camera.js";
import loader from "./loader.js"
import state from "./modules/state.js";
import controls from "./modules/controls.js";

export default {
    init() {
        const level = new PIXI.Container();
        state.level = level;
        state.stage.addChild(level);

        initPhysics();
        camera.init()

        const player = new Gameobject("player").addTo(state.level).addCircleBody().setPhysicsPos();
        const playerShip = PIXI.Sprite.from("placeholder");
        playerShip.tint = 0xffff00;
        playerShip.scale.set(0.5);
        player.container.addChild(playerShip);
        player.setPivot();
        controls.setBody(player);
        camera.follow(player.container);

        let rect = new PIXI.Graphics().rect(0,0,10,10).fill(0xffffff);
        rect.x = player.container.x + 200;
        rect.y = player.container.y + 200;
        state.level.addChild(rect);
    }
}