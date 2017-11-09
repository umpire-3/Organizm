const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const { Scene }  = require('./Scene');
const { setGameLoop } = require('node-gameloop');
const three = require('three');


const scene = new Scene();
const fps = 30;
const port = 80;

io.on('connection', socket => {
	let data = [];
	for (let body of scene.bodies) {
		data.push(body.radius);
	}

	socket.emit('init', data);

	socket.on('disable', msg => {
        scene.setGravity(new three.Vector3());
        socket.emit('callback');
	});

	socket.on('gravity', msg => {
        scene.setGravity(scene.gravity.negate());
        socket.emit('callback');
	});
});

setGameLoop(dt => {
	scene.update(dt);

	let data = [];
	for (let body of scene.bodies) {
		let ball = [
			body.position.x,
			body.position.y,
			body.position.z
		];
		data.push(ball);
	}

	io.emit('update', data);

}, 1000/fps);

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.use(express.static('public'));

http.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
