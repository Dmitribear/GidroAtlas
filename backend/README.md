# GidroAtlas Backend

FastAPI scaffold по чистой архитектуре (domain → application → infrastructure → interfaces). Хранилище — Supabase, авторизация — bcrypt + JWT (OAuth2 bearer).

## Layout
- `src/app/core` — настройки, безопасность, общие зависимости.
- `src/app/domain` — сущности (dataclass без внешних зависимостей).
- `src/app/application` — юзкейсы, связывающие домен и инфраструктуру.
- `src/app/infrastructure` — адаптеры Supabase и др. сервисов.
- `src/app/interfaces/api` — FastAPI роуты и DTO.

## Quick start
```bash
cd backend
python -m venv .venv && . .venv/Scripts/activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --app-dir src
```

Environment variables (`backend/.env`):
- `SUPABASE_URL`, `SUPABASE_KEY`
- `JWT_SECRET`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXP_MINUTES`
- `BCRYPT_ROUNDS`
- `DATABASE_URL` (опционально, если нужен прямой доступ к Postgres)

## Подключение к Supabase (шаги)
1. Создайте проект в Supabase → **Project Settings → API**. Скопируйте:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` или `service_role` ключ → `SUPABASE_KEY` (для записи лучше service key).
2. Заполните `backend/.env` значениями из шага 1.
3. Создайте таблицу `users` (SQL Editor → New query):
   ```sql
   create extension if not exists pgcrypto;
   create table if not exists public.users (
     id uuid primary key default gen_random_uuid(),
     login text unique not null,
     password_hash text not null,
     role text not null default 'guest' check (role in ('guest', 'expert'))
   );
   ```
4. Проверьте доступ в консоли Supabase: `select * from users limit 1;`.
5. Запустите API (из `backend`): `uvicorn app.main:app --reload --app-dir src`.
6. Протестируйте auth:
   - `POST /api/v1/auth/register` с `{ "email": "user@example.com", "password": "secret123" }`
   - `POST /api/v1/auth/login` с теми же данными
   - `GET /api/v1/auth/me` с заголовком `Authorization: Bearer <token>`

## Таблица water_objects (водные ресурсы)
Создайте таблицу для объектов водных ресурсов:
```sql
create extension if not exists pgcrypto;
create table if not exists public.water_objects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text not null,
  resource_type text not null check (resource_type in ('lake', 'canal', 'reservoir')),
  water_type text not null check (water_type in ('fresh', 'non_fresh')),
  fauna boolean not null,
  passport_date date not null,
  technical_condition integer not null check (technical_condition between 1 and 5),
  latitude double precision not null,
  longitude double precision not null,
  pdf_url text,
  priority integer
);
```
