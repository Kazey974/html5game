const express = require('express');
const app = express();

app.use('/public', express.static(__dirname + '/public'));

app.use('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(3000);