const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Scene = require('./Scene');
const Player = require('./Player');
const { setGameLoop } = require('node-gameloop');


const scene = new Scene();
const fps = 30;
const port = 27015;

scene.onDeath(id => io.emit('player left', id));
scene.onFeed((id, delta, piece) => io.emit('feed', { id, delta, piece }));

io.on('connection', socket => {
    console.log(`Player "${socket.id}" connected`);

	let player = new Player();

	socket.emit('init', {
		playersData: {
            thisPlayerData: player.getData(),
		    otherPlayersData: scene.getPlayersData()
        },
        feedData: scene.getFeedData()
	});

    scene.addPlayer(socket.id, player);

	socket.broadcast.emit('player joined', {
	    id: socket.id,
        playerData: player.getData()
    });

	socket.on('update', force => {
	    player.move(force);
    });
	socket.on('disconnect', () => {
        console.log(`Player "${socket.id}" disconnected`);
	    scene.removePlayer(socket.id);
	    socket.broadcast.emit('player left', socket.id);
    });
});

setGameLoop(dt => {
	scene.update(dt);

	io.emit('update', Array.from(
		scene.players,
        ([id, player]) => [
        	id,
			{
				position: player.position
			}
		]
	));

}, 1000/fps);

app.get('/', (_, res) => res.sendFile(__dirname + '/public/index.html'));
app.use(express.static('public'));

http.listen(port, () => {
  console.log(`Server started at localhost:${port}!`);
});
