@echo off
title GidroAtlas ML Auto Installer
color 0a

echo ============================================================
echo     🔧 AUTO INSTALLER: Python 3.10 + Backend Setup
echo ============================================================
echo.

REM -------------------------------
REM 1. Проверяем версию Python
REM -------------------------------
echo Checking Python version...

python --version > temp_pyver.txt 2>&1
findstr /C:"Python 3.10" temp_pyver.txt >nul
if %errorlevel%==0 (
    echo ✔ Python 3.10 already installed.
    goto CREATE_VENV
)

echo ⚠ Python 3.10 not found. Installing...
echo.

REM -------------------------------
REM 2. Скачиваем Python 3.10.11 инсталлер
REM -------------------------------
echo Downloading Python 3.10 installer...

powershell -command "Invoke-WebRequest -Uri https://www.python.org/ftp/python/3.10.11/python-3.10.11-amd64.exe -OutFile python310.exe"

echo Running installer...

python310.exe /quiet InstallAllUsers=0 PrependPath=1 Include_test=0

echo ✔ Python 3.10 installed.
del python310.exe


REM -------------------------------
REM 3. Создание виртуального окружения
REM -------------------------------
:CREATE_VENV
echo.
echo Creating virtual environment...

python -m venv venv

echo ✔ Virtual environment created.


REM -------------------------------
REM 4. Активируем окружение
REM -------------------------------
echo Activating environment...
call venv\Scripts\activate

echo ✔ Environment activated.


REM -------------------------------
REM 5. Создаем requirements.txt
REM -------------------------------
echo Writing requirements.txt...

echo fastapi==0.110.0 > requirements.txt
echo uvicorn==0.24.0 >> requirements.txt
echo pandas==2.0.3 >> requirements.txt
echo numpy==1.26.4 >> requirements.txt
echo scikit-learn==1.3.2 >> requirements.txt
echo seaborn==0.13.1 >> requirements.txt
echo joblib==1.3.2 >> requirements.txt
echo python-multipart==0.0.9 >> requirements.txt

echo ✔ requirements.txt created.


REM -------------------------------
REM 6. Установка зависимостей
REM -------------------------------
echo Installing Python packages...
pip install --upgrade pip
pip install -r requirements.txt

echo.
echo ✔ Dependencies installed.


REM -------------------------------
REM 7. Запуск backend
REM -------------------------------
echo Starting backend on http://127.0.0.1:8000 ...
echo.

uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000

echo.
pause
