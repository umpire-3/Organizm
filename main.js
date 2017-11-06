const Scene = require('./Scene').Scene;
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const three = require('three');

var app = express();
var scene = new Scene();

var server = http.createServer(app);
var websocket = new WebSocket.Server({server});
var loopInterval = 20;
var port = 3000;

websocket.on('connection', client => {
	let data = [];
	for (let body of scene.bodies) {
		data.push(body.radius);
	}

	client.send(JSON.stringify({
		command: 'init',
		data
	}));

	client.on('message', msg => {
        if (msg == 'disable') {
            scene.setGravity(new three.Vector3());
            console.log('---->>>> Print');
            client.send(JSON.stringify({
            	command: 'callback'
            }));
        }
        if(msg == 'gravity') {
            scene.setGravity(scene.gravity.negate());
            client.send(JSON.stringify({
            	command: 'callback'
            }));
        }
	});
});

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.use(express.static('public'));

setInterval(() => {
	scene.update(0.02);

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
