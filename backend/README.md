# GidroAtlas Backend

FastAPI scaffold aligned with clean architecture layers (domain → application → infrastructure → interfaces). Supabase is used as the primary storage, Alembic is pre-configured for migrations, and auth uses bcrypt + JWT with OAuth2 bearer flow.

## Layout
- `src/app/core` — settings, security utilities, shared dependencies.
- `src/app/domain` — entities (pure dataclasses).
- `src/app/application` — use-cases orchestrating domain and infra.
- `src/app/infrastructure` — adapters for Supabase and other services.
- `src/app/interfaces/api` — FastAPI routers and DTOs.
- `alembic/` — migration environment and `versions/` for scripts.

## Quick start
```bash
cd backend
python -m venv .venv && . .venv/Scripts/activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --factory
```

Environment variables (see `.env`):
- `SUPABASE_URL`, `SUPABASE_KEY`
- `JWT_SECRET`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXP_MINUTES`
- `BCRYPT_ROUNDS`
- `DATABASE_URL` (used by Alembic; Supabase Postgres URL)

Run migrations:
```bash
alembic upgrade head
```
