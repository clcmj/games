class Pacman {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.highScore = parseInt(localStorage.getItem('pacman_highScore')) || 0;
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.livesElement = document.getElementById('lives');
        this.startBtn = document.getElementById('startBtn');
        
        this.tileSize = 20;
        this.gridSize = 20;
        
        this.pacman = {
            x: 10,
            y: 15,
            direction: 'right',
            nextDirection: 'right',
            speed: 0.1,
            mouthOpen: 0,
            mouthDir: 1
        };
        
        this.ghosts = [];
        this.dots = [];
        this.powerDots = [];
        this.walls = [];
        this.gameOver = true;
        this.powerMode = false;
        this.powerModeTimer = 0;
        
        this.init();
    }
    
    init() {
        this.startBtn.addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleInput(e));
        this.highScoreElement.textContent = this.highScore;
        this.createMaze();
        this.draw();
    }
    
    createMaze() {
        // Create walls
        for (let i = 0; i < this.gridSize; i++) {
            this.walls.push({x: i, y: 0});
            this.walls.push({x: i, y: this.gridSize - 1});
            this.walls.push({x: 0, y: i});
            this.walls.push({x: this.gridSize - 1, y: i});
        }
        
        // Add some internal walls
        const internalWalls = [
            {x: 3, y: 3, w: 3, h: 2}, {x: 8, y: 3, w: 4, h: 2},
            {x: 14, y: 3, w: 3, h: 2}, {x: 3, y: 7, w: 3, h: 4},
            {x: 8, y: 7, w: 4, h: 2}, {x: 14, y: 7, w: 3, h: 4},
            {x: 8, y: 11, w: 4, h: 2}, {x: 3, y: 13, w: 3, h: 2},
            {x: 8, y: 15, w: 4, h: 2}, {x: 14, y: 13, w: 3, h: 2}
        ];
        
        internalWalls.forEach(wall => {
            for (let i = 0; i < wall.w; i++) {
                for (let j = 0; j < wall.h; j++) {
                    this.walls.push({x: wall.x + i, y: wall.y + j});
                }
            }
        });
        
        // Create dots and power dots
        for (let i = 1; i < this.gridSize - 1; i++) {
            for (let j = 1; j < this.gridSize - 1; j++) {
                if (!this.isWall(i, j)) {
                    if ((i === 1 && j === 1) || (i === 1 && j === this.gridSize - 2) ||
                        (i === this.gridSize - 2 && j === 1) || (i === this.gridSize - 2 && j === this.gridSize - 2)) {
                        this.powerDots.push({x: i, y: j});
                    } else {
                        this.dots.push({x: i, y: j});
                    }
                }
            }
        }
        
        // Create ghosts
        const ghostColors = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff'];
        for (let i = 0; i < 4; i++) {
            this.ghosts.push({
                x: 9 + i,
                y: 9,
                direction: 'up',
                color: ghostColors[i],
                speed: 0.08
            });
        }
    }
    
    startGame() {
        this.pacman = {
            x: 10,
            y: 15,
            direction: 'right',
            nextDirection: 'right',
            speed: 0.1,
            mouthOpen: 0,
            mouthDir: 1
        };
        
        this.ghosts = [];
        this.dots = [];
        this.powerDots = [];
        this.createMaze();
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.powerMode = false;
        this.powerModeTimer = 0;
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
        this.gameLoop();
    }
    
    handleInput(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.pacman.nextDirection = 'up';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.pacman.nextDirection = 'right';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.pacman.nextDirection = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.pacman.nextDirection = 'left';
                break;
        }
    }
    
    isWall(x, y) {
        return this.walls.some(wall => wall.x === x && wall.y === y);
    }
    
    canMove(x, y) {
        return !this.isWall(Math.round(x), Math.round(y));
    }
    
    update() {
        if (this.gameOver) return;
        
        // Update Pac-Man
        let newX = this.pacman.x;
        let newY = this.pacman.y;
        
        switch(this.pacman.nextDirection) {
            case 'up':
                if (this.canMove(this.pacman.x, this.pacman.y - 1)) {
                    this.pacman.direction = 'up';
                }
                break;
            case 'right':
                if (this.canMove(this.pacman.x + 1, this.pacman.y)) {
                    this.pacman.direction = 'right';
                }
                break;
            case 'down':
                if (this.canMove(this.pacman.x, this.pacman.y + 1)) {
                    this.pacman.direction = 'down';
                }
                break;
            case 'left':
                if (this.canMove(this.pacman.x - 1, this.pacman.y)) {
                    this.pacman.direction = 'left';
                }
                break;
        }
        
        switch(this.pacman.direction) {
            case 'up':
                if (this.canMove(this.pacman.x, this.pacman.y - this.pacman.speed)) {
                    newY -= this.pacman.speed;
                }
                break;
            case 'right':
                if (this.canMove(this.pacman.x + this.pacman.speed, this.pacman.y)) {
                    newX += this.pacman.speed;
                }
                break;
            case 'down':
                if (this.canMove(this.pacman.x, this.pacman.y + this.pacman.speed)) {
                    newY += this.pacman.speed;
                }
                break;
            case 'left':
                if (this.canMove(this.pacman.x - this.pacman.speed, this.pacman.y)) {
                    newX -= this.pacman.speed;
                }
                break;
        }
        
        this.pacman.x = newX;
        this.pacman.y = newY;
        
        // Update mouth animation
        this.pacman.mouthOpen += 0.2 * this.pacman.mouthDir;
        if (this.pacman.mouthOpen >= 1 || this.pacman.mouthOpen <= 0) {
            this.pacman.mouthDir *= -1;
        }
        
        // Check dot collection
        for (let i = this.dots.length - 1; i >= 0; i--) {
            const dot = this.dots[i];
            if (Math.abs(this.pacman.x - dot.x) < 0.5 && Math.abs(this.pacman.y - dot.y) < 0.5) {
                this.dots.splice(i, 1);
                this.score += 10;
                this.scoreElement.textContent = this.score;
            }
        }
        
        // Check power dot collection
        for (let i = this.powerDots.length - 1; i >= 0; i--) {
            const dot = this.powerDots[i];
            if (Math.abs(this.pacman.x - dot.x) < 0.5 && Math.abs(this.pacman.y - dot.y) < 0.5) {
                this.powerDots.splice(i, 1);
                this.powerMode = true;
                this.powerModeTimer = 300;
                this.score += 50;
                this.scoreElement.textContent = this.score;
            }
        }
        
        // Update ghosts
        this.ghosts.forEach(ghost => {
            // Simple ghost AI
            if (Math.random() < 0.05) {
                const directions = ['up', 'right', 'down', 'left'].filter(dir => {
                    switch(dir) {
                        case 'up':
                            return this.canMove(ghost.x, ghost.y - 1);
                        case 'right':
                            return this.canMove(ghost.x + 1, ghost.y);
                        case 'down':
                            return this.canMove(ghost.x, ghost.y + 1);
                        case 'left':
                            return this.canMove(ghost.x - 1, ghost.y);
                    }
                });
                if (directions.length > 0) {
                    ghost.direction = directions[Math.floor(Math.random() * directions.length)];
                }
            }
            
            switch(ghost.direction) {
                case 'up':
                    if (this.canMove(ghost.x, ghost.y - ghost.speed)) {
                        ghost.y -= ghost.speed;
                    }
                    break;
                case 'right':
                    if (this.canMove(ghost.x + ghost.speed, ghost.y)) {
                        ghost.x += ghost.speed;
                    }
                    break;
                case 'down':
                    if (this.canMove(ghost.x, ghost.y + ghost.speed)) {
                        ghost.y += ghost.speed;
                    }
                    break;
                case 'left':
                    if (this.canMove(ghost.x - ghost.speed, ghost.y)) {
                        ghost.x -= ghost.speed;
                    }
                    break;
            }
            
            // Check collision with Pac-Man
            if (Math.abs(this.pacman.x - ghost.x) < 0.5 && Math.abs(this.pacman.y - ghost.y) < 0.5) {
                if (this.powerMode) {
                    ghost.x = 9;
                    ghost.y = 9;
                    this.score += 200;
                    this.scoreElement.textContent = this.score;
                } else {
                    this.lives--;
                    this.livesElement.textContent = this.lives;
                    if (this.lives <= 0) {
                        this.gameOver = true;
                        if (this.score > this.highScore) {
                            this.highScore = this.score;
                            this.highScoreElement.textContent = this.highScore;
                            localStorage.setItem('pacman_highScore', this.highScore);
                        }
                    } else {
                        this.pacman.x = 10;
                        this.pacman.y = 15;
                        this.pacman.direction = 'right';
                        this.pacman.nextDirection = 'right';
                    }
                }
            }
        });
        
        // Update power mode
        if (this.powerMode) {
            this.powerModeTimer--;
            if (this.powerModeTimer <= 0) {
                this.powerMode = false;
            }
        }
        
        // Check win condition
        if (this.dots.length === 0 && this.powerDots.length === 0) {
            this.gameOver = true;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.highScoreElement.textContent = this.highScore;
                localStorage.setItem('pacman_highScore', this.highScore);
            }
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw walls
        this.ctx.fillStyle = '#0000ff';
        this.walls.forEach(wall => {
            this.ctx.fillRect(
                wall.x * this.tileSize,
                wall.y * this.tileSize,
                this.tileSize,
                this.tileSize
            );
        });
        
        // Draw dots
        this.ctx.fillStyle = '#ffffff';
        this.dots.forEach(dot => {
            this.ctx.beginPath();
            this.ctx.arc(
                dot.x * this.tileSize + this.tileSize / 2,
                dot.y * this.tileSize + this.tileSize / 2,
                2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
        
        // Draw power dots
        this.powerDots.forEach(dot => {
            this.ctx.beginPath();
            this.ctx.arc(
                dot.x * this.tileSize + this.tileSize / 2,
                dot.y * this.tileSize + this.tileSize / 2,
                6,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
        
        // Draw Pac-Man
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        const pacmanX = this.pacman.x * this.tileSize + this.tileSize / 2;
        const pacmanY = this.pacman.y * this.tileSize + this.tileSize / 2;
        const mouthAngle = this.pacman.mouthOpen * Math.PI / 4;
        let startAngle = 0;
        let endAngle = Math.PI * 2;
        
        switch(this.pacman.direction) {
            case 'right':
                startAngle = mouthAngle;
                endAngle = Math.PI * 2 - mouthAngle;
                break;
            case 'left':
                startAngle = Math.PI + mouthAngle;
                endAngle = Math.PI - mouthAngle;
                break;
            case 'up':
                startAngle = Math.PI * 1.5 + mouthAngle;
                endAngle = Math.PI * 1.5 - mouthAngle;
                break;
            case 'down':
                startAngle = Math.PI * 0.5 + mouthAngle;
                endAngle = Math.PI * 0.5 - mouthAngle;
                break;
        }
        
        this.ctx.arc(pacmanX, pacmanY, this.tileSize / 2, startAngle, endAngle);
        this.ctx.lineTo(pacmanX, pacmanY);
        this.ctx.fill();
        
        // Draw ghosts
        this.ghosts.forEach(ghost => {
            this.ctx.fillStyle = this.powerMode ? '#0000ff' : ghost.color;
            const ghostX = ghost.x * this.tileSize;
            const ghostY = ghost.y * this.tileSize;
            
            // Ghost body
            this.ctx.beginPath();
            this.ctx.arc(
                ghostX + this.tileSize / 2,
                ghostY + this.tileSize / 2,
                this.tileSize / 2,
                Math.PI,
                0
            );
            this.ctx.lineTo(
                ghostX + this.tileSize,
                ghostY + this.tileSize
            );
            this.ctx.lineTo(
                ghostX,
                ghostY + this.tileSize
            );
            this.ctx.fill();
        });
        
        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                this.lives > 0 ? '恭喜通关！' : '游戏结束',
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

new Pacman(); 