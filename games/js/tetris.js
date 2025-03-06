class Tetris {
    constructor(gameCanvas, nextCanvas) {
        this.gameCanvas = gameCanvas;
        this.nextCanvas = nextCanvas;
        this.ctx = gameCanvas.getContext('2d');
        this.nextCtx = nextCanvas.getContext('2d');
        
        this.blockSize = 30;
        this.cols = gameCanvas.width / this.blockSize;
        this.rows = gameCanvas.height / this.blockSize;
        
        // 定义方块形状
        this.shapes = {
            I: [[1, 1, 1, 1]],
            J: [[1, 0, 0], [1, 1, 1]],
            L: [[0, 0, 1], [1, 1, 1]],
            O: [[1, 1], [1, 1]],
            S: [[0, 1, 1], [1, 1, 0]],
            T: [[0, 1, 0], [1, 1, 1]],
            Z: [[1, 1, 0], [0, 1, 1]]
        };
        
        // 定义颜色
        this.colors = {
            I: '#00f0f0',
            J: '#0000f0',
            L: '#f0a000',
            O: '#f0f000',
            S: '#00f000',
            T: '#a000f0',
            Z: '#f00000'
        };
        
        this.reset();
    }

    reset() {
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.dropInterval = 1000;
        this.lastDrop = 0;
        this.currentPiece = this.getRandomPiece();
        this.nextPiece = this.getRandomPiece();
        this.piecePosition = {
            x: Math.floor(this.cols / 2) - Math.floor(this.currentPiece.shape[0].length / 2),
            y: 0
        };
        
        this.updateScore();
        this.draw();
        this.drawNext();
    }

    getRandomPiece() {
        const pieces = Object.keys(this.shapes);
        const type = pieces[Math.floor(Math.random() * pieces.length)];
        return {
            type: type,
            shape: this.shapes[type],
            color: this.colors[type]
        };
    }

    rotate(piece) {
        const newShape = Array(piece.shape[0].length).fill()
            .map(() => Array(piece.shape.length).fill(0));
        
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                newShape[x][piece.shape.length - 1 - y] = piece.shape[y][x];
            }
        }
        
        return {
            type: piece.type,
            shape: newShape,
            color: piece.color
        };
    }

    isValidMove(piece, x, y) {
        return piece.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let newX = x + dx;
                let newY = y + dy;
                return (
                    value === 0 ||
                    (newX >= 0 &&
                     newX < this.cols &&
                     newY < this.rows &&
                     newY >= 0 &&
                     !this.grid[newY][newX])
                );
            });
        });
    }

    merge() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const newY = y + this.piecePosition.y;
                    const newX = x + this.piecePosition.x;
                    if (newY >= 0) {
                        this.grid[newY][newX] = this.currentPiece.color;
                    }
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += [40, 100, 300, 1200][linesCleared - 1] * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateScore();
        }
    }

    moveDown() {
        this.piecePosition.y++;
        if (!this.isValidMove(this.currentPiece, this.piecePosition.x, this.piecePosition.y)) {
            this.piecePosition.y--;
            this.merge();
            this.clearLines();
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.getRandomPiece();
            this.piecePosition = {
                x: Math.floor(this.cols / 2) - Math.floor(this.currentPiece.shape[0].length / 2),
                y: 0
            };
            
            if (!this.isValidMove(this.currentPiece, this.piecePosition.x, this.piecePosition.y)) {
                this.gameOver = true;
                return false;
            }
            this.drawNext();
        }
        return true;
    }

    hardDrop() {
        while (this.moveDown()) {}
    }

    moveLeft() {
        this.piecePosition.x--;
        if (!this.isValidMove(this.currentPiece, this.piecePosition.x, this.piecePosition.y)) {
            this.piecePosition.x++;
        }
    }

    moveRight() {
        this.piecePosition.x++;
        if (!this.isValidMove(this.currentPiece, this.piecePosition.x, this.piecePosition.y)) {
            this.piecePosition.x--;
        }
    }

    rotatePiece() {
        const rotated = this.rotate(this.currentPiece);
        if (this.isValidMove(rotated, this.piecePosition.x, this.piecePosition.y)) {
            this.currentPiece = rotated;
        }
    }

    update(time = 0) {
        if (this.gameOver || this.paused) return;

        if (time - this.lastDrop > this.dropInterval) {
            this.moveDown();
            this.lastDrop = time;
        }

        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        
        // 绘制网格
        this.grid.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color) {
                    this.drawBlock(this.ctx, x, y, color);
                }
            });
        });
        
        // 绘制当前方块
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawBlock(
                        this.ctx,
                        x + this.piecePosition.x,
                        y + this.piecePosition.y,
                        this.currentPiece.color
                    );
                }
            });
        });
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏结束!', this.gameCanvas.width / 2, this.gameCanvas.height / 2);
        }
    }

    drawNext() {
        this.nextCtx.fillStyle = '#000000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * this.blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * this.blockSize) / 2;
        
        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawBlock(
                        this.nextCtx,
                        x + offsetX / this.blockSize,
                        y + offsetY / this.blockSize,
                        this.nextPiece.color
                    );
                }
            });
        });
    }

    drawBlock(ctx, x, y, color) {
        const size = this.blockSize - 1;
        const px = x * this.blockSize;
        const py = y * this.blockSize;
        
        // 主体
        ctx.fillStyle = color;
        ctx.fillRect(px, py, size, size);
        
        // 高光
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px, py, size / 8, size);
        ctx.fillRect(px, py, size, size / 8);
        
        // 阴影
        ctx.fillStyle = '#000000';
        ctx.fillRect(px + size - size / 8, py, size / 8, size);
        ctx.fillRect(px, py + size - size / 8, size, size / 8);
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
}

// 游戏初始化
window.onload = () => {
    const gameCanvas = document.getElementById('gameCanvas');
    const nextCanvas = document.getElementById('nextCanvas');
    const game = new Tetris(gameCanvas, nextCanvas);
    
    // 控制按钮
    document.getElementById('startBtn').addEventListener('click', () => {
        game.reset();
        game.update();
    });
    
    document.getElementById('pauseBtn').addEventListener('click', () => {
        game.paused = !game.paused;
        document.getElementById('pauseBtn').textContent = game.paused ? '继续' : '暂停';
        if (!game.paused) {
            game.update();
        }
    });
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (game.gameOver) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                game.moveLeft();
                break;
            case 'ArrowRight':
                game.moveRight();
                break;
            case 'ArrowDown':
                game.moveDown();
                break;
            case 'ArrowUp':
                game.rotatePiece();
                break;
            case ' ':
                game.hardDrop();
                break;
        }
        game.draw();
    });
}; 