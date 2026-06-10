from pathlib import Path
import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS

# ==================================================
# APP
# ==================================================

app = Flask(__name__)
CORS(app)

# ==================================================
# PATHS
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

DISTRICT_FILE = DATA_DIR / "district_master.csv"

# ✅ FIXED FILE NAME (IMPORTANT CHANGE)
CURRENT_FILE = DATA_DIR / "Forecast_Weather.csv"
FORECAST_FILE = DATA_DIR / "Forecast_Weather.csv"

# ==================================================
# HOME
# ==================================================

@app.route("/")
def home():
    return jsonify({
        "service": "India District Weather API",
        "status": "running",
        "version": "2.0"
    })

# ==================================================
# DISTRICTS
# ==================================================

@app.route("/api/districts")
def districts():
    if not DISTRICT_FILE.exists():
        return jsonify([])

    df = pd.read_csv(DISTRICT_FILE)

    districts = sorted(
        df["District"]
        .dropna()
        .astype(str)
        .unique()
        .tolist()
    )

    return jsonify(districts)

# ==================================================
# DISTRICT LOCATIONS
# ==================================================

@app.route("/api/locations")
def locations():
    if not DISTRICT_FILE.exists():
        return jsonify([])

    df = pd.read_csv(DISTRICT_FILE)

    result = df[["District", "State", "Latitude", "Longitude"]].to_dict(orient="records")
    return jsonify(result)

# ==================================================
# CURRENT WEATHER (ALL DISTRICTS)
# ==================================================

@app.route("/api/latest")
def latest():
    if not CURRENT_FILE.exists():
        return jsonify({
            "error": "Forecast_Weather.csv not found"
        }), 404

    df = pd.read_csv(CURRENT_FILE)

    return jsonify(df.to_dict(orient="records"))

# ==================================================
# CURRENT WEATHER BY DISTRICT
# ==================================================

@app.route("/api/latest/<district>")
def latest_district(district):
    if not CURRENT_FILE.exists():
        return jsonify([])

    df = pd.read_csv(CURRENT_FILE)

    result = df[df["district"].str.lower() == district.lower()]

    return jsonify(result.to_dict(orient="records"))

# ==================================================
# FORECAST ALL
# ==================================================

@app.route("/api/forecast")
def forecast():
    if not FORECAST_FILE.exists():
        return jsonify({
            "error": "Forecast_Weather.csv not found"
        }), 404

    df = pd.read_csv(FORECAST_FILE)

    return jsonify(df.to_dict(orient="records"))

# ==================================================
# FORECAST BY DISTRICT
# ==================================================

@app.route("/api/forecast/<district>")
def forecast_district(district):
    if not FORECAST_FILE.exists():
        return jsonify([])

    df = pd.read_csv(FORECAST_FILE)

    result = df[df["district"].str.lower() == district.lower()]

    return jsonify(result.to_dict(orient="records"))

# ==================================================
# TEMPERATURE TREND
# ==================================================

@app.route("/api/forecast/<district>/temperature")
def temperature_forecast(district):
    if not FORECAST_FILE.exists():
        return jsonify([])

    df = pd.read_csv(FORECAST_FILE)

    df = df[df["district"].str.lower() == district.lower()]

    result = df[["forecast_time", "temperature"]]

    return jsonify(result.to_dict(orient="records"))

# ==================================================
# HUMIDITY TREND
# ==================================================

@app.route("/api/forecast/<district>/humidity")
def humidity_forecast(district):
    if not FORECAST_FILE.exists():
        return jsonify([])

    df = pd.read_csv(FORECAST_FILE)

    df = df[df["district"].str.lower() == district.lower()]

    result = df[["forecast_time", "humidity"]]

    return jsonify(result.to_dict(orient="records"))

# ==================================================
# WEATHER SUMMARY
# ==================================================

@app.route("/api/summary")
def summary():
    if not CURRENT_FILE.exists():
        return jsonify({})

    df = pd.read_csv(CURRENT_FILE)

    return jsonify({
        "districts": int(len(df)),
        "average_temperature": round(float(df["temperature"].mean()), 2),
        "max_temperature": round(float(df["temperature"].max()), 2),
        "min_temperature": round(float(df["temperature"].min()), 2)
    })

# ==================================================
# HEALTH CHECK
# ==================================================

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy"
    })

# ==================================================
# RUN APP
# ==================================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
