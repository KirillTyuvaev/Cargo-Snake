class Snake {
    constructor() {
        this.reset();
    }

    reset() {
        this.body = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
    }

    move() {
        const head = {...this.body[0]};
        
        // Обновляем направление
        this.direction = this.nextDirection;
        
        // Двигаем голову в текущем направлении
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Добавляем новую голову
        this.body.unshift(head);
        
        // Удаляем хвост, если не съели еду
        if (!this.grow) {
            this.body.pop();
        } else {
            this.grow = false;
        }
    }

    changeDirection(newDirection) {
        // Предотвращаем разворот на 180 градусов
        if (
            (newDirection === 'up' && this.direction !== 'down') ||
            (newDirection === 'down' && this.direction !== 'up') ||
            (newDirection === 'left' && this.direction !== 'right') ||
            (newDirection === 'right' && this.direction !== 'left')
        ) {
            this.nextDirection = newDirection;
        }
    }

    checkCollision(gridSize) {
        const head = this.body[0];
        
        // Проверяем столкновение со стенами
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            return true;
        }
        
        // Проверяем столкновение с телом
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }
        
        return false;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.cellSize = this.canvas.width / this.gridSize;
        this.snake = new Snake();
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.paused = false;
        this.speed = 150; // миллисекунды между ходами
        
        // Привязываем методы к контексту
        this.gameLoop = this.gameLoop.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        
        // Добавляем обработчики событий
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.addEventListener('keydown', this.handleKeyPress);
    }

    start() {
        if (!this.gameInterval) {
            this.reset();
            this.gameInterval = setInterval(this.gameLoop, this.speed);
        }
    }

    reset() {
        this.snake.reset();
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.updateScore();
    }

    togglePause() {
        this.paused = !this.paused;
        document.getElementById('pauseBtn').textContent = this.paused ? 'Продолжить' : 'Пауза';
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.snake.body.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }

    gameLoop() {
        if (this.paused || this.gameOver) return;
        
        this.snake.move();
        
        // Проверяем столкновение со стенами или телом
        if (this.snake.checkCollision(this.gridSize)) {
            this.gameOver = true;
            clearInterval(this.gameInterval);
            this.gameInterval = null;
            alert(`Игра окончена! Ваш счет: ${this.score}`);
            return;
        }
        
        // Проверяем, съели ли еду
        const head = this.snake.body[0];
        if (head.x === this.food.x && head.y === this.food.y) {
            this.snake.grow = true;
            this.food = this.generateFood();
            this.score += 10;
            this.updateScore();
        }
        
        this.draw();
    }

    draw() {
        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем змейку
        this.ctx.fillStyle = '#4CAF50';
        this.snake.body.forEach((segment, index) => {
            if (index === 0) {
                // Голова змейки
                this.ctx.fillStyle = '#388E3C';
            } else {
                // Тело змейки
                this.ctx.fillStyle = '#4CAF50';
            }
            this.ctx.fillRect(
                segment.x * this.cellSize,
                segment.y * this.cellSize,
                this.cellSize - 1,
                this.cellSize - 1
            );
        });
        
        // Рисуем еду
        this.ctx.fillStyle = '#FF5252';
        this.ctx.fillRect(
            this.food.x * this.cellSize,
            this.food.y * this.cellSize,
            this.cellSize - 1,
            this.cellSize - 1
        );
    }

    handleKeyPress(event) {
        if (this.paused || this.gameOver) return;
        
        switch(event.key) {
            case 'ArrowUp':
                this.snake.changeDirection('up');
                break;
            case 'ArrowDown':
                this.snake.changeDirection('down');
                break;
            case 'ArrowLeft':
                this.snake.changeDirection('left');
                break;
            case 'ArrowRight':
                this.snake.changeDirection('right');
                break;
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
}

// Создаем игру при загрузке страницы
window.onload = () => {
    new Game();
}; 