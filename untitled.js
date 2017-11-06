var Scene = require('./Scene').Scene;
var express = require('express');
var http = require('http');
var WebSocket = require('ws');

var app = express();
console.log(require('./Scene'));
console.log(require('./Body'));
var scene = new Scene();

var server = http.createServer(app);
var websocket = new WebSocket.Server({server});
var loopInterval = 2000;

websocket.on('connection', (ws, req) => {
	console.log('Connection');
	ws.send('{"command": "init","data": [10, 20 , 30]}');
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use('/static', express.static('public'));

server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

setInterval(function ping() {
	websocket.clients.forEach(function each(ws) {
		console.log('Next interval loop.');
		if (ws.isAlive === false) return ws.terminate();
		var outputMessage = [];
		for (var body of scene.bodies) {
			var ball = [
				body.position.x,
				body.position.y,
				body.position.z
			];
			outputMessage.push(ball);
		}
		ws.send(JSON.stringify(outputMessage));
	    //ws.isAlive = false;
	    //ws.ping('', false, true);
	});
}, loopInterval);