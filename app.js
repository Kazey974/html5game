const app = new PIXI.Application();
await app.init({ width: 640, height: 360 });
document.body.appendChild(app.canvas);

const colliders = [];

let MOVESPEED = 2.7;
let SCREENSENSITIVITY = 30;
let DEBUG = false;

var keys = new Set();
var touch = [];
let elapsed = 0.0;

const down = ["ArrowDown","S","s"];
const right = ["ArrowRight","D","d"];
const up = ["ArrowUp","Z","z"];
const left = ["ArrowLeft","Q","q"];


const player = new PIXI.Container();
const animations = {};
await PIXI.Assets.load("assets/sprites/link.png");
await initPlayer();

const map = new PIXI.Container();
const maptile = await SpriteFrom("assets/map/map.png");
map.addChild(maptile);
map.addChild(player);

const videoAsset = await PIXI.Assets.load('https://pixijs.com/assets/video.mp4');
const button = new PIXI.Graphics()
.roundRect(0, 0, 100, 100, 10)
.fill(0xffffff, 0.5)
.beginPath()
.moveTo(36, 30)
.lineTo(36, 70)
.lineTo(70, 50)
.closePath()
.fill(0xffffff);
button.eventMode = 'static';
button.cursor = 'pointer';  
button.x = 320;
button.y = 730;
map.addChild(button);
button.on('pointertap', () => {
    console.log("Test");

    button.destroy();
    const video = new PIXI.Sprite(videoAsset);
    video.width = 100;
    video.height = 100;
    video.x = 320;
    video.y = 730;

    map.addChild(video);
})

createCollider(240,290,140,135,"house");
createCollider(0,375,110,10,"house_hill1");
createCollider(110,365,10,10,"house_hill1a");
createCollider(120,355,10,10,"house_hill1b");
createCollider(130,345,10,10,"house_hill1c");
createCollider(140,335,10,10,"house_hill1d");
createCollider(150,245,10,90,"house_hill2");
createCollider(160,235,10,10,"house_hill2a");
createCollider(170,225,10,10,"house_hill2b");
createCollider(180,215,10,10,"house_hill2c");
createCollider(190,205,10,10,"house_hill2c");
createCollider(200,195,200,10,"house_hill3");
createCollider(400,205,10,10,"house_hill3a");
createCollider(410,215,10,10,"house_hill3b");
createCollider(420,225,10,10,"house_hill3c");
createCollider(430,235,10,10,"house_hill3d");
createCollider(440,245,10,10,"house_hill3e");
createCollider(450,255,10,10,"house_hill3f");
createCollider(460,265,10,10,"house_hill3g");
createCollider(460,275,30,295,"house_hill4");
createCollider(440,560,30,30,"house_hill4a");
createCollider(200,560,240,50,"house_hill5");
createCollider(190,550,10,20,"house_hill5a");
createCollider(180,525,10,25,"house_hill5b");
createCollider(0,560,90,50,"house_hill6");
createCollider(90,530,15,40,"house_hill6a");
createCollider(55,443,45,70,"house_plant1");
createCollider(185,443,70,28,"house_plant2");
createCollider(368,443,45,28,"house_plant3");
createCollider(80,410,35,20,"house_rail1");
createCollider(115,400,15,15,"house_rail2");
createCollider(127,387,15,15,"house_rail3");
createCollider(140,374,15,15,"house_rail4");
createCollider(153,362,15,15,"house_rail5");
createCollider(166,350,15,15,"house_rail6");
createCollider(180,290,15,60,"house_rail7");
createCollider(210,525,50,40,"house_rock1");
createCollider(340,525,75,40,"house_rock2");
initMap();
app.stage.addChild(map);

window.addEventListener("keydown", (e) => {
    if ([...down, ...right, ...up, ...left].includes(e.key)) {
        keys.add(e.key);
    }
})

window.addEventListener("keyup", (e) => {
    keys.delete(e.key);
})

window.addEventListener("touchstart", (t) => {
    let event = t.changedTouches[0];
    touch[event.identifier] = {x0: event.screenX, y0: event.screenY};
});

window.addEventListener("touchmove", (t) => {
    let event = t.changedTouches[0];
    touch[event.identifier].x1 = event.screenX;
    touch[event.identifier].y1 = event.screenY;
});

window.addEventListener("touchend", (t) => {
    let event = t.changedTouches[0];
    delete touch[event.identifier];
})

app.ticker.add((ticker) => {
    elapsed += ticker.deltaTime;

    if (keys.size || (Math.abs(touch[0]?.y0 - touch[0]?.y1) > SCREENSENSITIVITY) || (Math.abs(touch[0]?.x0 - touch[0]?.x1) > SCREENSENSITIVITY)) {
        if ([...keys].filter(v => down.includes(v)).length || ( touch[0]?.y0 - touch[0]?.y1 < -SCREENSENSITIVITY)) {
            if (player.currentAnimation != "link_walk_down") {
                player.currentAnimation = "link_walk_down";
            }

            if (player.currentCollision.down) {
                move("up", ticker, 0.05);
            } else {
                move("down", ticker);
            }
        } else if ([...keys].filter(v => up.includes(v)).length || ( touch[0]?.y0 - touch[0]?.y1 > SCREENSENSITIVITY)) {
            if (player.currentAnimation != "link_walk_up") {
                player.currentAnimation = "link_walk_up";
            }

            if (player.currentCollision.up) {
                move("down", ticker, 0.05);
            } else {
                move("up", ticker);
            }
        }
        
        if ([...keys].filter(v => right.includes(v)).length || ( touch[0]?.x0 - touch[0]?.x1 < -SCREENSENSITIVITY)) {
            if (player.currentAnimation != "link_walk_right") {
                player.currentAnimation = "link_walk_right";
            }

            if (player.currentCollision.right) {
                move("left", ticker, 0.05);
            } else {
                move("right", ticker);
            }
        } else if ([...keys].filter(v => left.includes(v)).length || ( touch[0]?.x0 - touch[0]?.x1 > SCREENSENSITIVITY)) {
            if (player.currentAnimation != "link_walk_left") {
                player.currentAnimation = "link_walk_left";
            }

            if (player.currentCollision.left) {
                move("right", ticker, 0.05);
            } else {
                move("left", ticker);
            }
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

    handleCollision();
});

async function SpriteFrom(url) {
    await PIXI.Assets.load(url);
    return PIXI.Sprite.from(url);
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
    animation.animationSpeed = 1/4;
    animation.play();

    return animation;
}

function initMap() {
    let scale = 1.3;
    maptile.scale.set(scale,scale);
    map.x = -5;
    map.y = -250;
    map.zIndex = -10;
    
    player.x = 300;
    player.y = 430;
}

function initPlayer() {    
    player.currentAnimation = "link_idle_down";
    player.currentCollision = {
        up: false,
        down: false,
        left: false,
        right: false
    };

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

    
    animations.link_idle_down = link_idle_down;
    animations.link_idle_right = link_idle_right;
    animations.link_idle_up = link_idle_up;
    animations.link_idle_left = link_idle_left;
    animations.link_walk_down = link_walk_down;
    animations.link_walk_right = link_walk_right;
    animations.link_walk_left = link_walk_left;
    animations.link_walk_up = link_walk_up;
}

const cameraLimit = {
    "down": app.screen.height / 2,
    "up": map.height - (app.screen.height / 2) + player.height,
    "right": app.screen.width / 2,
    "left": map.width - (app.screen.width / 2) - player.width
};

function move(direction, ticker, modifier = 1) {
    if (direction == "down") {
        if (map.y > app.screen.height - map.height && player.y >= cameraLimit.down) {
            map.y -= MOVESPEED * ticker.deltaTime * modifier;
        }
        if (player.y < map.height - player.height) {
            player.y += MOVESPEED * ticker.deltaTime * modifier;
        }
    }

    if (direction == "up") {
        if (map.y < 0 && player.y <= cameraLimit.up) {
            map.y += MOVESPEED * ticker.deltaTime * modifier;
        }
        if (player.y > 0) {
            player.y -= MOVESPEED * ticker.deltaTime * modifier;
        }
    }

    if (direction == "right") {
        if (map.x > app.screen.width - map.width && player.x >= cameraLimit.right) {
            map.x -= MOVESPEED * ticker.deltaTime * modifier;
        }
        if (player.x < map.width - player.width) {
            player.x += MOVESPEED * ticker.deltaTime * modifier;
        }
    }

    if (direction == "left") {
        if (map.x < 0 && player.x <= cameraLimit.left) {
            map.x += MOVESPEED * ticker.deltaTime * modifier;
        }
        if (player.x > 0) {
            player.x -= MOVESPEED * ticker.deltaTime * modifier;
        }
    }
}

function createCollider(x, y, w, h, label) {
    var newCollider = new PIXI.Graphics().rect(0,0,w,h).fill(0xffffff);
    newCollider.x = x;
    newCollider.y = y;
    newCollider.zIndex = DEBUG ? 999 : -999;
    newCollider.label = label;
    colliders.push(newCollider);
    map.addChild(newCollider);
}

function handleCollision() {
    let p = {
        x: player.x,
        y: player.y,
        w: player.width,
        h: player.height
    };
    let c = {}

    let hadCollision = false;

    for (let col of colliders) {
        c = {
            label: col.label,
            x: col.x,
            y: col.y,
            w: col.width,
            h: col.height
        };

        if (
            p.x < (c.x + c.w)
            && (p.x + p.w) > c.x
            && p.y < (c.y + c.h)
            && (p.y + p.h) > c.y
        ) {
            player.currentCollision.left = !hadCollision ? ((p.x + p.w) > (c.x + c.w)) : player.currentCollision.left || ((p.x + p.w) > (c.x + c.w));
            player.currentCollision.right = !hadCollision ? (p.x < c.x) : player.currentCollision.right || (p.x < c.x);
            player.currentCollision.up = !hadCollision ? ((p.y + p.h) > (c.y + c.h)) : player.currentCollision.up || ((p.y + p.h) > (c.y + c.h));
            player.currentCollision.down = !hadCollision ? (p.y < c.y) : player.currentCollision.down || (p.y < c.y);
            hadCollision = true;
        } else if (!hadCollision) {
            player.currentCollision = {
                up: false,
                down: false,
                left: false,
                right: false
            };
        }
    }
}