export class Gameobject {
    constructor(name, x = 0, y = 0) {
        this.name = name;

        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;
        
        return this;
    }

    addTo(parent) {
        parent.addChild(this.container);

        return this;
    }

    addChild(child) {
        this.container.addChild(child);

        return this;
    }
}