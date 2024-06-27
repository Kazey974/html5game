const express = require('express'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000);