class Snake {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.reset();

        // 像素风格颜色
        this.colors = {
            snake: '#39ff14',
            food: '#ff0800',
            background: '#000000'
        };
    }

    reset() {
        this.snake = [{x: 5, y: 5}];
        this.food = this.generateFood();
        this.dx = 1;
        this.dy = 0;
        this.score = 0;
        this.gameOver = false;
        this.paused = false;
        this.updateScore();
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }

    update() {
        if (this.gameOver || this.paused) return;

        // 移动蛇
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};

        // 检查碰撞
        if (this.checkCollision(head)) {
            this.gameOver = true;
            this.updateHighScore();
            return;
        }

        this.snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }

        // 检查自身碰撞
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制蛇
        this.ctx.fillStyle = this.colors.snake;
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // 绘制食物
        this.ctx.fillStyle = this.colors.food;
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );

        if (this.gameOver) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏结束!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    updateHighScore() {
        const highScore = localStorage.getItem('snakeHighScore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('snakeHighScore', this.score);
        }
        document.getElementById('highScore').textContent = Math.max(highScore, this.score);
    }
}

// 游戏初始化
window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Snake(canvas);
    let gameLoop;

    // 显示最高分
    document.getElementById('highScore').textContent = localStorage.getItem('snakeHighScore') || 0;

    // 控制按钮
    document.getElementById('startBtn').addEventListener('click', () => {
        game.reset();
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(() => {
            game.update();
            game.draw();
        }, 100);
    });

    document.getElementById('pauseBtn').addEventListener('click', () => {
        game.paused = !game.paused;
        document.getElementById('pauseBtn').textContent = game.paused ? '继续' : '暂停';
    });

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (game.dy !== 1) { game.dx = 0; game.dy = -1; }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (game.dy !== -1) { game.dx = 0; game.dy = 1; }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (game.dx !== 1) { game.dx = -1; game.dy = 0; }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (game.dx !== -1) { game.dx = 1; game.dy = 0; }
                break;
        }
    });

    // 初始绘制
    game.draw();
}; 