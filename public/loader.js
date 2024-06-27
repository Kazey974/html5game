const loader = {
    assets: [],
    assetAdd(...urls) {
        for (let url of urls) {
            let alias = url.match(/(\w*)\.\w*$/)[1];
            PIXI.Assets.add({
                alias: alias,
                src: url
            });

            this.assets.push(alias);
        }
    }
}

async function initLoader () {
    if (!loader.assets.length) {
        loader.assetAdd(
            "./assets/ships/placeholder.png"
        );

        await PIXI.Assets.load(loader.assets);
    }

    let sounds = [

    ];
    
    sounds.forEach((url) => {
            let alias = url.match(/(\w*)\.\w*$/)[1];
        PIXI.sound.add(alias, {url: url, preload: true});
    })

    return loader;
}

export default await initLoader();