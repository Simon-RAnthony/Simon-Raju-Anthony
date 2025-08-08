const socket = io();
let board = null;
let game = null;
let currentRoom = null;

function createRoom() {
    const roomCode = document.getElementById('roomCode').value;
    socket.emit('createRoom', roomCode);
}

function joinRoom() {
    const roomCode = document.getElementById('roomCode').value;
    socket.emit('joinRoom', roomCode);
    currentRoom = roomCode;
}

socket.on('roomCreated', (roomCode) => {
    alert('Room created: ' + roomCode);
    currentRoom = roomCode;
});

socket.on('startGame', () => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('board').style.display = 'block';
    game = new Chess();
    board = Chessboard('board', {
        draggable: true,
        position: 'start',
        onDrop: handleMove
    });
});

function handleMove(source, target) {
    const move = { from: source, to: target, promotion: 'q' };
    socket.emit('move', { roomCode: currentRoom, move });
}

socket.on('move', (move) => {
    game.move(move);
    board.position(game.fen());
});

socket.on('gameOver', (result) => {
    alert('Game over: ' + result);
});

socket.on('errorMsg', (msg) => {
    alert(msg);
});
