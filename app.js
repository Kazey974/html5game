import express from "express";
import http from "http";
import path from 'path';
import { fileURLToPath } from 'url';
import { gameServer } from "./gameServer.js";

const app = express();
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/spacegame", express.static(path.join(__dirname, "public")));
app.use("/cannon-es", express.static(path.join(__dirname, "node_modules/cannon-es/dist")));

gameServer(server);

server.listen(3000);