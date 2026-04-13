// Doll House Decoration Game Script

const furniturePieces = document.querySelectorAll('.furniture');
const rooms = document.querySelectorAll('.room');
const startBtn = document.getElementById('start-btn');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');

let score = 0;
let gameStarted = false;

// Store initial furniture container to reset
const furnitureContainer = document.getElementById('furniture-pieces');

// Enable drag and drop handlers
furniturePieces.forEach(piece => {
    piece.addEventListener('dragstart', dragStart);
    piece.addEventListener('dragend', dragEnd);
});

rooms.forEach(room => {
    room.addEventListener('dragover', dragOver);
    room.addEventListener('drop', drop);
});

startBtn.addEventListener('click', startGame);

function startGame() {
    score = 0;
    gameStarted = true;
    scoreDisplay.textContent = `Score: ${score} / 3`;
    messageDisplay.textContent = '';
    startBtn.textContent = 'Restart Game';

    // Reset rooms and furniture
    rooms.forEach(room => {
        room.classList.remove('correct', 'incorrect');
        // Remove furniture inside rooms
        while (room.firstChild && !room.classList.contains('room-label') && room.firstChild.className !== 'room-label') {
            room.removeChild(room.firstChild);
        }
    });

    // Clear furniture container and add all pieces back
    furnitureContainer.innerHTML = '';
    ['sofa', 'bed', 'table'].forEach(id => {
        const piece = createFurniturePiece(id);
        furnitureContainer.appendChild(piece);
    });

    // Reattach drag events
    document.querySelectorAll('.furniture').forEach(piece => {
        piece.addEventListener('dragstart', dragStart);
        piece.addEventListener('dragend', dragEnd);
    });
}

function createFurniturePiece(id) {
    const names = { sofa: 'Sofa', bed: 'Bed', table: 'Table' };
    const roomsMap = { sofa: 'living-room', bed: 'bedroom', table: 'kitchen' };
    const div = document.createElement('div');
    div.className = 'furniture';
    div.id = id;
    div.textContent = names[id];
    div.setAttribute('draggable', 'true');
    div.dataset.room = roomsMap[id];
    return div;
}

function dragStart(e) {
    if (!gameStarted) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData('text/plain', e.target.id);
    e.target.classList.add('dragging');
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    if (!gameStarted) return;
    const pieceId = e.dataTransfer.getData('text/plain');
    const piece = document.getElementById(pieceId);
    const room = e.currentTarget;

    // If room already has a furniture, reject drop
    if (room.querySelector('.furniture')) {
        messageDisplay.textContent = 'This room already has a furniture piece!';
        return;
    }

    // Append piece to the room
    room.appendChild(piece);

    // Check correctness
    if (piece.dataset.room === room.id) {
        room.classList.add('correct');
        room.classList.remove('incorrect');
        messageDisplay.textContent = '';
        score++;
    } else {
        room.classList.add('incorrect');
        room.classList.remove('correct');
        messageDisplay.textContent = 'Oops! That furniture does not belong here.';
        // Decrease score if previously correct (handle correction)
        if (score > 0) score--;
    }

    updateScore();
    checkWin();
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score} / 3`;
}

function checkWin() {
    if (score === 3) {
        messageDisplay.textContent = 'Congratulations! You decorated the doll house perfectly!';
        gameStarted = false;
    }
}

// Initial setup: disable drag before start
furniturePieces.forEach(piece => {
    piece.setAttribute('draggable', 'false');
});

// When game starts, enable dragging
startBtn.addEventListener('click', () => {
    if (!gameStarted) {
        document.querySelectorAll('.furniture').forEach(piece => {
            piece.setAttribute('draggable', 'true');
        });
    }
});