var Scene = require('./Scene').Scene;
var express = require('express');
var http = require('http');
var WebSocket = require('ws');

var app = express();
var scene = new Scene();

var server = http.createServer(app);
var websocket = new WebSocket.Server({server});
var loopInterval = 20;
var port = 3000;

websocket.on('connection', (client, req) => {
	let data = [];
	for (let body of scene.bodies) {
		data.push(body.radius);
	}

	client.send(JSON.stringify({
		command: 'init',
		data
	}));
});

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.use(express.static('public'));

setInterval(() => {
	scene.update(loopInterval);

	let data = [];
	for (let body of scene.bodies) {
		let ball = [
			body.position.x,
			body.position.y,
			body.position.z
		];
		data.push(ball);
	}
	let outputMessage = JSON.stringify({
		command: 'update',
		data
	});

	websocket.clients.forEach(client => {
		if (client.isAlive === false) return client.terminate();
		client.send(outputMessage);
	    //client.isAlive = false;
	    //client.ping('', false, true);
	});
}, loopInterval);

server.listen(port, function () {
  console.log(`Listening on port ${port}!`);
});
