from dataclasses import asdict
from datetime import datetime, date
from io import StringIO
import csv
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile
from pydantic import ValidationError

from app.application.water_objects.use_cases import CreateWaterObject, GetWaterObject, ListWaterObjects
from app.core.deps import get_water_object_repository, get_computed_metrics_repository
from app.infrastructure.supabase.computed_metrics import ComputedMetricsRepositorySupabase
from app.infrastructure.supabase.water_objects import WaterObjectRepositorySupabase
from app.models.condition_model import (
  calculate_priority_score,
  compute_technical_condition,
  marker_color_for_condition,
  PRIORITY_CATEGORY_TO_VALUE,
)
from app.schemas.water_object import WaterObjectCreate, WaterObjectQuery, WaterObjectResponse

router = APIRouter(prefix="/water-objects", tags=["water_objects"])
logger = logging.getLogger(__name__)

CSV_COLUMN_ALIASES: dict[str, list[str]] = {
  "name": ["name", "Name"],
  "region": ["region", "Region"],
  "district": ["district"],
  "resource_type": ["resource_type", "resourceType", "ResourceType"],
  "water_type": ["water_type", "waterType", "WaterType"],
  "fauna": ["fauna", "has_fauna", "hasFauna"],
  "passport_date": ["passport_date", "passportDate", "date"],
  "latitude": ["latitude", "lat", "Latitude", "Lat"],
  "longitude": ["longitude", "lon", "Longitude", "Lon"],
  "coord_center": ["coord_center"],
  "coord_north": ["coord_north"],
  "coord_south": ["coord_south"],
  "coord_east": ["coord_east"],
  "coord_west": ["coord_west"],
  "length_m": ["length_m"],
  "width_m": ["width_m"],
  "area_ha": ["area_ha"],
  "depth_max_m": ["depth_max_m"],
  "depth_avg_m": ["depth_avg_m"],
  "depth_min_m": ["depth_min_m"],
  "vegetation_surface": ["vegetation_surface", "vegetation_surfa"],
  "vegetation_underwater": ["vegetation_underwater", "vegetation_unde"],
  "phytoplankton_level": ["phytoplankton_level", "phytoplankton_le"],
  "fish_presence": ["fish_presence"],
  "invertebrates": ["invertebrates"],
  "fish_productivity": ["fish_productivity"],
  "pdf_url": ["pdf_url", "pdfUrl", "passport_url", "Passport"],
}

CANONICAL_COLUMNS = list(CSV_COLUMN_ALIASES.keys())
ALLOWED_HEADERS = {alias.lower() for aliases in CSV_COLUMN_ALIASES.values() for alias in aliases}


def _normalize_header(value: str | None) -> str:
  return (value or "").strip().lower()


def _validate_headers(headers: list[str]) -> None:
  normalized_headers = [_normalize_header(name) for name in headers if name]

  missing = []
  for canonical, aliases in CSV_COLUMN_ALIASES.items():
    if not any(_normalize_header(alias) in normalized_headers for alias in aliases):
      missing.append(canonical)

  extra = [header for header in normalized_headers if header and header not in ALLOWED_HEADERS]

  if missing or extra:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail=(
        "Неподдерживаемый формат CSV. "
        f"Ожидаемые колонки: {', '.join(CANONICAL_COLUMNS)}."
      ),
    )


def _row_value(row: dict[str, str], canonical: str) -> str | None:
  aliases = CSV_COLUMN_ALIASES.get(canonical, [])
  for alias in aliases:
    for candidate in {alias, alias.lower()}:
      if candidate in row and row[candidate] not in (None, ""):
        return row[candidate]
      # DictReader сохраняет исходный регистр, пробуем матчить вручную
      for key, value in row.items():
        if key and key.strip().lower() == candidate and value not in (None, ""):
          return value
  return None


def _normalize_water_type(value: str | None) -> str | None:
  if value is None:
    return None
  normalized = value.strip().lower()
  fresh_values = {"fresh", "presnaya", "пресная", "пресная вода", "пресн.", "несоленая", "не соленая"}
  non_fresh_values = {
    "non_fresh",
    "non-fresh",
    "saline",
    "solenaya",
    "соленая",
    "солёная",
    "солоноватая",
    "непресная",
  }
  if normalized in fresh_values:
    return "fresh"
  if normalized in non_fresh_values:
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
  if "водохранилищ" in normalized or "гтс" in normalized:
    return "reservoir"
  if "канал" in normalized:
    return "canal"
  if "озер" in normalized or "озёр" in normalized:
    return "lake"
  return None


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
  metrics_repo: ComputedMetricsRepositorySupabase = Depends(get_computed_metrics_repository),
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
  metrics_map = await metrics_repo.get_by_object_ids([obj.id for obj in objects])

  responses: list[WaterObjectResponse] = []
  for obj in objects:
    data = asdict(obj)
    metric = metrics_map.get(obj.id)
    if metric:
      if metric.get("technical_condition") is not None:
        data["technical_condition"] = int(metric["technical_condition"])
      category = metric.get("priority_category")
      if category:
        data["priority_category"] = category
        data["priority"] = PRIORITY_CATEGORY_TO_VALUE.get(category, data.get("priority"))
      if metric.get("priority_score") is not None:
        data["priority_score"] = int(metric["priority_score"])
      if metric.get("marker_color"):
        data["marker_color"] = metric["marker_color"]
    responses.append(WaterObjectResponse.model_validate(data))
  return responses


@router.post("", response_model=WaterObjectResponse, status_code=status.HTTP_201_CREATED)
async def create_water_object(
  payload: WaterObjectCreate, repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository)
):
  obj = await CreateWaterObject(repo)(payload)
  return WaterObjectResponse.model_validate(asdict(obj))


@router.get("/{object_id}", response_model=WaterObjectResponse)
async def get_water_object(
  object_id: str,
  repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository),
  metrics_repo: ComputedMetricsRepositorySupabase = Depends(get_computed_metrics_repository),
):
  obj = await GetWaterObject(repo)(object_id)
  if obj is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Water object not found")
  data = asdict(obj)
  metric = (await metrics_repo.get_by_object_ids([obj.id])).get(obj.id)
  if metric:
    if metric.get("technical_condition") is not None:
      data["technical_condition"] = int(metric["technical_condition"])
    category = metric.get("priority_category")
    if category:
      data["priority_category"] = category
      data["priority"] = PRIORITY_CATEGORY_TO_VALUE.get(category, data.get("priority"))
    if metric.get("priority_score") is not None:
      data["priority_score"] = int(metric["priority_score"])
    if metric.get("marker_color"):
      data["marker_color"] = metric["marker_color"]
  return WaterObjectResponse.model_validate(data)


@router.get("/{object_id}/priority")
async def get_water_object_priority(
  object_id: str,
  repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository),
  metrics_repo: ComputedMetricsRepositorySupabase = Depends(get_computed_metrics_repository),
):
  obj = await GetWaterObject(repo)(object_id)
  if obj is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Water object not found")
  metric = (await metrics_repo.get_by_object_ids([obj.id])).get(obj.id)
  priority_value = obj.priority
  if metric and metric.get("priority_category"):
    priority_value = PRIORITY_CATEGORY_TO_VALUE.get(metric["priority_category"], priority_value)
  return {"id": obj.id, "priority": priority_value}


@router.post("/import-csv", status_code=status.HTTP_201_CREATED)
async def import_water_objects(
  file: UploadFile = File(...),
  repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository),
  metrics_repo: ComputedMetricsRepositorySupabase = Depends(get_computed_metrics_repository),
):
  payload = await file.read()
  try:
    decoded = payload.decode("utf-8-sig")
  except UnicodeDecodeError:
    decoded = payload.decode("cp1251", errors="ignore")

  reader = csv.DictReader(StringIO(decoded))
  if not reader.fieldnames:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CSV не содержит заголовок.")

  _validate_headers(reader.fieldnames)

  created: list[WaterObjectResponse] = []
  skipped = 0
  skipped_details: list[dict] = []

  for idx, row in enumerate(reader, start=1):
    normalized_row = {key: _row_value(row, key) for key in CANONICAL_COLUMNS}

    resource_type = _normalize_resource_type(normalized_row.get("resource_type")) or "reservoir"
    water_type = _normalize_water_type(normalized_row.get("water_type")) or "fresh"

    try:
      passport_date_raw = normalized_row.get("passport_date")
      if not passport_date_raw:
        raise ValueError("passport_date is required")
      passport_date = _parse_date(passport_date_raw)
      if passport_date is None:
        raise ValueError("passport_date invalid")

      latitude_value = normalized_row.get("latitude")
      longitude_value = normalized_row.get("longitude")
      latitude = float(latitude_value) if latitude_value not in (None, "") else None
      longitude = float(longitude_value) if longitude_value not in (None, "") else None
      if latitude is None or longitude is None:
        raise ValueError("coordinates are required")
    except (ValueError, TypeError) as exc:
      skipped += 1
      reason = f"parse error: {exc}"
      skipped_details.append({"row": idx, "reason": reason, "data": row})
      logger.info("CSV row skipped: %s", reason, extra={"row": idx})
      continue

    compute_payload = {
      "passport_date": passport_date_raw,
      "depth_max_m": normalized_row.get("depth_max_m"),
      "vegetation_surface": normalized_row.get("vegetation_surface"),
      "vegetation_underwater": normalized_row.get("vegetation_underwater"),
      "phytoplankton_level": normalized_row.get("phytoplankton_level"),
      "fish_presence": normalized_row.get("fish_presence"),
      "fish_productivity": normalized_row.get("fish_productivity"),
    }

    try:
      technical_condition = compute_technical_condition(compute_payload)
    except Exception as exc:  # noqa: BLE001 - хотим записать причину в CSV отчёт
      skipped += 1
      reason = f"condition calc error: {exc}"
      skipped_details.append({"row": idx, "reason": reason, "data": row})
      logger.info("CSV row skipped: %s", reason, extra={"row": idx})
      continue

    priority_score, priority_category = calculate_priority_score(passport_date, technical_condition)
    priority_numeric = PRIORITY_CATEGORY_TO_VALUE[priority_category]
    marker_color = marker_color_for_condition(technical_condition)

    fauna = _bool_from_text(normalized_row.get("fauna"))
    if fauna is None:
      fauna = False

    pdf_url = normalized_row.get("pdf_url")

    try:
      payload_obj = WaterObjectCreate(
        name=normalized_row.get("name") or "Unnamed object",
        region=normalized_row.get("region") or "Unknown region",
        resource_type=resource_type,  # type: ignore[arg-type]
        water_type=water_type,  # type: ignore[arg-type]
        fauna=fauna,
        passport_date=passport_date,
        technical_condition=technical_condition,
        latitude=latitude,
        longitude=longitude,
        pdf_url=pdf_url,
        priority=priority_numeric,
      )
    except (ValidationError, ValueError) as exc:
      skipped += 1
      reason = f"validation error: {exc}"
      skipped_details.append({"row": idx, "reason": reason, "data": row})
      logger.info("CSV row skipped: %s", reason, extra={"row": idx})
      continue

    obj = await CreateWaterObject(repo)(payload_obj)
    await metrics_repo.upsert_metric(
      {
        "object_id": obj.id,
        "technical_condition": technical_condition,
        "priority_score": priority_score,
        "priority_category": priority_category,
        "marker_color": marker_color,
      }
    )

    obj_dict = asdict(obj)
    obj_dict["technical_condition"] = technical_condition
    obj_dict["priority"] = priority_numeric
    obj_dict["priority_category"] = priority_category
    obj_dict["priority_score"] = priority_score
    obj_dict["marker_color"] = marker_color
    created.append(WaterObjectResponse.model_validate(obj_dict))

  if skipped_details:
    for detail in skipped_details[:5]:
      logger.info("CSV row skipped detail", extra=detail)

  return {
    "inserted": len(created),
    "skipped": skipped,
    "items": created,
    "skipped_details": skipped_details[:5],
  }
