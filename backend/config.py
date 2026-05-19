# config.py
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey123")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwtsecretkey123")
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'hospital.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = True
    ROLES = ['Admin', 'Doctor', 'Patient', 'Sub-Admin']
    DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    CORS_ORIGINS = ["http://localhost:5173"]  # React frontend
    JWT_EXPIRATION_HOURS = 24

config = {
    'development': Config,
    'production': Config
}
