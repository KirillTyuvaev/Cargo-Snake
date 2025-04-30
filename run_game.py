import subprocess
import sys
import os

def install_requirements():
    print("Установка необходимых зависимостей...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def run_game():
    print("Запуск игры...")
    subprocess.check_call([sys.executable, "snake_game.py"])

if __name__ == "__main__":
    # Переходим в директорию скрипта
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    install_requirements()
    run_game() 