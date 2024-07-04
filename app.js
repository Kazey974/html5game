import express from "express";
import http from "http";
import path from 'path';
import { fileURLToPath } from 'url';
import { gameServer } from "./gameServer.js";

const app = express();
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/html5game", express.static(path.join(__dirname, "public")));

gameServer(server);

server.listen(3000);