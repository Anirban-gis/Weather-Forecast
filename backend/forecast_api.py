from pathlib import Path
from datetime import datetime
import pandas as pd
import requests
import time

from backend.config import API_KEY
from backend.database import (
    create_database,
    get_session,
   ForecastWeather
)

# ==================================================
# PATHS
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DISTRICT_FILE = DATA_DIR / "district_master.csv"

OUTPUT_FILE = DATA_DIR / "Forecast_Weather.csv"

URL = "https://api.openweathermap.org/data/2.5/forecast"

# ==================================================
# FETCH HOURLY FORECAST
# ==================================================

def fetch_hourly_forecast():

    if not DISTRICT_FILE.exists():
        raise FileNotFoundError(
            f"District file not found: {DISTRICT_FILE}"
        )

    create_database()

    session = get_session()

    districts = pd.read_csv(DISTRICT_FILE)

    results = []

    success = 0
    failed = 0

    print(f"\nReading: {DISTRICT_FILE}")
    print(f"Total Districts: {len(districts)}\n")

    for _, row in districts.iterrows():

        state = str(row["State"]).strip()
        district = str(row["District"]).strip()

        lat = float(row["Latitude"])
        lon = float(row["Longitude"])

        try:

            response = requests.get(
                URL,
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": API_KEY,
                    "units": "metric"
                },
                timeout=30
            )

            response.raise_for_status()

            data = response.json()

            if "list" not in data:
                print(f"✗ No forecast data: {district}")
                failed += 1
                continue

            for item in data["list"]:

                forecast_time = datetime.fromtimestamp(
                    item["dt"]
                )

                record = ForecastWeather(

                    state=state,

                    district=district,

                    forecast_time=forecast_time,

                    temperature=item["main"].get("temp"),

                    humidity=item["main"].get("humidity"),

                    weather=item["weather"][0].get("main"),

                    description=item["weather"][0].get("description"),

                    created_at=datetime.now()
                )

                session.add(record)

                results.append({

                    "state":
                        state,

                    "district":
                        district,

                    "forecast_time":
                        forecast_time,

                    "temperature":
                        item["main"].get("temp"),

                    "humidity":
                        item["main"].get("humidity"),

                    "weather":
                        item["weather"][0].get("main"),

                    "description":
                        item["weather"][0].get("description")
                })

            success += 1

            print(
                f"✓ {district} | "
                f"{len(data['list'])} forecasts"
            )

            time.sleep(1)

        except Exception as e:

            failed += 1

            print(
                f"✗ {district}: {e}"
            )

    # ==========================================
    # SAVE SQLITE
    # ==========================================

    session.commit()
    session.close()

    # ==========================================
    # SAVE CSV
    # ==========================================

    if len(results) > 0:

        df = pd.DataFrame(results)

        df.to_csv(
            OUTPUT_FILE,
            index=False
        )

        print(
            f"\nCSV Saved: {OUTPUT_FILE}"
        )

    print(
        f"\nCompleted"
        f"\nSuccess: {success}"
        f"\nFailed: {failed}"
    )

# ==================================================
# MAIN
# ==================================================

if __name__ == "__main__":

    fetch_hourly_forecast()