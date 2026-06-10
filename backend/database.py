from pathlib import Path

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    DateTime
)

from sqlalchemy.orm import (
    declarative_base,
    sessionmaker
)

# ==================================================
# PATHS
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_FILE = DATA_DIR / "weather_history.db"

DATABASE_URL = f"sqlite:///{DB_FILE}"

# ==================================================
# DATABASE ENGINE
# ==================================================

engine = create_engine(
    DATABASE_URL,
    echo=False
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# ==================================================
# CURRENT WEATHER TABLE
# ==================================================

class DistrictWeather(Base):

    __tablename__ = "district_weather"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    timestamp = Column(DateTime)

    state = Column(String(100))

    district = Column(String(100))

    temperature = Column(Float)

    humidity = Column(Float)

    pressure = Column(Float)

    wind_speed = Column(Float)

    cloudiness = Column(Float)

    weather = Column(String(100))

    description = Column(String(255))

# ==================================================
# FORECAST WEATHER TABLE
# ==================================================

class ForecastWeather(Base):

    __tablename__ = "forecast_weather"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    state = Column(String(100))

    district = Column(String(100))

    forecast_time = Column(DateTime)

    temperature = Column(Float)

    humidity = Column(Float)

    pressure = Column(Float)

    wind_speed = Column(Float)

    cloudiness = Column(Float)

    weather = Column(String(100))

    description = Column(String(255))

    created_at = Column(DateTime)

# ==================================================
# DATABASE FUNCTIONS
# ==================================================

def create_database():
    """
    Create all tables if they don't exist
    """
    Base.metadata.create_all(bind=engine)


def get_session():
    """
    Get database session
    """
    return SessionLocal()

# ==================================================
# TEST DATABASE
# ==================================================

if __name__ == "__main__":

    create_database()

    print("\n===================================")
    print("Database Created Successfully")
    print("===================================")
    print(f"Database File : {DB_FILE}")
    print("Tables:")
    print(" - district_weather")
    print(" - forecast_weather")
    print("===================================\n")