# GidroAtlas Priority Analyzer

Минимальная система оценки приоритета обследования объектов водных ресурсов.

## Запуск

1. Создайте файл `.env` в корне проекта:
   ```
   OPENAI_API_KEY=sk-ваш-ключ
   ```
2. Установите зависимости:
   ```bash
   pip install -r requirements.txt
   ```
3. Запустите backend:
   ```bash
   uvicorn backend.main:app --reload
   ```
4. Для AI dashboard поднимите статический сервер в `frontend_dashboard/`  
   (`py -m http.server 5500`) и откройте страницу `http://localhost:5500/`.

- `POST /ai/analyze` — AI-анализ (GPT‑4.1 mini) с прогнозами на 3/6/12/24 месяца.
- `POST /visualize` — возвращает base64-графики для дашборда.

## Backend

- `backend/main.py` – FastAPI (эндпоинты, расчёт приоритета, вызов OpenAI).
- `backend/ai_engine.py` – интеграция с OpenAI (чтение ключа из `.env`).
- `backend/visualization.py` – seaborn/matplotlib графики (распределения, boxplot, heatmap).
- `backend/config.py` – CORS и константы.
- `backend/logic.py` – вспомогательный расчёт возраста паспорта и приоритета.
- `backend/visualization.py` – генерация шести графиков для UI.

## Формат CSV

```
id,name,region,resource_type,water_type,fauna,passport_date,technical_condition,latitude,longitude,pdf_url
1,Озеро Карасор,Карагандинская,озеро,пресная,1,2014-06-12,4,49.8231,72.1474,/pdfs/karasor.pdf
```

Готовый датасет на 50 объектов: `data/sample_priority.csv`.

## Frontend

- `features/gidro-atlas/…` – основной интерфейс карты (Next.js).
- `frontend_dashboard/` – независимый AI-дэшборд (Tailwind + JS). Поддерживает загрузку CSV/JSON, отправку на `/ai/analyze` и `/visualize`, построение метрик, графиков и таблицы.

