class Snake {
    constructor() {
        this.reset();
        this.loadImages();
    }

    async loadImages() {
        // Загружаем изображения
        this.headImage = new Image();
        this.headImage.src = 'snake_head.png';
        
        this.bodyImage = new Image();
        this.bodyImage.src = 'snake_body.png';
        
        // Ждем загрузки изображений
        await Promise.all([
            new Promise(resolve => this.headImage.onload = resolve),
            new Promise(resolve => this.bodyImage.onload = resolve)
        ]);
    }

    reset() {
        const startX = Math.floor(GRID_WIDTH / 2);
        const startY = Math.floor(GRID_HEIGHT / 2);
        
        this.body = [
            {x: startX, y: startY},
            {x: startX - 1, y: startY},
            {x: startX - 2, y: startY}
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 2; // Начальный счет 2
        this.gameOver = false;
    }

    move() {
        if (this.gameOver) return;

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
        
        // Проверяем выход за границы
        head.x = (head.x + GRID_WIDTH) % GRID_WIDTH;
        head.y = (head.y + GRID_HEIGHT) % GRID_HEIGHT;
        
        // Проверяем столкновение с телом
        if (this.body.slice(3).some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver = true;
            document.getElementById('gameOver').style.display = 'block';
            return;
        }
        
        // Добавляем новую голову
        this.body.unshift(head);
        
        // Удаляем хвост, если не съели еду
        if (!this.grow) {
            this.body.pop();
        } else {
            this.grow = false;
            this.score++;
            document.getElementById('score').textContent = this.score;
        }
    }

    changeDirection(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        if (this.direction !== opposites[newDirection]) {
            this.nextDirection = newDirection;
        }
    }
}

class Food {
    constructor() {
        this.position = {x: 0, y: 0};
        this.loadImages();
        this.randomizePosition();
    }

    async loadImages() {
        // Загружаем изображения
        this.foodImage = new Image();
        this.foodImage.src = 'food.png';
        
        this.grapeImage = new Image();
        this.grapeImage.src = 'Grape.png';
        
        // Ждем загрузки изображений
        await Promise.all([
            new Promise(resolve => this.foodImage.onload = resolve),
            new Promise(resolve => this.grapeImage.onload = resolve)
        ]);
    }

    randomizePosition(snakeBody = []) {
        do {
            this.position = {
                x: Math.floor(Math.random() * GRID_WIDTH),
                y: Math.floor(Math.random() * GRID_HEIGHT)
            };
        } while (snakeBody.some(segment => 
            segment.x === this.position.x && segment.y === this.position.y));
    }
}

// Константы
const GRID_SIZE = 90;
const WINDOW_WIDTH = 1400;
const WINDOW_HEIGHT = 1000;
const GRID_WIDTH = Math.floor(WINDOW_WIDTH / GRID_SIZE);
const GRID_HEIGHT = Math.floor(WINDOW_HEIGHT / GRID_SIZE);

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.snake = new Snake();
        this.food = new Food();
        
        // Привязываем методы к контексту
        this.gameLoop = this.gameLoop.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        
        // Добавляем обработчик клавиш
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Запускаем игру
        this.start();
    }

    start() {
        if (!this.gameInterval) {
            this.gameInterval = setInterval(this.gameLoop, 200); // 5 FPS как в Python-версии
        }
    }

    reset() {
        this.snake.reset();
        this.food.randomizePosition(this.snake.body);
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('score').textContent = this.snake.score;
    }

    gameLoop() {
        this.snake.move();
        
        // Проверяем, съели ли еду
        const head = this.snake.body[0];
        if (head.x === this.food.position.x && head.y === this.food.position.y) {
            this.snake.grow = true;
            this.food.randomizePosition(this.snake.body);
        }
        
        this.draw();
    }

    draw() {
        // Очищаем canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.snake.gameOver) {
            // Рисуем змейку
            this.snake.body.forEach((segment, index) => {
                const image = index === 0 ? this.snake.headImage : this.snake.bodyImage;
                if (image) {
                    this.ctx.drawImage(
                        image,
                        segment.x * GRID_SIZE,
                        segment.y * GRID_SIZE,
                        GRID_SIZE,
                        GRID_SIZE
                    );
                }
            });
            
            // Рисуем еду
            if (this.food.foodImage) {
                this.ctx.drawImage(
                    this.food.foodImage,
                    this.food.position.x * GRID_SIZE,
                    this.food.position.y * GRID_SIZE,
                    GRID_SIZE,
                    GRID_SIZE
                );
            }
        } else if (this.food.grapeImage) {
            // Рисуем виноград при окончании игры
            const grapeSize = GRID_SIZE * 3;
            this.ctx.drawImage(
                this.food.grapeImage,
                (WINDOW_WIDTH - grapeSize) / 2,
                (WINDOW_HEIGHT - grapeSize) / 2 + 150,
                grapeSize,
                grapeSize
            );
        }
    }

    handleKeyPress(event) {
        if (this.snake.gameOver) {
            if (event.code === 'Space') {
                this.reset();
            }
            return;
        }
        
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
}

// Создаем игру при загрузке страницы
window.onload = () => {
    new Game();
}; 