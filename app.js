const express = require('express'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

const app = express();

app.use("/html5game", express.static(path.join(__dirname, 'public')));

app.listen(3000);