const express = require("express"),
    path = require("path"),
    http = require("http");

const app = express();
const server = http.createServer(app);
const gameServer = require("./gameServer")

app.use("/html5game", express.static(path.join(__dirname, "public")));

gameServer(server);

server.listen(3000);