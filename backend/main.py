from crop_recommendation import get_crop_recommendations, analyze_selected_crop
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from ml_prediction import predict_soil
from analysis import analyze_soil

app = FastAPI(
    title="SoilSense AI API",
    description="Soil fertility assessment backend",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://soil-sense-tau.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class SoilData(BaseModel):
    nitrogen: float = Field(ge=0, le=10000)
    phosphorus: float = Field(ge=0, le=10000)
    potassium: float = Field(ge=0, le=10000)
    ph: float = Field(ge=0, le=14)
    organic_carbon: float = Field(ge=0, le=100)

class SelectedCropData(SoilData):
    crop_name: str
@app.get("/")
def home():
    return {
        "message": "Welcome to SoilSense AI Backend",
        "status": "Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "SoilSense AI"
    }


@app.post("/analyze")
def soil_analysis(data: SoilData):
    return analyze_soil(data)
@app.post("/predict")
def predict(data: SoilData):

    features = [
        data.nitrogen,
        data.phosphorus,
        data.potassium,
        data.ph,
        data.organic_carbon
    ]

    return predict_soil(features)
@app.post("/crop-recommendations")
def crop_recommendations(data: SoilData):
    return get_crop_recommendations(data)


@app.post("/analyze-crop")
def analyze_crop(data: SelectedCropData):
    return analyze_selected_crop(data, data.crop_name) 