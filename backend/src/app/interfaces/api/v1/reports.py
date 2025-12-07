import io
from pathlib import Path
import zipfile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.core.deps import get_supabase_client, get_water_object_repository
from app.infrastructure.supabase.client import SupabaseClient
from app.infrastructure.supabase.water_objects import WaterObjectRepositorySupabase


router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/passports/upload-zip")
async def upload_passport_zip(
  archive: UploadFile = File(...),
  repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository),
  supabase: SupabaseClient = Depends(get_supabase_client),
):
  if not archive.filename or not archive.filename.lower().endswith(".zip"):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Поддерживаются только ZIP архивы.")

  raw = await archive.read()
  try:
    zip_file = zipfile.ZipFile(io.BytesIO(raw))
  except zipfile.BadZipFile as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Некорректный ZIP: {exc}") from exc

  settings = get_settings()
  bucket = settings.supabase_storage_bucket

  summary: dict[str, int | list[dict[str, str]]] = {"processed": 0, "uploaded": 0, "skipped": 0, "items": []}

  for item in zip_file.infolist():
    if item.is_dir():
      continue
    if not item.filename.lower().endswith(".pdf"):
      continue

    summary["processed"] = int(summary["processed"]) + 1

    content = zip_file.read(item)
    file_name = Path(item.filename).stem.strip()
    if not file_name:
      summary["skipped"] = int(summary["skipped"]) + 1
      continue

    normalized_name = file_name.replace("_", " ").replace("-", " ").strip()
    obj = await repo.get_by_name(normalized_name)
    if obj is None:
      summary["skipped"] = int(summary["skipped"]) + 1
      continue

    storage_path = f"passports/{obj.id}.pdf"
    await supabase.upload_to_bucket(bucket, storage_path, content, content_type="application/pdf", upsert=True)
    public_url = supabase.get_public_url(bucket, storage_path)
    await repo.update_pdf_url(obj.id, public_url)

    summary["uploaded"] = int(summary["uploaded"]) + 1
    summary["items"].append({"object_id": obj.id, "name": obj.name, "pdf_url": public_url})

  return summary

