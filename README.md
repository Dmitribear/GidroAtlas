# GidroAtlas
<img width="1375" height="300" alt="{6FAC3E93-1FC3-4B25-AB0A-376DBCF7F41C}" src="https://github.com/user-attachments/assets/5e432c40-e3bb-41e8-bd27-d12d9f870719" />

GidroAtlas — это веб-платформа для каталогизации, визуализации и анализа данных по водным объектам.  
Проект объединяет интерактивный интерфейс, структуру данных и систему паспортизации объектов.

---

## Основные возможности

- Импорт и отображение данных о водных объектах (CSV).
- Формирование паспортов объектов (ZIP-архивы с документами).
- Гибкая архитектура: разделение на frontend и backend.
- Возможность локального запуска или запуска через Docker/Docker Compose.

---

## Технологии

- **Backend**: Python (FastAPI), C++/C/Cython.
- **Frontend**: TypeScript (React/Vue, зависит от реализации).
- **Base Data Formats**: CSV, ZIP.
- **DevOps**: Docker, Docker Compose.

---

## Установка и запуск

git clone https://github.com/Dmitribear/GidroAtlas.git
cd GidroAtlas
docker-compose up --build



Данные проекта
CSV: water_objects_real_30.csv
Содержит реальные данные по водным объектам.

ZIP: passports_all30.zip
Система паспортов объектов (подготовленные документы).

Как пользоваться
- Запускаете сервис.
- Открываете браузер.
- Просматриваете список объектов.
- Открываете паспорт по каждому объекту.
- Используете фильтры/поиск (опционально, если реализовано).

Разработка и вклад

Если вы хотите предложить улучшения:

git checkout -b feature/<название-фичи>


Создайте Pull Request.
Будут приветствоваться:
визуализации,
расширение данных,
новые фильтры,
улучшения UI.

Лицензия
MIT

Контакты
Автор: Dmitribear, Leyfach, disappointtt, 
Репозиторий: https://github.com/Dmitribear/GidroAtlas
