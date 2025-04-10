//Set state default values here;

var camera = { position: {x: 0, y: 0, z: 0} };
var deltaTime = 0;
var level = null;
var networking = {players: {}};
var players = [];
var physics = null;
var serverInputs = [];
var socket = null;
var time = Date.now();
var deltaTime = 1;
var update = null;

export default {
    camera: camera,
    deltaTime: deltaTime,
    level: level,
    networking: networking,
    players: players,
    physics: physics,
    serverInputs: serverInputs,
    socket: socket,
    time: time,
    deltaTime: deltaTime,
    update: update
};