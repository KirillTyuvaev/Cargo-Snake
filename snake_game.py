import pygame
import random
import sys
import os

# Инициализация Pygame
pygame.init()

# Константы
WINDOW_WIDTH = 1400  # Увеличили с 1200 до 1400
WINDOW_HEIGHT = 1000  # Увеличили с 900 до 1000
GRID_SIZE = 90  # Увеличили с 60 до 90 (на 50% больше)
GRID_WIDTH = WINDOW_WIDTH // GRID_SIZE
GRID_HEIGHT = WINDOW_HEIGHT // GRID_SIZE

# Цвета
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
PURPLE = (128, 0, 128)  # Фиолетовый цвет для надписи CARGO GRAPE

# Направления движения
UP = (0, -1)
DOWN = (0, 1)
LEFT = (-1, 0)
RIGHT = (1, 0)

# Зона счета (недоступна для еды и змейки)
SCORE_AREA_HEIGHT = 100  # Высота зоны счета в пикселях
SCORE_AREA_GRID_HEIGHT = SCORE_AREA_HEIGHT // GRID_SIZE  # Высота зоны счета в клетках

class Snake:
    def __init__(self):
        self.length = 3  # Изменили с 1 на 3, чтобы змейка начиналась с 3 сегментов
        self.positions = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
        # Добавляем еще 2 сегмента тела
        self.positions.append((self.positions[0][0] - 1, self.positions[0][1]))
        self.positions.append((self.positions[0][0] - 2, self.positions[0][1]))
        self.direction = RIGHT
        self.score = 2  # Начальный счет равен 2
        # Загружаем изображения для змейки
        self.image = pygame.image.load('../snake_head.png')
        self.image = pygame.transform.scale(self.image, (GRID_SIZE, GRID_SIZE))
        self.body_image = pygame.image.load('../snake_body.png')
        self.body_image = pygame.transform.scale(self.body_image, (GRID_SIZE, GRID_SIZE))
        self.game_over = False  # Флаг окончания игры

    def get_head_position(self):
        return self.positions[0]
        
    def get_all_positions(self):
        return self.positions

    def update(self):
        if self.game_over:
            return True
            
        cur = self.get_head_position()
        x, y = self.direction
        new = ((cur[0] + x) % GRID_WIDTH, (cur[1] + y) % GRID_HEIGHT)
        
        # Проверяем столкновение с телом змейки
        if new in self.positions[3:]:
            self.game_over = True
            return True
            
        # Обновляем позиции
        self.positions.insert(0, new)
        if len(self.positions) > self.length:
            self.positions.pop()
            
        return True

    def reset(self):
        self.length = 3  # Изменили с 1 на 3, чтобы змейка начиналась с 3 сегментов
        self.positions = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
        # Добавляем еще 2 сегмента тела
        self.positions.append((self.positions[0][0] - 1, self.positions[0][1]))
        self.positions.append((self.positions[0][0] - 2, self.positions[0][1]))
        self.direction = RIGHT
        self.score = 2  # Начальный счет равен 2
        self.game_over = False  # Сбрасываем флаг окончания игры

    def render(self, surface):
        # Отрисовываем змейку только если игра не окончена
        if not self.game_over:
            for i, p in enumerate(self.positions):
                if i == 0:  # Голова змейки
                    surface.blit(self.image, (p[0] * GRID_SIZE, p[1] * GRID_SIZE))
                else:  # Тело змейки
                    surface.blit(self.body_image, (p[0] * GRID_SIZE, p[1] * GRID_SIZE))

class Food:
    def __init__(self):
        self.position = (0, 0)
        self.randomize_position()
        # Загружаем изображение для еды
        self.image = pygame.image.load('../food.png')
        self.image = pygame.transform.scale(self.image, (GRID_SIZE, GRID_SIZE))
        # Загружаем изображение винограда для экрана окончания игры
        try:
            self.grape_image = pygame.image.load('../grape.png')  # Используем новое изображение винограда
        except:
            # Если файл не найден, используем изображение еды
            self.grape_image = pygame.image.load('../food.png')
        self.grape_image = pygame.transform.scale(self.grape_image, (GRID_SIZE * 3, GRID_SIZE * 3))  # Увеличиваем размер в 3 раза

    def randomize_position(self, snake_positions=None):
        # Генерируем позицию еды только в игровой зоне (не в зоне счета)
        # и не на клетках, где находится змейка
        while True:
            new_position = (random.randint(0, GRID_WIDTH-1),
                          random.randint(SCORE_AREA_GRID_HEIGHT, GRID_HEIGHT-1))
            
            # Если змейка не передана или позиция не занята змейкой, используем её
            if snake_positions is None or new_position not in snake_positions:
                self.position = new_position
                break

    def render(self, surface, game_over=False):
        # Отрисовываем еду только если игра не окончена
        if not game_over:
            surface.blit(self.image, (self.position[0] * GRID_SIZE, self.position[1] * GRID_SIZE))
        # При окончании игры отрисовываем виноград в центре экрана
        elif game_over:
            grape_rect = self.grape_image.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 + 150))
            surface.blit(self.grape_image, grape_rect)

def main():
    clock = pygame.time.Clock()
    screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
    pygame.display.set_caption('Змейка')
    
    font = pygame.font.Font(None, 72)  # Увеличили размер шрифта с 36 до 72
    game_over_font = pygame.font.Font(None, 200)  # Увеличили размер шрифта для надписи CARGO GRAPE
    
    snake = Snake()
    food = Food()
    
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                if not snake.game_over:  # Обрабатываем клавиши только если игра не окончена
                    if event.key == pygame.K_UP and snake.direction != DOWN:
                        snake.direction = UP
                    elif event.key == pygame.K_DOWN and snake.direction != UP:
                        snake.direction = DOWN
                    elif event.key == pygame.K_LEFT and snake.direction != RIGHT:
                        snake.direction = LEFT
                    elif event.key == pygame.K_RIGHT and snake.direction != LEFT:
                        snake.direction = RIGHT
                elif event.key == pygame.K_SPACE:  # Перезапуск игры по нажатию пробела
                    snake.reset()
                    food.randomize_position(snake.get_all_positions())

        # Обновление змейки
        if not snake.update():
            snake.game_over = True

        # Проверка столкновения с едой
        if not snake.game_over and snake.get_head_position() == food.position:
            snake.length += 1
            snake.score += 1
            food.randomize_position(snake.get_all_positions())

        # Отрисовка
        screen.fill(BLACK)
        
        # Отрисовка змейки и еды
        snake.render(screen)
        food.render(screen, snake.game_over)
        
        # Отображение счета только если игра не окончена
        if not snake.game_over:
            score_text = font.render(f'BRANDED TRUCKS: {snake.score}', True, RED)  # Изменили цвет на красный
            screen.blit(score_text, (20, 20))  # Увеличили отступ с 10 до 20
        
        # Отображение надписи CARGO GRAPE при окончании игры
        if snake.game_over:
            game_over_text = game_over_font.render('CARGO GRAPE', True, PURPLE)
            text_rect = game_over_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 - 100))
            screen.blit(game_over_text, text_rect)
            
            # Отображение инструкции для перезапуска
            restart_text = font.render('Press SPACE to restart', True, WHITE)
            restart_rect = restart_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 + 350))
            screen.blit(restart_text, restart_rect)
        
        pygame.display.update()
        clock.tick(5)  # Замедлили змейку (было 60, стало 5)

if __name__ == '__main__':
    main() 