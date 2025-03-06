class Minesweeper {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.difficulties = {
            easy: { size: 9, mines: 10 },
            medium: { size: 16, mines: 40 },
            hard: { size: 16, mines: 99 }
        };
        this.setDifficulty('easy');
        
        // 绑定事件
        this.canvas.addEventListener('click', this.handleLeftClick.bind(this));
        this.canvas.addEventListener('contextmenu', this.handleRightClick.bind(this));
        
        // 像素风格颜色
        this.colors = {
            covered: '#a0a0a0',
            uncovered: '#e0e0e0',
            border: '#ffffff',
            borderShadow: '#808080',
            mine: '#ff0000',
            flag: '#ff0000',
            numbers: ['#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080']
        };
    }

    setDifficulty(level) {
        const config = this.difficulties[level];
        this.size = config.size;
        this.mineCount = config.mines;
        this.cellSize = Math.floor(this.canvas.width / this.size);
        this.reset();
    }

    reset() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0
        }));
        this.minesLeft = this.mineCount;
        this.gameOver = false;
        this.firstClick = true;
        this.startTime = null;
        this.timer = null;
        
        document.getElementById('minesLeft').textContent = this.minesLeft;
        document.getElementById('timer').textContent = '0';
        
        this.draw();
    }

    startTimer() {
        this.startTime = Date.now();
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            const seconds = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('timer').textContent = seconds;
        }, 1000);
    }

    placeMines(firstX, firstY) {
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const x = Math.floor(Math.random() * this.size);
            const y = Math.floor(Math.random() * this.size);
            
            // 避免在第一次点击的位置及其周围放置地雷
            if (Math.abs(x - firstX) <= 1 && Math.abs(y - firstY) <= 1) continue;
            
            if (!this.board[y][x].isMine) {
                this.board[y][x].isMine = true;
                minesPlaced++;
                
                // 更新周围方块的地雷计数
                this.forEachNeighbor(x, y, (nx, ny) => {
                    this.board[ny][nx].neighborMines++;
                });
            }
        }
    }

    forEachNeighbor(x, y, callback) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                    callback(nx, ny);
                }
            }
        }
    }

    handleLeftClick(event) {
        if (this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / this.cellSize);
        const y = Math.floor((event.clientY - rect.top) / this.cellSize);
        
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
            if (this.firstClick) {
                this.firstClick = false;
                this.placeMines(x, y);
                this.startTimer();
            }
            
            this.revealCell(x, y);
            this.draw();
            this.checkWin();
        }
    }

    handleRightClick(event) {
        event.preventDefault();
        if (this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / this.cellSize);
        const y = Math.floor((event.clientY - rect.top) / this.cellSize);
        
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
            const cell = this.board[y][x];
            if (!cell.isRevealed) {
                cell.isFlagged = !cell.isFlagged;
                this.minesLeft += cell.isFlagged ? -1 : 1;
                document.getElementById('minesLeft').textContent = this.minesLeft;
                this.draw();
                this.checkWin();
            }
        }
    }

    revealCell(x, y) {
        const cell = this.board[y][x];
        if (cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        
        if (cell.isMine) {
            this.gameOver = true;
            this.revealAllMines();
            clearInterval(this.timer);
            setTimeout(() => alert('游戏结束！'), 100);
            return;
        }
        
        if (cell.neighborMines === 0) {
            this.forEachNeighbor(x, y, (nx, ny) => {
                this.revealCell(nx, ny);
            });
        }
    }

    revealAllMines() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.board[y][x].isMine) {
                    this.board[y][x].isRevealed = true;
                }
            }
        }
        this.draw();
    }

    checkWin() {
        let win = true;
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = this.board[y][x];
                if (!cell.isMine && !cell.isRevealed) {
                    win = false;
                    break;
                }
            }
        }
        
        if (win) {
            this.gameOver = true;
            clearInterval(this.timer);
            setTimeout(() => alert('恭喜你赢了！'), 100);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = this.board[y][x];
                const px = x * this.cellSize;
                const py = y * this.cellSize;
                
                // 绘制方块
                if (!cell.isRevealed) {
                    // 未揭开的方块
                    this.ctx.fillStyle = this.colors.covered;
                    this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                    
                    // 3D效果
                    this.ctx.fillStyle = this.colors.border;
                    this.ctx.fillRect(px, py, this.cellSize - 1, 1);
                    this.ctx.fillRect(px, py, 1, this.cellSize - 1);
                    
                    this.ctx.fillStyle = this.colors.borderShadow;
                    this.ctx.fillRect(px + this.cellSize - 1, py, 1, this.cellSize);
                    this.ctx.fillRect(px, py + this.cellSize - 1, this.cellSize, 1);
                    
                    if (cell.isFlagged) {
                        // 绘制旗帜
                        this.ctx.fillStyle = this.colors.flag;
                        this.ctx.fillRect(px + this.cellSize/3, py + this.cellSize/4, 2, this.cellSize/2);
                        this.ctx.fillRect(px + this.cellSize/3, py + this.cellSize/4, this.cellSize/3, this.cellSize/4);
                    }
                } else {
                    // 已揭开的方块
                    this.ctx.fillStyle = this.colors.uncovered;
                    this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                    
                    if (cell.isMine) {
                        // 绘制地雷
                        this.ctx.fillStyle = this.colors.mine;
                        this.ctx.beginPath();
                        this.ctx.arc(px + this.cellSize/2, py + this.cellSize/2, this.cellSize/4, 0, Math.PI * 2);
                        this.ctx.fill();
                    } else if (cell.neighborMines > 0) {
                        // 绘制数字
                        this.ctx.fillStyle = this.colors.numbers[cell.neighborMines - 1];
                        this.ctx.font = `${this.cellSize/2}px "Press Start 2P"`;
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseline = 'middle';
                        this.ctx.fillText(
                            cell.neighborMines.toString(),
                            px + this.cellSize/2,
                            py + this.cellSize/2
                        );
                    }
                }
            }
        }
    }
}

// 游戏初始化
window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Minesweeper(canvas);
    
    // 重新开始按钮
    document.getElementById('restartBtn').addEventListener('click', () => {
        game.reset();
    });
    
    // 难度选择
    document.getElementById('difficultySelect').addEventListener('change', (e) => {
        game.setDifficulty(e.target.value);
    });
}; 