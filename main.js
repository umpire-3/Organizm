const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Scene = require('./Scene');
const Player = require('./Player');
const { setGameLoop } = require('node-gameloop');


const scene = new Scene();
const fps = 30;
const port = 80;

io.on('connection', socket => {

	let player = new Player(),
		playersInfo = scene.getPlayersInfo();

	scene.addPlayer(socket.id, player);

	socket.emit('init', {
		playersInfo,
        id: socket.id,
		thisPlayerInfo: player.getInfo()
	});

	socket.broadcast.emit('player joined', {
	    id: socket.id,
        playerInfo: player.getInfo()
    });

	socket.on('move', force => {
	    player.move(force);
    });
	socket.on('disconnect', () => {
	    scene.removePlayer(socket.id);
	    socket.broadcast.emit('player left', socket.id);
    });
});

setGameLoop(dt => {
	scene.update(dt);

	io.emit('update', Array.from(
		scene.players,
        ([id, player]) => [id, {
			position: player.body.position
		}]
	));

}, 1000/fps);

app.get('/', (_, res) => res.sendFile(__dirname + '/public/index.html'));
app.use(express.static('public'));

http.listen(port, () => {
  console.log(`Server started at localhost:${port}!`);
});
