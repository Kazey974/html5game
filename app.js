const app = new PIXI.Application();
await app.init({ width: 640, height: 360 });
document.body.appendChild(app.canvas);

const map = await SpriteFrom("assets/map/map.png");
await PIXI.Assets.load("assets/sprites/link.png");
initMap(map);

var keys = new Set();

const down = ["ArrowDown","S","s"];
const right = ["ArrowRight","D","d"];
const up = ["ArrowUp","Z","z"];
const left = ["ArrowLeft","Q","q"];

window.addEventListener("keydown", (e) => {
    if ([...down, ...right, ...up, ...left].includes(e.key)) {
        keys.add(e.key);
    }
})

window.addEventListener("keyup", (e) => {
    keys.delete(e.key);
})
const player = new PIXI.Container();

const [link_idle_down,
    link_idle_right,
    link_idle_up,
    link_idle_left,
    link_walk_down,
    link_walk_right,
    link_walk_left,
    link_walk_up] = await initPlayer();

const animations = {
    "link_idle_down": link_idle_down,
    "link_idle_right": link_idle_right,
    "link_idle_up": link_idle_up,
    "link_idle_left": link_idle_left,
    "link_walk_down": link_walk_down,
    "link_walk_right": link_walk_right,
    "link_walk_left": link_walk_left,
    "link_walk_up": link_walk_up,
};
    
app.stage.addChild(map);

player.currentAnimation = "link_idle_down";
player.x = 295;
player.y = 180;


app.stage.addChild(player);

let elapsed = 0.0;
app.ticker.add((ticker) => {
    elapsed += ticker.deltaTime;

    if (keys.size) {
        if ([...keys].filter(v => down.includes(v)).length) {
            if (player.currentAnimation != "link_walk_down") {
                player.currentAnimation = "link_walk_down";
            }

            player.y += 1;
        } else if ([...keys].filter(v => up.includes(v)).length) {
            if (player.currentAnimation != "link_walk_up") {
                player.currentAnimation = "link_walk_up";
            }

            player.y -= 1;
        }
        
        if ([...keys].filter(v => right.includes(v)).length) {
            if (player.currentAnimation != "link_walk_right") {
                player.currentAnimation = "link_walk_right";
            }

            player.x += 1;
        } else if ([...keys].filter(v => left.includes(v)).length) {
            if (player.currentAnimation != "link_walk_left") {
                player.currentAnimation = "link_walk_left";
            }

            player.x -= 1;
        }
    } else {
        if (player.currentAnimation != "link_idle_down" && player.currentAnimation == "link_walk_down") {
            player.currentAnimation = "link_idle_down";
        }
        if (player.currentAnimation != "link_idle_up" && player.currentAnimation == "link_walk_up") {
            player.currentAnimation = "link_idle_up";
        }
        if (player.currentAnimation != "link_idle_right" && player.currentAnimation == "link_walk_right") {
            player.currentAnimation = "link_idle_right";
        }
        if (player.currentAnimation != "link_idle_left" && player.currentAnimation == "link_walk_left") {
            player.currentAnimation = "link_idle_left";
        }
    }

    if (player.children[0] !== animations[player.currentAnimation]) {
        player.removeChildren();
        player.addChild(animations[player.currentAnimation]);
    }
});

async function SpriteFrom(url) {
    await PIXI.Assets.load(url);
    return PIXI.Sprite.from(url);
}

function initMap(map) {
    let scale = 1.3;
    map.scale.set(scale,scale);
    map.x = -5;
    map.y = -250;
}

async function initPlayer() {
    const texture = PIXI.Texture.from("assets/sprites/link.png");

    const idle_down = new PIXI.Texture({ source: texture, frame: new PIXI.Rectangle(0,0,18,24) });
    const link_idle_down = PIXI.Sprite.from(idle_down);
    link_idle_down.scale.set(1.5, 1.5);

    const idle_right = new PIXI.Texture({ source: texture, frame: new PIXI.Rectangle(18 * 9,0,18,24) });
    const link_idle_right = PIXI.Sprite.from(idle_right);
    link_idle_right.scale.set(1.5, 1.5);

    const idle_up = new PIXI.Texture({ source: texture, frame: new PIXI.Rectangle(18 * 21,0,18,24) });
    const link_idle_up = PIXI.Sprite.from(idle_up);
    link_idle_up.scale.set(1.5, 1.5);

    const idle_left = new PIXI.Texture({ source: texture, frame: new PIXI.Rectangle(18 * 9,0,18,24) });
    const link_idle_left = PIXI.Sprite.from(idle_left);
    link_idle_left.anchor.x = 1
    link_idle_left.scale.set(-1.5, 1.5);

    const link_walk_down = createAnimation(texture, 1, 8);
    const link_walk_right = createAnimation(texture, 10, 20);
    const link_walk_left = createAnimation(texture, 10, 20, true);
    const link_walk_up = createAnimation(texture, 22, 29);

    return [link_idle_down,
    link_idle_right,
    link_idle_up,
    link_idle_left,
    link_walk_down,
    link_walk_right,
    link_walk_left,
    link_walk_up];
}

function createAnimation(texture, from, to, flip = false) {
    const textureArray = [];
    for (let i = from; i <= to; i++) {
        textureArray.push(new PIXI.Texture({ source: texture, frame: new PIXI.Rectangle(18 * i, 0, 18, 24) }));
    }

    const animation = new PIXI.AnimatedSprite(textureArray);
    if (flip) {
        animation.anchor.x = 1;
        animation.scale.set(-1.5, 1.5);
    } else {
        animation.scale.set(1.5, 1.5);
    }
    animation.animationSpeed = 1/6;
    animation.play();

    return animation;
}

function handleCharacter(keys) {
}