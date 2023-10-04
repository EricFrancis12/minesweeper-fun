

const board = document.querySelector('.board');

let firstClickOccured = false;

const numRows = () => parseInt(document.querySelector('#num-rows').value);
const numCols = () => parseInt(document.querySelector('#num-cols').value);
const numBombs = () => parseInt(document.querySelector('#num-bombs').value);

function setCss() {
    // Set the CSS variables to control the number of rows and columns
    document.documentElement.style.setProperty('--numRows', numRows());
    document.documentElement.style.setProperty('--numCols', numCols());
}

function makeBoard() {
    firstClickOccured = false;
    let html = '';

    for (let i = 1; i <= numRows(); i++) { // Adjust the loop based on numRows
        for (let j = 1; j <= numCols(); j++) { // Adjust the loop based on numCols
            html += `<div class="square" data-row="${i}" data-col="${j}" data-squarenumber="${i * j}"></div>`
        }
    }

    board.innerHTML = html;

    const squares = Array.from(document.querySelectorAll('.square'));
    squares.forEach(square => {
        square.removeEventListener('click', handleLeftClick);
        square.removeEventListener('contextmenu', handleRightClick);

        square.addEventListener('click', handleLeftClick);
        square.addEventListener('contextmenu', handleRightClick);
    });

    setCss();
    setRemaining();
    gameOver.status = false;
}
makeBoard();

function addBombs(firstClickedSquare) {
    {
        const bombSquares = [];
        const squares = Array.from(document.querySelectorAll('.square')).filter(square => square !== firstClickedSquare);

        for (let k = 1; k <= numBombs(); k++) {
            const randomSquareIndex = randomIntBetween(0, squares.length);
            bombSquares.push(squares.splice(randomSquareIndex, 1)[0]);
        }

        bombSquares.forEach(square => {
            square.classList.add('bomb');
        });
    }

    {
        const squares = Array.from(document.querySelectorAll('.square'));
        squares.forEach(square => {
            if (square.classList.contains('bomb')) {
                square.innerHTML = '<span>💣</span>';
                return;
            }

            let squareNumber = 0;

            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const targetSquare = document.querySelector(`.square[data-row="${row - i}"][data-col="${col - j}"]`);
                    if (targetSquare?.classList.contains('bomb')) {
                        squareNumber++;
                    }
                }
            }

            let color = '';
            switch (squareNumber) {
                case 1: color = 'blue'; break;
                case 2: color = 'green'; break;
                case 3: color = 'red'; break;
                case 4: color = 'darkblue'; break;
                case 5: color = 'brown'; break;
                case 6: color = 'cyan'; break;
                case 7: color = 'black'; break;
                case 8: color = 'grey'; break;
            }

            square.dataset.number = squareNumber;
            square.innerHTML = squareNumber !== 0 ? `<span style="color:${color}">${squareNumber}</span>` : '';
        });
    }
}

function handleRightClick(e) {
    e.preventDefault();

    if (gameOver.status === true) return;

    if (handleRightClick.available === true) {
        handleRightClick.available = false;
        setTimeout(() => {
            handleRightClick.available = true;
        }, 300);

        e.target.classList.toggle('flag');
        if (e.target.classList.contains('flag')) {
            e.target.innerText = '🚩';
        } else {
            e.target.innerText = '';
        }

        setRemaining();

        checkIfWin();
    }
}
handleRightClick.available = true;

function handleLeftClick(e) {
    if (gameOver.status === true) return;

    if (!firstClickOccured) {
        firstClickOccured = true;
        addBombs(e.target);
        setRemaining();
    }

    if (e.target.classList.contains('flag')) {
        return;
    } else if (e.target.classList.contains('bomb')) {
        return gameOver(e.target);
    } else if (e.target.dataset.number && e.target.dataset.number !== '0') {
        handleNumberSquareClick(e.target);
    } else {
        handleBlankSquareClick(e.target);
    }

    checkIfWin();
}

function handleNumberSquareClick(square) {
    square.classList.add('revealed');
}

function handleBlankSquareClick(square) {
    if (square.classList.contains('revealed') || square.classList.contains('flag')) return;

    square.classList.add('revealed');

    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;

            const adjacentSquare = document.querySelector(`.square[data-row="${row - i}"][data-col="${col - j}"]`);

            if (parseInt(adjacentSquare?.dataset?.number) > 0) {
                adjacentSquare.classList.add('revealed');
            } else if (adjacentSquare) {
                handleBlankSquareClick(adjacentSquare);
            }
        }
    }
}

function setRemaining() {
    const remaining = document.querySelector('#remaining');
    const numFlags = Array.from(document.querySelectorAll('.flag')).length;
    remaining.innerText = (numBombs() - numFlags).toString();
}

function checkIfWin() {
    const bombs = Array.from(document.querySelectorAll('.bomb'));
    const flaggedBombs = bombs.filter(bomb => bomb.classList.contains('flag'));

    const revealedSquares = Array.from(document.querySelectorAll('.revealed'));

    if (flaggedBombs.length === bombs.length && revealedSquares.length === (numRows() * numCols() - flaggedBombs.length)) {
        setTimeout(() => alert('Congratulations! You Won!'));
    }
}

function gameOver(square) {
    square.classList.add('revealed');
    gameOver.status = true;

    setTimeout(() => {
        alert('Game Over!');

        setTimeout(() => makeBoard(), 0);
    }, 0);
}

function randomIntBetween(min, max) {
    // Ensure that min and max are integers
    min = Math.ceil(min);
    max = Math.floor(max);

    // Generate a random integer between min (inclusive) and max (exclusive)
    return Math.floor(Math.random() * (max - min)) + min;
}

document.querySelector('#num-rows').addEventListener('input', makeBoard);
document.querySelector('#num-cols').addEventListener('input', makeBoard);
document.querySelector('#num-bombs').addEventListener('input', makeBoard);

document.querySelector('.reset-button').addEventListener('click', makeBoard);
