import { Gameobject } from "./modules/objects.js"
import { initPhysics } from "./modules/physics.js";
import camera from "./modules/camera.js";
import loader from "./loader.js"
import state from "./modules/state.js";

export default {
    init() {
        const level = new PIXI.Container();
        state.level = level;
        state.stage.addChild(level);

        initPhysics();
        camera.init()

        const player = new Gameobject("player").addTo(state.level).addCircleBody().setPhysicsPos();
        const playerShip = PIXI.Sprite.from("placeholder");
        player.container.addChild(playerShip);
        player.setPivot();
        player.setLinearVelocity(1,1);
        camera.follow(player.container);
    }
}