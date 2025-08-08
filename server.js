const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { Chess } = require('chess.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

let rooms = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createRoom', (roomCode) => {
        rooms[roomCode] = { players: [], game: new Chess() };
        rooms[roomCode].players.push(socket.id);
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
    });

    socket.on('joinRoom', (roomCode) => {
        if (rooms[roomCode] && rooms[roomCode].players.length < 2) {
            rooms[roomCode].players.push(socket.id);
            socket.join(roomCode);
            io.to(roomCode).emit('startGame');
        } else {
            socket.emit('errorMsg', 'Room full or does not exist');
        }
    });

    socket.on('move', ({ roomCode, move }) => {
        const room = rooms[roomCode];
        if (room) {
            const result = room.game.move(move);
            if (result) {
                io.to(roomCode).emit('move', result);
                if (room.game.isGameOver()) {
                    io.to(roomCode).emit('gameOver', room.game.result());
                }
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
