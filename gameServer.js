const { Server } = require("socket.io");

const gameServer = (server) => {
    console.log("//SERVER START");
    const io = new Server(server);
    const objectList = {
        players: {}
    };

    io.on("connection", (socket) => {
        console.log("IO - user connected : " + socket.id);

        socket.on("disconnect", () => {
            console.log("IO - user disconnected : " + socket.id);
            io.emit("removePlayer", socket.id);
            delete objectList.players[socket.id];
        });

        initPlayer(socket);
    
        socket.on("inputs", (inputs) => {
            console.log("Inputs received : " + inputs.join());
        });
    });

    function initPlayer(socket) {
        let newPlayer = {
            id: socket.id,
            position: {x: Math.random() * 100, y: Math.random() * 100},
            color: Math.random() * 0xffffff
        };
    
        io.emit("initPlayer", newPlayer);
        io.to(socket.id).emit("initObjects", objectList.players);
    
        objectList.players[socket.id] = {};
        Object.assign(objectList.players[socket.id],newPlayer);
    }
};

module.exports = gameServer;