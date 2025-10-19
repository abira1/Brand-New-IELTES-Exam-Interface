from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import db as firebase_db
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Firebase initialization
try:
    # Try to initialize with service account key
    service_account_key = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')
    if service_account_key:
        # If it's a JSON string, parse it
        if isinstance(service_account_key, str) and service_account_key.startswith('{'):
            cred_dict = json.loads(service_account_key)
        else:
            # Otherwise, assume it's a path to a file
            with open(service_account_key) as f:
                cred_dict = json.load(f)

        firebase_admin.initialize_app(options={
            'databaseURL': os.environ.get('FIREBASE_DATABASE_URL')
        })
    else:
        # Use default credentials (for local development or Cloud Run)
        firebase_admin.initialize_app(options={
            'databaseURL': os.environ.get('FIREBASE_DATABASE_URL')
        })
except ValueError:
    # Firebase app already initialized
    pass

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)

    # Convert to dict and serialize datetime to ISO string for Firebase
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()

    # Save to Firebase Realtime Database
    try:
        ref = firebase_db.reference('status_checks').child(status_obj.id)
        ref.set(doc)
    except Exception as e:
        logger.error(f"Error saving status check to Firebase: {str(e)}")
        raise

    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Retrieve from Firebase Realtime Database
    try:
        ref = firebase_db.reference('status_checks')
        data = ref.get().val()

        if not data:
            return []

        # Convert data to list of StatusCheck objects
        status_checks = []
        for key, value in data.items():
            if isinstance(value['timestamp'], str):
                value['timestamp'] = datetime.fromisoformat(value['timestamp'])
            status_checks.append(StatusCheck(**value))

        return status_checks
    except Exception as e:
        logger.error(f"Error retrieving status checks from Firebase: {str(e)}")
        return []

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Firebase cleanup is handled automatically by the SDK
# No explicit shutdown needed for Firebase Realtime Database