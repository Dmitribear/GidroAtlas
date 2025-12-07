# Скрипт для копирования и переименования изображений объектов
# Запустите этот скрипт из папки frontend/public/images/objects/

# Маппинг существующих файлов на нужные имена
$mapping = @{
    # Если у вас есть файлы с другими именами, добавьте их сюда
    # Например: 'old-name.jpg' = 'new-name.jpg'
}

# Копирование файлов из родительской папки public/ если они еще не скопированы
$sourceDir = "..\..\"
$targetDir = "."

# Пример: если у вас есть файл "charvak-reservoir.jpg" и нужно его использовать как "samarkand.jpg"
# Раскомментируйте и измените:
# Copy-Item "$sourceDir\charvak-reservoir-mountains-blue-water.jpg" -Destination "$targetDir\samarkand.jpg" -Force

Write-Host "Файлы готовы к использованию в папке: $targetDir"
Write-Host "Добавьте недостающие изображения согласно README.md"

