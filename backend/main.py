from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .model import FEATURE_NAMES, ConditionRiskModel, risk_model


class PredictRequest(BaseModel):
    """Validated payload describing one hydro asset."""

    technical_condition: int = Field(..., ge=1, le=5)
    passport_age_years: float = Field(..., ge=0)
    resource_type: int = Field(..., ge=0, le=2)
    water_type: int = Field(..., ge=0, le=1)
    fauna: int = Field(..., ge=0, le=1)
    region_id: int = Field(..., ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "technical_condition": 4,
                "passport_age_years": 12,
                "resource_type": 1,
                "water_type": 0,
                "fauna": 1,
                "region_id": 5,
            }
        }

    def to_feature_payload(self) -> dict[str, float]:
        """Helper that keeps the response handler compact."""
        return self.model_dump()


class PredictResponse(BaseModel):
    """Normalized probability of переход в категории 4–5."""

    risk: float


class RiskPredictionService:
    """Thin wrapper that keeps FastAPI endpoints lean."""

    def __init__(self, model: ConditionRiskModel):
        self._model = model

    def score(self, request: PredictRequest) -> float:
        return self._model.predict_risk(request.to_feature_payload())


prediction_service = RiskPredictionService(risk_model)


def get_prediction_service() -> RiskPredictionService:
    return prediction_service


app = FastAPI(title="Hydro Asset Risk API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/predict", response_model=PredictResponse)
def predict(
    request: PredictRequest,
    service: RiskPredictionService = Depends(get_prediction_service),
) -> PredictResponse:
    risk = service.score(request)
    return PredictResponse(risk=risk)


@app.get("/features")
def available_features() -> dict:
    return {"features": FEATURE_NAMES}

