const express = require('express');
const http = require('http');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server);
let players;
let joined = true;

app.use(express.static(__dirname + '/'));

let games = Array(100);
for (let i = 0; i < 100; i++) {
	games[i] = { players: 0, pid: [ 0, 0 ] };
}

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
	var color;
	var playerId = Math.floor(Math.random() * 100 + 1);

	console.log(playerId + ' connected');

	socket.on('joined', function(roomId) {
		if (games[roomId].players < 2) {
			games[roomId].players++;
			games[roomId].pid[games[roomId].players - 1] = playerId;
		} else {
			socket.emit('full', roomId);
			return;
		}

		console.log(games[roomId]);
		players = games[roomId].players;

		if (players == 2) color = 'black';
		else color = 'white';

		socket.emit('player', { playerId, players, color, roomId });
	});

	socket.on('move', function(msg) {
		socket.broadcast.emit('move', msg);
	});

	socket.on('play', function(msg) {
		socket.broadcast.emit('play', msg);
		console.log('ready ' + msg);
	});

	socket.on('disconnect', function() {
		for (let i = 0; i < 100; i++) {
			if (games[i].pid[0] == playerId || games[i].pid[1] == playerId) games[i].players--;
		}
		console.log(playerId + ' disconnected');
	});
});

const SERVER_PORT = process.env.PORT || 3333;

server.listen(SERVER_PORT, () => {
	console.log('Server started on http://localhost:' + SERVER_PORT);
});
