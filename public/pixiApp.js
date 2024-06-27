import game from "./game.js";
import state from "./modules/state.js";
import update from "./modules/update.js";

const app = new PIXI.Application();
await app.init({ resizeTo: window });
document.body.appendChild(app.canvas);
document.ontouchstart = goFullscreen;

state.elapsed = 0;
state.stage = app.stage;

app.ticker.add((ticker) => {
    state.elapsed += ticker.deltaTime;
    state.deltaTime = ticker.deltaTime;
	update.proc();
});

game.init();

function goFullscreen() {
    if (app.canvas.requestFullscreen) {
		app.canvas.requestFullscreen();
	} else if (app.canvas.mozRequestFullScreen) {
		app.canvas.mozRequestFullScreen();
	} else if (app.canvas.webkitRequestFullScreen) {
		app.canvas.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	}
}