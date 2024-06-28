const { Server } = require("socket.io");

const gameServer = (server) => {
    console.log("//SERVER START");
    const io = new Server(server);
    const objectList = {
        players: {}
    };

    io.on("connection", (socket) => {
        console.log("IO - user connected : " + socket.id, Object.keys(objectList.players).length);

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
        let position = {x: Math.random() * 1, y: Math.random() * 1};
        let isValid = false;

        while(!isValid) {
            isValid = true;
            for (let id in objectList.players) {
                let player = objectList.players[id];
                let diff = Math.abs(position.x - player.position.x) + Math.abs(position.y - player.position.y);
                if (diff <= 0.1) {
                    isValid = false;
                }
            }

            if (!isValid) {
                position.y -= 0.1;
            }
        }

        let newPlayer = {
            id: socket.id,
            position: position,
            color: Math.random() * 0xffffff
        };
    
        io.emit("initPlayer", newPlayer);
        io.to(socket.id).emit("initObjects", objectList.players);
    
        objectList.players[socket.id] = {};
        Object.assign(objectList.players[socket.id],newPlayer);
    }
};

module.exports = gameServer;