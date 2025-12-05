# Hydro Asset Risk MVP

## Запуск backend

```bash
pip install fastapi uvicorn scikit-learn pydantic
uvicorn backend.main:app --reload
```

## Запуск фронта

Открой `frontend/index.html` любым локальным веб-браузером. Скрипт отправляет запрос `POST http://localhost:8000/predict` и отображает вероятность риска.

## Тестовый JSON для Postman

```json
{
  "technical_condition": 4,
  "passport_age_years": 12,
  "resource_type": 1,
  "water_type": 0,
  "fauna": 1,
  "region_id": 5
}
```

