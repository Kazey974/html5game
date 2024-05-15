const atlasData = {
    frames: {
        enemy1: {
            frame: { x: 0, y:0, w:32, h:32 },
            sourceSize: { w: 32, h: 32 },
            spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }
        },
        enemy2: {
            frame: { x: 32, y:0, w:32, h:32 },
            sourceSize: { w: 32, h: 32 },
            spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }
        },
    },
    meta: {
        image: 'assets/sprites/link.png',
        format: 'RGBA8888',
        size: { w: 128, h: 32 },
        scale: 1
    },
    animations: {
        enemy: ['enemy1','enemy2'] //array of frames by name
    }
}

// Create the SpriteSheet from data and image
const spritesheet = new PIXI.Spritesheet(
    PIXI.Texture.from(atlasData.meta.image),
    atlasData
);

// Generate all the Textures asynchronously
await spritesheet.parse();

// spritesheet is ready to use!
const anim = new AnimatedSprite(spritesheet.animations.enemy);

const sprites = {
    'link': await initSprite("assets/sprites/link.png"),
};

const animations = {
    'link': await initAnim("assets/sprites/link.json", "link.png"),
}

async function initSprite(url) {
    await PIXI.Assets.load(url);
    return PIXI.Sprite.from(url);
}

async function initAnim(json, sheet) {
    let file = await fetch("./" + json).then(
        (response) => { return response.json()}
    )

    console.log(parseJSON(file, sheet));

    // sheet = await PIXI.Assets.load(sheet);
    // anim = new Spritesheet(
    //     Texture.from(sheet),
    //     data
    // );

    // await anim.parse();

    // return new AnimatedSprite()
}

function parseJSON(json, sheet) {
    let output = {};
    // let width = json.frames.sheet.frame.w;
    // let height = json.frames.sheet.frame.h;
    // const frames = new Set();

    // for (let tag of json.meta.frameTags) {
    //     let frames = [];
    //     let animation = [];

    //     for (let i = tag.from; i < tag.to; i ++) {
    //         frames.add({
    //             i: {
    //                 frame: { x: width * i, y: 0, w: width, l: height },
    //                 sourceSize: { w: width, h: height },
    //                 spriteSourceSize: { x: 0, y: 0, w: width, h: height },
    //             }
    //         })
    //     }
    // }

    return output;
}

export {sprites, animations, anim};