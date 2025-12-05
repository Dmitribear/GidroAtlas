from dataclasses import asdict
from datetime import datetime, date
from io import StringIO
import csv
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile
from pydantic import ValidationError

from app.application.water_objects.use_cases import CreateWaterObject, GetWaterObject, ListWaterObjects
from app.core.deps import get_water_object_repository
from app.infrastructure.supabase.water_objects import WaterObjectRepositorySupabase
from app.schemas.water_object import WaterObjectCreate, WaterObjectQuery, WaterObjectResponse

router = APIRouter(prefix="/water-objects", tags=["water_objects"])
logger = logging.getLogger(__name__)


def _normalize_water_type(value: str | None) -> str | None:
  if value is None:
    return None
  normalized = value.strip().lower()
  if normalized in {"fresh", "presnaya", "пресная", "пресная вода"}:
    return "fresh"
  if normalized in {"non_fresh", "non-fresh", "saline", "solenaya", "solyonaya", "соленая", "солёная", "непресная"}:
    return "non_fresh"
  return None


def _normalize_resource_type(value: str | None) -> str | None:
  if value is None:
    return None
  normalized = value.strip().lower()
  mapping = {
    "lake": "lake",
    "ozero": "lake",
    "озеро": "lake",
    "canal": "canal",
    "kanal": "canal",
    "канал": "canal",
    "reservoir": "reservoir",
    "vodokhranilishche": "reservoir",
    "водохранилище": "reservoir",
    "гтс": "reservoir",
  }
  direct = mapping.get(normalized)
  if direct:
    return direct
  if "водохранилище" in normalized or "гтс" in normalized:
    return "reservoir"
  if "канал" in normalized:
    return "canal"
  if "озеро" in normalized:
    return "lake"
  return None


def _priority_from_text(value: str | None) -> int | None:
  if value is None:
    return None
  normalized = value.strip().lower()
  mapping = {
    "high": 3,
    "medium": 2,
    "low": 1,
    "vysokiy": 3,
    "sredniy": 2,
    "nizkiy": 1,
    "высокий": 3,
    "средний": 2,
    "низкий": 1,
  }
  if normalized.isdigit():
    num = int(normalized)
    if 1 <= num <= 3:
      return num
    return None
  return mapping.get(normalized)


def _bool_from_text(value: str | None) -> bool | None:
  if value is None:
    return None
  normalized = value.strip().lower()
  if normalized in {"true", "1", "yes", "da", "y", "да"}:
    return True
  if normalized in {"false", "0", "no", "net", "n", "нет"}:
    return False
  return None


def _parse_date(value: str | None) -> date | None:
  if not value:
    return None
  try:
    return datetime.fromisoformat(value).date()
  except ValueError:
    return None


@router.get("", response_model=list[WaterObjectResponse])
async def list_water_objects(
  repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository),
  region: str | None = Query(None),
  resource_type: str | None = Query(None),
  water_type: str | None = Query(None),
  fauna: bool | None = Query(None),
  technical_condition: int | None = Query(None, ge=1, le=5),
  condition_min: int | None = Query(None, ge=1, le=5),
  priority: int | None = Query(None),
  passport_date_from: str | None = Query(None),
  passport_date_to: str | None = Query(None),
  sort_by: str = Query("priority"),
  sort_dir: str = Query("desc"),
  limit: int = Query(50, ge=1, le=200),
  offset: int = Query(0, ge=0),
):
  query = WaterObjectQuery(
    region=region,
    resource_type=resource_type,  # type: ignore[arg-type]
    water_type=water_type,  # type: ignore[arg-type]
    fauna=fauna,
    technical_condition=technical_condition,
    condition_min=condition_min,
    priority=priority,
    passport_date_from=_parse_date(passport_date_from),
    passport_date_to=_parse_date(passport_date_to),
    sort_by=sort_by,  # type: ignore[arg-type]
    sort_dir=sort_dir,  # type: ignore[arg-type]
    limit=limit,
    offset=offset,
  )
  objects = await ListWaterObjects(repo)(query)
  return [WaterObjectResponse.model_validate(asdict(obj)) for obj in objects]


@router.post("", response_model=WaterObjectResponse, status_code=status.HTTP_201_CREATED)
async def create_water_object(
  payload: WaterObjectCreate, repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository)
):
  obj = await CreateWaterObject(repo)(payload)
  return WaterObjectResponse.model_validate(asdict(obj))


@router.get("/{object_id}", response_model=WaterObjectResponse)
async def get_water_object(
  object_id: str, repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository)
):
  obj = await GetWaterObject(repo)(object_id)
  if obj is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Water object not found")
  return WaterObjectResponse.model_validate(asdict(obj))


@router.get("/{object_id}/priority")
async def get_water_object_priority(
  object_id: str, repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository)
):
  obj = await GetWaterObject(repo)(object_id)
  if obj is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Water object not found")
  return {"id": obj.id, "priority": obj.priority}


@router.post("/import-csv", status_code=status.HTTP_201_CREATED)
async def import_water_objects(
  file: UploadFile = File(...),
  repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository),
):
  payload = await file.read()
  try:
    decoded = payload.decode("utf-8-sig")
  except UnicodeDecodeError:
    decoded = payload.decode("cp1251", errors="ignore")

  reader = csv.DictReader(StringIO(decoded))
  created: list[WaterObjectResponse] = []
  skipped = 0
  skipped_details: list[dict] = []

  for idx, row in enumerate(reader, start=1):
    resource_type = _normalize_resource_type(
      row.get("resource_type") or row.get("resourceType") or row.get("ResourceType")
    ) or "reservoir"
    water_type = _normalize_water_type(row.get("water_type") or row.get("waterType") or row.get("WaterType")) or "fresh"

    try:
      passport_date_raw = row.get("passport_date") or row.get("passportDate") or row.get("date")
      passport_date = datetime.fromisoformat(passport_date_raw).date() if passport_date_raw else None
      technical_condition = int(
        row.get("technical_condition")
        or row.get("condition")
        or row.get("Condition")
        or row.get("technicalCondition")
        or 0
      )
      latitude = float(row.get("latitude") or row.get("lat") or row.get("Latitude") or row.get("Lat"))
      longitude = float(row.get("longitude") or row.get("lon") or row.get("Longitude") or row.get("Lon"))
    except (ValueError, TypeError) as exc:
      skipped += 1
      skipped_details.append({"row": idx, "reason": f"parse error: {exc}", "data": row})
      continue

    if passport_date is None:
      passport_date = date.today()
    if technical_condition < 1 or technical_condition > 5:
      technical_condition = min(max(technical_condition, 1), 5)

    fauna = _bool_from_text(row.get("fauna") or row.get("has_fauna") or row.get("hasFauna"))
    if fauna is None:
      fauna = False

    priority = _priority_from_text(row.get("priority"))
    pdf_url = row.get("pdf_url") or row.get("pdfUrl") or row.get("passport_url") or row.get("Passport") or None

    try:
      payload_obj = WaterObjectCreate(
        name=row.get("name") or row.get("Name") or "Unnamed object",
        region=row.get("region") or row.get("Region") or "Unknown region",
        resource_type=resource_type,  # type: ignore[arg-type]
        water_type=water_type,  # type: ignore[arg-type]
        fauna=fauna,
        passport_date=passport_date,
        technical_condition=technical_condition,
        latitude=latitude,
        longitude=longitude,
        pdf_url=pdf_url,
        priority=priority,
      )
    except (ValidationError, ValueError) as exc:
      skipped += 1
      skipped_details.append({"row": idx, "reason": f"validation error: {exc}", "data": row})
      continue

    obj = await CreateWaterObject(repo)(payload_obj)
    created.append(WaterObjectResponse.model_validate(asdict(obj)))

  if skipped_details:
    for detail in skipped_details[:5]:
      logger.info("CSV row skipped", extra=detail)

  return {
    "inserted": len(created),
    "skipped": skipped,
    "items": created,
    "skipped_details": skipped_details[:5],
  }
