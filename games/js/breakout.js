class Breakout {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 游戏配置
        this.paddleHeight = 10;
        this.paddleWidth = 75;
        this.ballRadius = 8;
        this.brickRowCount = 5;
        this.brickColumnCount = 8;
        this.brickWidth = 50;
        this.brickHeight = 20;
        this.brickPadding = 10;
        this.brickOffsetTop = 60;
        this.brickOffsetLeft = 30;
        
        // 像素风格颜色
        this.colors = {
            background: '#000000',
            ball: '#ffffff',
            paddle: '#3498db',
            bricks: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db']
        };
        
        this.reset();
    }

    reset() {
        // 初始化挡板
        this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
        
        // 初始化球
        this.ballX = this.canvas.width / 2;
        this.ballY = this.canvas.height - 30;
        this.ballSpeedX = 0;
        this.ballSpeedY = 0;
        this.ballLaunched = false;
        
        // 初始化砖块
        this.bricks = [];
        for (let c = 0; c < this.brickColumnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickRowCount; r++) {
                this.bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
        
        // 游戏状态
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.paused = false;
        this.rightPressed = false;
        this.leftPressed = false;
        
        this.updateScore();
        this.updateLives();
    }

    launchBall() {
        if (!this.ballLaunched && !this.gameOver) {
            this.ballLaunched = true;
            this.ballSpeedX = 4;
            this.ballSpeedY = -4;
        }
    }

    collisionDetection() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                const brick = this.bricks[c][r];
                if (brick.status === 1) {
                    if (
                        this.ballX > brick.x &&
                        this.ballX < brick.x + this.brickWidth &&
                        this.ballY > brick.y &&
                        this.ballY < brick.y + this.brickHeight
                    ) {
                        this.ballSpeedY = -this.ballSpeedY;
                        brick.status = 0;
                        this.score += 10;
                        this.updateScore();
                        
                        if (this.score === this.brickRowCount * this.brickColumnCount * 10) {
                            this.gameOver = true;
                            setTimeout(() => alert('恭喜你赢了！'), 100);
                        }
                    }
                }
            }
        }
    }

    movePaddle() {
        if (this.rightPressed && this.paddleX < this.canvas.width - this.paddleWidth) {
            this.paddleX += 7;
        } else if (this.leftPressed && this.paddleX > 0) {
            this.paddleX -= 7;
        }
        
        // 如果球还没发射，跟随挡板移动
        if (!this.ballLaunched) {
            this.ballX = this.paddleX + this.paddleWidth / 2;
        }
    }

    moveBall() {
        if (!this.ballLaunched) return;
        
        this.ballX += this.ballSpeedX;
        this.ballY += this.ballSpeedY;
        
        // 碰撞检测 - 墙壁
        if (this.ballX + this.ballRadius > this.canvas.width || this.ballX - this.ballRadius < 0) {
            this.ballSpeedX = -this.ballSpeedX;
        }
        if (this.ballY - this.ballRadius < 0) {
            this.ballSpeedY = -this.ballSpeedY;
        }
        
        // 碰撞检测 - 挡板
        if (this.ballY + this.ballRadius > this.canvas.height - this.paddleHeight) {
            if (this.ballX > this.paddleX && this.ballX < this.paddleX + this.paddleWidth) {
                // 根据击中挡板的位置改变反弹角度
                const hitPoint = (this.ballX - (this.paddleX + this.paddleWidth/2)) / (this.paddleWidth/2);
                this.ballSpeedX = hitPoint * 4;
                this.ballSpeedY = -this.ballSpeedY;
            } else if (this.ballY + this.ballRadius > this.canvas.height) {
                this.lives--;
                this.updateLives();
                
                if (this.lives === 0) {
                    this.gameOver = true;
                    setTimeout(() => alert('游戏结束！'), 100);
                } else {
                    this.ballX = this.paddleX + this.paddleWidth/2;
                    this.ballY = this.canvas.height - 30;
                    this.ballSpeedX = 0;
                    this.ballSpeedY = 0;
                    this.ballLaunched = false;
                }
            }
        }
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制砖块
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    const brickX = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
                    const brickY = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
                    this.bricks[c][r].x = brickX;
                    this.bricks[c][r].y = brickY;
                    
                    this.ctx.fillStyle = this.colors.bricks[r];
                    this.ctx.fillRect(brickX, brickY, this.brickWidth, this.brickHeight);
                    
                    // 像素风格边框
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(brickX, brickY, this.brickWidth, 2);
                    this.ctx.fillRect(brickX, brickY, 2, this.brickHeight);
                    
                    this.ctx.fillStyle = '#000000';
                    this.ctx.fillRect(brickX + this.brickWidth - 2, brickY, 2, this.brickHeight);
                    this.ctx.fillRect(brickX, brickY + this.brickHeight - 2, this.brickWidth, 2);
                }
            }
        }
        
        // 绘制挡板
        this.ctx.fillStyle = this.colors.paddle;
        this.ctx.fillRect(this.paddleX, this.canvas.height - this.paddleHeight, this.paddleWidth, this.paddleHeight);
        
        // 绘制球
        this.ctx.beginPath();
        this.ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colors.ball;
        this.ctx.fill();
        this.ctx.closePath();
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                this.score === this.brickRowCount * this.brickColumnCount * 10 ? '你赢了！' : '游戏结束！',
                this.canvas.width / 2,
                this.canvas.height / 2
            );
        }
    }

    update() {
        if (this.gameOver || this.paused) return;
        
        this.movePaddle();
        this.moveBall();
        this.collisionDetection();
        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    updateLives() {
        document.getElementById('lives').textContent = this.lives;
    }
}

// 游戏初始化
window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Breakout(canvas);
    
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
        switch(e.key) {
            case 'ArrowRight':
                game.rightPressed = true;
                break;
            case 'ArrowLeft':
                game.leftPressed = true;
                break;
            case ' ':
                game.launchBall();
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowRight':
                game.rightPressed = false;
                break;
            case 'ArrowLeft':
                game.leftPressed = false;
                break;
        }
    });
    
    // 初始绘制
    game.draw();
}; 