class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('flappybird_highScore')) || 0;
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.startBtn = document.getElementById('startBtn');
        
        this.bird = {
            x: 50,
            y: this.canvas.height / 2,
            width: 30,
            height: 24,
            velocity: 0,
            gravity: 0.5,
            jumpForce: -8
        };
        
        this.pipes = [];
        this.pipeGap = 120;
        this.pipeWidth = 50;
        this.pipeSpawnInterval = 120;
        this.frameCount = 0;
        this.gameOver = true;
        
        this.init();
    }
    
    init() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.canvas.addEventListener('click', () => this.jump());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.jump();
        });
        this.highScoreElement.textContent = this.highScore;
        this.draw();
    }
    
    startGame() {
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.pipes = [];
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.gameOver = false;
        this.frameCount = 0;
        this.gameLoop();
    }
    
    jump() {
        if (!this.gameOver) {
            this.bird.velocity = this.bird.jumpForce;
        }
    }
    
    update() {
        if (this.gameOver) return;
        
        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Spawn new pipes
        if (this.frameCount % this.pipeSpawnInterval === 0) {
            const pipeHeight = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
            this.pipes.push({
                x: this.canvas.width,
                height: pipeHeight,
                passed: false
            });
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= 2;
            
            // Check collision
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    this.highScoreElement.textContent = this.highScore;
                    localStorage.setItem('flappybird_highScore', this.highScore);
                }
                return;
            }
            
            // Score points
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.scoreElement.textContent = this.score;
            }
            
            // Remove off-screen pipes
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
        
        // Check boundaries
        if (this.bird.y < 0 || this.bird.y + this.bird.height > this.canvas.height) {
            this.gameOver = true;
        }
        
        this.frameCount++;
    }
    
    checkCollision(pipe) {
        const birdRight = this.bird.x + this.bird.width;
        const birdBottom = this.bird.y + this.bird.height;
        const pipeRight = pipe.x + this.pipeWidth;
        
        // Check if bird is within pipe's x-coordinates
        if (this.bird.x < pipeRight && birdRight > pipe.x) {
            // Check if bird hits top pipe
            if (this.bird.y < pipe.height) return true;
            // Check if bird hits bottom pipe
            if (birdBottom > pipe.height + this.pipeGap) return true;
        }
        
        return false;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw bird
        this.ctx.fillStyle = '#f7e334';
        this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);
        
        // Draw pipes
        this.ctx.fillStyle = '#73bf2e';
        this.pipes.forEach(pipe => {
            // Draw top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.height);
            // Draw bottom pipe
            this.ctx.fillRect(
                pipe.x,
                pipe.height + this.pipeGap,
                this.pipeWidth,
                this.canvas.height - (pipe.height + this.pipeGap)
            );
        });
        
        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                '点击开始游戏',
                this.canvas.width / 2,
                this.canvas.height / 2
            );
        }
    }
    
    gameLoop() {
        if (!this.gameOver) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        } else {
            this.draw();
        }
    }
}

new FlappyBird(); 