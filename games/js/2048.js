class Game2048 {
    constructor() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('2048_highScore')) || 0;
        this.gameBoard = document.getElementById('gameBoard');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.startBtn = document.getElementById('startBtn');
        
        this.init();
    }

    init() {
        this.startBtn.addEventListener('click', () => this.newGame());
        document.addEventListener('keydown', (e) => this.handleInput(e));
        this.highScoreElement.textContent = this.highScore;
        this.newGame();
    }

    newGame() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.addNewTile();
        this.addNewTile();
        this.updateDisplay();
    }

    addNewTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        if (emptyCells.length > 0) {
            const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    updateDisplay() {
        this.gameBoard.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                const value = this.board[i][j];
                if (value !== 0) {
                    tile.textContent = value;
                    tile.setAttribute('data-value', value);
                }
                this.gameBoard.appendChild(tile);
            }
        }
        this.scoreElement.textContent = this.score;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('2048_highScore', this.highScore);
        }
    }

    move(direction) {
        let moved = false;
        const rotatedBoard = this.rotateBoard(direction);
        
        for (let i = 0; i < 4; i++) {
            const row = rotatedBoard[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                    moved = true;
                }
            }
            const newRow = row.concat(Array(4 - row.length).fill(0));
            rotatedBoard[i] = newRow;
            if (row.length !== newRow.filter(cell => cell !== 0).length) {
                moved = true;
            }
        }

        this.board = this.rotateBoard(direction, rotatedBoard, true);
        return moved;
    }

    rotateBoard(direction, board = this.board, reverse = false) {
        const rotated = Array(4).fill().map(() => Array(4).fill(0));
        switch(direction) {
            case 'up':
                return reverse ? board : board;
            case 'right':
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        rotated[i][j] = reverse ? board[i][3-j] : board[i][3-j];
                    }
                }
                return rotated;
            case 'down':
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        rotated[i][j] = reverse ? board[3-i][j] : board[3-i][j];
                    }
                }
                return rotated;
            case 'left':
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        rotated[i][j] = reverse ? board[i][j] : board[i][j];
                    }
                }
                return rotated;
        }
    }

    handleInput(e) {
        let moved = false;
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                moved = this.move('up');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                moved = this.move('right');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                moved = this.move('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                moved = this.move('left');
                break;
        }

        if (moved) {
            this.addNewTile();
            this.updateDisplay();
            if (this.checkGameOver()) {
                alert('游戏结束！最终得分：' + this.score);
            } else if (this.checkWin()) {
                alert('恭喜获胜！你达到了2048！');
            }
        }
    }

    checkGameOver() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) return false;
                if (i < 3 && this.board[i][j] === this.board[i + 1][j]) return false;
                if (j < 3 && this.board[i][j] === this.board[i][j + 1]) return false;
            }
        }
        return true;
    }

    checkWin() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 2048) return true;
            }
        }
        return false;
    }
}

new Game2048(); 