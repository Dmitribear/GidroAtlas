# GidroAtlas Priority Analyzer

Минимальная система оценки приоритета обследования объектов водных ресурсов.

## Запуск

```bash
pip install fastapi uvicorn python-multipart pandas scikit-learn numpy
uvicorn backend.main:app --reload
```

Откройте `frontend/index.html` в браузере и загрузите CSV.

- Аналитика доступна по `POST /analyze_csv?sort_by=priority|risk3|risk6|risk12|risk24`.
- Ответ содержит расчёт приоритета, вероятность риска через 12 месяцев (`risk_probability`), весь таймлайн (`timeline`) и блок `metrics` (общее количество объектов, среднее состояние, критические объекты, отсутствие паспортов, средний возраст паспорта).

## Backend

- `backend/main.py` – инициализация FastAPI и подключение роутов.
- `backend/config.py` – константы (CORS, обязательные столбцы, заголовки).
- `backend/logic.py` – расчёт возраста, скоринга и классификации.
- `backend/services.py` – сервис загрузки/валидации CSV и агрегации результатов.
- `backend/routes/analyze.py` – endpoint `POST /analyze`.
- `backend/schemas.py` – Pydantic-схема `PriorityResult`.

## Формат CSV

```
id,name,region,resource_type,water_type,fauna,passport_date,technical_condition,latitude,longitude,pdf_url
1,Озеро Карасор,Карагандинская,озеро,пресная,1,2014-06-12,4,49.8231,72.1474,/pdfs/karasor.pdf
```

Готовый датасет на 50 объектов: `data/sample_priority.csv` (включает колонку `priority` с рассчитанными значениями `(6 - состояние) * 3 + возраст паспорта`).

