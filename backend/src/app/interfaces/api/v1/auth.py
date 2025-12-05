from fastapi import APIRouter, Depends

from app.application.auth.use_cases import AuthenticateUser, RegisterUser
from app.core.deps import get_current_subject, get_user_repository
from app.domain.token import Token
from app.infrastructure.supabase.repositories import UserRepositorySupabase
from app.schemas.auth import LoginRequest, RegisterRequest

router = APIRouter(tags=["auth"])


@router.post("/auth/register", response_model=Token, status_code=201)
async def register_user(
  payload: RegisterRequest, repo: UserRepositorySupabase = Depends(get_user_repository)
) -> Token:
  await RegisterUser(repo)(payload.login, payload.password)
  token = await AuthenticateUser(repo)(payload.login, payload.password)
  return Token(access_token=token)


@router.post("/auth/login", response_model=Token)
async def login(payload: LoginRequest, repo: UserRepositorySupabase = Depends(get_user_repository)) -> Token:
  token = await AuthenticateUser(repo)(payload.login, payload.password)
  return Token(access_token=token)


@router.get("/auth/me")
async def me(subject: str = Depends(get_current_subject)) -> dict:
  return {"sub": subject}
