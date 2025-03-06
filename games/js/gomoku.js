class Gomoku {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20; // 格子大小
        this.padding = 20; // 边距
        this.boardSize = 15; // 15x15的棋盘
        this.pieceRadius = 8; // 棋子半径

        // 计算实际格子大小以适应画布
        this.cellSize = (canvas.width - 2 * this.padding) / (this.boardSize - 1);
        
        this.reset();
        this.canvas.addEventListener('click', this.handleClick.bind(this));
    }

    reset() {
        // 初始化棋盘数组
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.currentPlayer = 1; // 1为黑子，2为白子
        this.gameOver = false;
        this.updateCurrentPlayer();
        this.draw();
    }

    handleClick(event) {
        if (this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // 转换为棋盘坐标
        const boardX = Math.round((x - this.padding) / this.cellSize);
        const boardY = Math.round((y - this.padding) / this.cellSize);

        // 检查是否在有效范围内
        if (boardX >= 0 && boardX < this.boardSize && boardY >= 0 && boardY < this.boardSize) {
            this.placePiece(boardX, boardY);
        }
    }

    placePiece(x, y) {
        // 如果该位置已经有棋子，返回
        if (this.board[y][x] !== 0) return;

        // 放置棋子
        this.board[y][x] = this.currentPlayer;
        
        // 检查是否获胜
        if (this.checkWin(x, y)) {
            this.gameOver = true;
            this.draw();
            setTimeout(() => {
                alert((this.currentPlayer === 1 ? '黑子' : '白子') + '获胜！');
            }, 100);
            return;
        }

        // 切换玩家
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateCurrentPlayer();
        this.draw();
    }

    checkWin(x, y) {
        const directions = [
            [[0, 1], [0, -1]], // 垂直
            [[1, 0], [-1, 0]], // 水平
            [[1, 1], [-1, -1]], // 对角线
            [[1, -1], [-1, 1]] // 反对角线
        ];

        return directions.some(dir => {
            const count = 1 + // 当前位置
                this.countPieces(x, y, dir[0][0], dir[0][1]) + // 正向
                this.countPieces(x, y, dir[1][0], dir[1][1]); // 反向
            return count >= 5;
        });
    }

    countPieces(x, y, dx, dy) {
        let count = 0;
        let currentX = x + dx;
        let currentY = y + dy;
        const player = this.board[y][x];

        while (
            currentX >= 0 && currentX < this.boardSize &&
            currentY >= 0 && currentY < this.boardSize &&
            this.board[currentY][currentX] === player
        ) {
            count++;
            currentX += dx;
            currentY += dy;
        }

        return count;
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#f0c78a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;

        // 绘制横线和竖线
        for (let i = 0; i < this.boardSize; i++) {
            // 横线
            this.ctx.moveTo(this.padding, this.padding + i * this.cellSize);
            this.ctx.lineTo(this.canvas.width - this.padding, this.padding + i * this.cellSize);
            // 竖线
            this.ctx.moveTo(this.padding + i * this.cellSize, this.padding);
            this.ctx.lineTo(this.padding + i * this.cellSize, this.canvas.height - this.padding);
        }
        this.ctx.stroke();

        // 绘制棋子
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.board[y][x] !== 0) {
                    this.ctx.beginPath();
                    this.ctx.fillStyle = this.board[y][x] === 1 ? '#000000' : '#ffffff';
                    this.ctx.arc(
                        this.padding + x * this.cellSize,
                        this.padding + y * this.cellSize,
                        this.pieceRadius,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                    if (this.board[y][x] === 2) {
                        this.ctx.strokeStyle = '#000000';
                        this.ctx.lineWidth = 1;
                        this.ctx.stroke();
                    }
                }
            }
        }
    }

    updateCurrentPlayer() {
        document.getElementById('currentPlayer').textContent = 
            this.currentPlayer === 1 ? '黑子' : '白子';
    }
}

// 游戏初始化
window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Gomoku(canvas);

    // 重新开始按钮
    document.getElementById('restartBtn').addEventListener('click', () => {
        game.reset();
    });
}; 