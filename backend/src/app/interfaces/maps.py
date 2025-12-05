from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from dataclasses import asdict

from app.infrastructure.supabase.water_objects import WaterObjectRepositorySupabase
from app.core.deps import get_water_object_repository
from app.schemas.water_object import WaterObjectQuery
from app.application.water_objects.use_cases import ListWaterObjects


class MapCoordinates(BaseModel):
  lat: float
  lng: float


class MapPosition(BaseModel):
  x: float
  y: float


class MapObject(BaseModel):
  id: str
  name: str
  region: str
  resourceType: str
  waterType: str
  hasFauna: bool
  passportDate: date
  condition: int
  priority: str
  coordinates: MapCoordinates
  position: MapPosition
  image: str
  pdfUrl: str | None = None


MAP_OBJECTS: list[MapObject] = [
  MapObject(
    id="1",
    name="Kushkakul Lake",
    region="Jizzakh region",
    resourceType="lake",
    waterType="saline",
    hasFauna=True,
    passportDate=date.fromisoformat("2024-03-12"),
    condition=3,
    priority="medium",
    coordinates=MapCoordinates(lat=46.1, lng=74.0),
    position=MapPosition(x=58, y=34),
    image="/kushkakul-lake-jizzakh-green-nature.jpg",
  ),
  MapObject(
    id="2",
    name="Aydar Lake",
    region="Navoi region",
    resourceType="lake",
    waterType="saline",
    hasFauna=True,
    passportDate=date.fromisoformat("2023-11-05"),
    condition=2,
    priority="low",
    coordinates=MapCoordinates(lat=46.2, lng=81.6),
    position=MapPosition(x=78, y=30),
    image="/aydar-lake-desert-uzbekistan.jpg",
  ),
  MapObject(
    id="3",
    name="Charvak Reservoir",
    region="Tashkent region",
    resourceType="lake",
    waterType="fresh",
    hasFauna=True,
    passportDate=date.fromisoformat("2024-01-28"),
    condition=2,
    priority="low",
    coordinates=MapCoordinates(lat=48.7, lng=85.7),
    position=MapPosition(x=88, y=18),
    image="/charvak-reservoir-mountains-blue-water.jpg",
  ),
  MapObject(
    id="4",
    name="Andijan Reservoir",
    region="Andijan region",
    resourceType="reservoir",
    waterType="fresh",
    hasFauna=True,
    passportDate=date.fromisoformat("2024-04-18"),
    condition=4,
    priority="high",
    coordinates=MapCoordinates(lat=43.85, lng=77.16),
    position=MapPosition(x=66, y=42),
    image="/andijan-reservoir-dam-water.jpg",
  ),
  MapObject(
    id="5",
    name="Kampyrkalin Reservoir",
    region="Kashkadarya region",
    resourceType="reservoir",
    waterType="fresh",
    hasFauna=True,
    passportDate=date.fromisoformat("2023-09-07"),
    condition=3,
    priority="medium",
    coordinates=MapCoordinates(lat=49.6, lng=83.0),
    position=MapPosition(x=82, y=16),
    image="/kampyrkalin-reservoir-blue-water.jpg",
  ),
  MapObject(
    id="6",
    name="Aral Sea",
    region="Karakalpakstan",
    resourceType="lake",
    waterType="saline",
    hasFauna=False,
    passportDate=date.fromisoformat("2023-12-15"),
    condition=5,
    priority="high",
    coordinates=MapCoordinates(lat=50.5, lng=69.3),
    position=MapPosition(x=48, y=18),
    image="/aral-sea-dried-ships-desert.jpg",
  ),
  MapObject(
    id="7",
    name="Fergana Canal",
    region="Fergana valley",
    resourceType="canal",
    waterType="fresh",
    hasFauna=True,
    passportDate=date.fromisoformat("2024-02-02"),
    condition=1,
    priority="low",
    coordinates=MapCoordinates(lat=49.8, lng=73.1),
    position=MapPosition(x=55, y=22),
    image="/fergana-canal-irrigation-water.jpg",
  ),
  MapObject(
    id="8",
    name="Amu Darya Canal",
    region="Khorezm region",
    resourceType="canal",
    waterType="fresh",
    hasFauna=True,
    passportDate=date.fromisoformat("2024-05-30"),
    condition=2,
    priority="low",
    coordinates=MapCoordinates(lat=42.5, lng=69.0),
    position=MapPosition(x=48, y=60),
    image="/amu-darya-river-khorezm.jpg",
  ),
  MapObject(
    id="9",
    name="Surkhan Reservoir",
    region="Surkhandarya region",
    resourceType="reservoir",
    waterType="fresh",
    hasFauna=True,
    passportDate=date.fromisoformat("2024-06-18"),
    condition=4,
    priority="high",
    coordinates=MapCoordinates(lat=41.3, lng=68.3),
    position=MapPosition(x=44, y=70),
    image="/surkhan-reservoir-mountains-green.jpg",
  ),
  MapObject(
    id="10",
    name="Tudakul Lake",
    region="Bukhara region",
    resourceType="lake",
    waterType="fresh",
    hasFauna=True,
    passportDate=date.fromisoformat("2023-10-21"),
    condition=3,
    priority="medium",
    coordinates=MapCoordinates(lat=45.5, lng=78.5),
    position=MapPosition(x=69, y=32),
    image="/tudakul-reservoir-dried-lake.jpg",
  ),
  MapObject(
    id="11",
    name="Issyk-Kul Lake",
    region="Eastern Tashkent",
    resourceType="lake",
    waterType="fresh",
    hasFauna=True,
    passportDate=date.fromisoformat("2024-07-05"),
    condition=1,
    priority="low",
    coordinates=MapCoordinates(lat=43.35, lng=77.17),
    position=MapPosition(x=66, y=48),
    image="/charvak-reservoir-mountains-blue-water.jpg",
  ),
  MapObject(
    id="12",
    name="Kyzylkol Lake",
    region="North Kazakhstan",
    resourceType="lake",
    waterType="fresh",
    hasFauna=True,
    passportDate=date.fromisoformat("2023-08-19"),
    condition=2,
    priority="low",
    coordinates=MapCoordinates(lat=53.2, lng=69.6),
    position=MapPosition(x=49, y=10),
    image="/kushkakul-lake-jizzakh-region-green-nature-birds.jpg",
  ),
]

router = APIRouter()


@router.get("/maps", response_model=list[MapObject])
async def list_map_objects(repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository)) -> list[MapObject]:
  objects = await ListWaterObjects(repo)(WaterObjectQuery(limit=200))
  if not objects:
    return MAP_OBJECTS
  result: list[MapObject] = []
  for obj in objects:
    data = asdict(obj)
    result.append(
      MapObject(
        id=data["id"],
        name=data["name"],
        region=data["region"],
        resourceType=data["resource_type"],
        waterType="fresh" if data["water_type"] == "fresh" else "saline",
        hasFauna=data["fauna"],
        passportDate=data["passport_date"],
        condition=data["technical_condition"],
        priority="high" if data.get("priority") == 3 else "medium" if data.get("priority") == 2 else "low",
        coordinates=MapCoordinates(lat=data["latitude"], lng=data["longitude"]),
        position=MapPosition(x=0, y=0),
        image="/placeholder.svg",
        pdfUrl=data.get("pdf_url"),
      )
    )
  return result
