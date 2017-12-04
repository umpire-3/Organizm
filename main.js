const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Scene = require('./Scene');
const Player = require('./Player');
const { setGameLoop } = require('node-gameloop');
const three = require('three');


const scene = new Scene();
const fps = 30;
const port = 80;

io.on('connection', socket => {

	let player = new Player();
	scene.addPlayer(socket.id, player);

	socket.emit('init', {
	    radius: player.body.radius,
        position: player.body.position,
        color: player.color
    });

	socket.on('move', force => {
	    player.move(force);
    });
	socket.on('disconnect', () => {
	    scene.removePlayer(socket.id);
    });
});

setGameLoop(dt => {
	scene.update(dt);

	for (let id in io.sockets.connected) {
	    let socket = io.sockets.connected[id],
            player = scene.getPlayer(id);

        socket.emit('update', {
            position: player.body.position
        });
    }

}, 1000/fps);

app.get('/', (_, res) => res.sendFile(__dirname + '/public/index.html'));
app.use(express.static('public'));

http.listen(port, () => {
  console.log(`Server started at localhost:${port}!`);
});
