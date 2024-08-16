//Set state default values here;

var camera = { position: {x: 0, y: 0, z: 0} };
var deltaTime = 0;
var jolt = null;
var level = null;
var networking = {players: {}};
var physicsRemoveQueue = [];
var physicsSystem = null;
var physicsWorld = null;
var players = [];
var serverInputs = [];
var socket = null;
var time = Date.now();

export default {
    camera: camera,
    deltaTime: deltaTime,
    jolt: jolt,
    level: level,
    networking: networking,
    physicsRemoveQueue: physicsRemoveQueue,
    physicsSystem: physicsSystem,
    physicsWorld: physicsWorld,
    players: players,
    serverInputs: serverInputs,
    socket: socket,
    time: time
};