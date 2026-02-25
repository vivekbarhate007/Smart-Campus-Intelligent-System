from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Query
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Smart Campus Analytics API", version="1.0.0")

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
students_router = APIRouter(prefix="/students", tags=["Students"])
courses_router = APIRouter(prefix="/courses", tags=["Courses"])
analytics_router = APIRouter(prefix="/analytics", tags=["Analytics"])
predictions_router = APIRouter(prefix="/predictions", tags=["Predictions"])
jobs_router = APIRouter(prefix="/jobs", tags=["Jobs"])

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "STUDENT"  # ADMIN, ADVISOR, STUDENT
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Student(BaseModel):
    model_config = ConfigDict(extra="ignore")
    student_id: str
    name: str
    email: str
    major: str
    year: int
    gpa: float
    enrollment_date: str
    risk_level: str = "low"  # low, medium, high
    engagement_score: float = 0.0
    attendance_rate: float = 0.0
    late_submission_ratio: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    course_id: str
    code: str
    name: str
    department: str
    credits: int
    difficulty_score: float = 0.0
    avg_grade: float = 0.0
    dropout_rate: float = 0.0
    instructor: str
    term: str

class Enrollment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    enrollment_id: str
    student_id: str
    course_id: str
    term: str
    grade: Optional[float] = None
    status: str = "active"

class RiskPrediction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    prediction_id: str
    student_id: str
    risk_score: float
    risk_level: str
    confidence: float
    features: Dict[str, float]
    shap_values: Dict[str, float]
    recommendations: List[str]
    predicted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ===================== AUTH HELPERS =====================

async def get_current_user(request: Request) -> User:
    """Get current user from session token (cookie or header)"""
    # Check cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry with timezone awareness
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Find user
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

def require_role(allowed_roles: List[str]):
    """Dependency to check user role"""
    async def role_checker(user: User = Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

# ===================== AUTH ROUTES =====================

@auth_router.post("/session")
async def exchange_session(request: Request, response: Response):
    """Exchange Emergent session_id for local session"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth to get session data
    async with httpx.AsyncClient() as client_http:
        try:
            resp = await client_http.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session_id")
            
            session_data = resp.json()
        except httpx.RequestError:
            raise HTTPException(status_code=500, detail="Auth service unavailable")
    
    email = session_data.get("email")
    name = session_data.get("name")
    picture = session_data.get("picture")
    session_token = session_data.get("session_token")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "role": "ADVISOR",  # Default role for new users
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Remove old sessions for this user
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user

@auth_router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current user info"""
    return user.model_dump()

@auth_router.post("/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out"}

# ===================== STUDENTS ROUTES =====================

@students_router.get("")
async def get_students(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    risk_level: Optional[str] = None,
    course_id: Optional[str] = None,
    search: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Get paginated list of students with filters"""
    query = {}
    
    if risk_level:
        query["risk_level"] = risk_level
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"student_id": {"$regex": search, "$options": "i"}}
        ]
    
    skip = (page - 1) * limit
    
    total = await db.students.count_documents(query)
    students = await db.students.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    return {
        "students": students,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@students_router.get("/{student_id}")
async def get_student(student_id: str, user: User = Depends(get_current_user)):
    """Get student by ID with full details"""
    student = await db.students.find_one({"student_id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get enrollments
    enrollments = await db.enrollments.find({"student_id": student_id}, {"_id": 0}).to_list(100)
    
    # Get risk prediction
    prediction = await db.risk_predictions.find_one(
        {"student_id": student_id}, 
        {"_id": 0},
        sort=[("predicted_at", -1)]
    )
    
    # Get engagement history
    engagement_history = await db.engagement_history.find(
        {"student_id": student_id}, 
        {"_id": 0}
    ).sort("date", 1).to_list(100)
    
    return {
        "student": student,
        "enrollments": enrollments,
        "prediction": prediction,
        "engagement_history": engagement_history
    }

# ===================== COURSES ROUTES =====================

@courses_router.get("")
async def get_courses(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    department: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Get paginated list of courses"""
    query = {}
    if department:
        query["department"] = department
    
    skip = (page - 1) * limit
    total = await db.courses.count_documents(query)
    courses = await db.courses.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    return {
        "courses": courses,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@courses_router.get("/{course_id}")
async def get_course(course_id: str, user: User = Depends(get_current_user)):
    """Get course details"""
    course = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get enrollment stats
    enrollments = await db.enrollments.find({"course_id": course_id}, {"_id": 0}).to_list(1000)
    
    return {
        "course": course,
        "enrollment_count": len(enrollments),
        "enrollments": enrollments[:50]
    }

# ===================== ANALYTICS ROUTES =====================

@analytics_router.get("/overview")
async def get_overview(user: User = Depends(get_current_user)):
    """Get dashboard overview KPIs"""
    total_students = await db.students.count_documents({})
    
    at_risk_count = await db.students.count_documents({"risk_level": "high"})
    medium_risk_count = await db.students.count_documents({"risk_level": "medium"})
    low_risk_count = await db.students.count_documents({"risk_level": "low"})
    
    # Calculate averages
    pipeline = [
        {"$group": {
            "_id": None,
            "avg_engagement": {"$avg": "$engagement_score"},
            "avg_attendance": {"$avg": "$attendance_rate"},
            "avg_gpa": {"$avg": "$gpa"}
        }}
    ]
    
    stats = await db.students.aggregate(pipeline).to_list(1)
    avg_stats = stats[0] if stats else {"avg_engagement": 0, "avg_attendance": 0, "avg_gpa": 0}
    
    # Burnout weeks (students with engagement drop)
    burnout_count = await db.students.count_documents({
        "engagement_score": {"$lt": 0.4},
        "late_submission_ratio": {"$gt": 0.5}
    })
    
    return {
        "total_students": total_students,
        "at_risk_count": at_risk_count,
        "medium_risk_count": medium_risk_count,
        "low_risk_count": low_risk_count,
        "avg_engagement_score": round(avg_stats.get("avg_engagement", 0) * 100, 1),
        "avg_attendance_rate": round(avg_stats.get("avg_attendance", 0) * 100, 1),
        "avg_gpa": round(avg_stats.get("avg_gpa", 0), 2),
        "burnout_weeks_detected": burnout_count,
        "total_courses": await db.courses.count_documents({})
    }

@analytics_router.get("/risk-distribution")
async def get_risk_distribution(user: User = Depends(get_current_user)):
    """Get risk distribution for charts"""
    pipeline = [
        {"$group": {"_id": "$risk_level", "count": {"$sum": 1}}}
    ]
    
    results = await db.students.aggregate(pipeline).to_list(10)
    
    distribution = {"high": 0, "medium": 0, "low": 0}
    for r in results:
        if r["_id"] in distribution:
            distribution[r["_id"]] = r["count"]
    
    return distribution

@analytics_router.get("/engagement-trend")
async def get_engagement_trend(user: User = Depends(get_current_user)):
    """Get engagement trend over time"""
    # Get aggregated engagement by week
    trend_data = await db.engagement_trends.find({}, {"_id": 0}).sort("week", 1).to_list(52)
    
    if not trend_data:
        # Generate sample trend data
        trend_data = []
        for i in range(12):
            trend_data.append({
                "week": f"Week {i+1}",
                "engagement": round(random.uniform(60, 85), 1),
                "attendance": round(random.uniform(70, 95), 1)
            })
    
    return trend_data

@analytics_router.get("/course-difficulty")
async def get_course_difficulty(user: User = Depends(get_current_user)):
    """Get course difficulty leaderboard"""
    courses = await db.courses.find({}, {"_id": 0}).sort("difficulty_score", -1).limit(10).to_list(10)
    return courses

@analytics_router.get("/burnout-heatmap")
async def get_burnout_heatmap(user: User = Depends(get_current_user)):
    """Get burnout heatmap data by week and day"""
    # Generate heatmap data
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    heatmap = []
    
    for week in range(1, 13):
        for day_idx, day in enumerate(days):
            intensity = random.uniform(0.1, 1.0)
            # Higher intensity mid-week and during exam weeks
            if day_idx in [2, 3] or week in [6, 12]:
                intensity = min(1.0, intensity + 0.3)
            
            heatmap.append({
                "week": week,
                "day": day,
                "intensity": round(intensity, 2)
            })
    
    return heatmap

# ===================== PREDICTIONS ROUTES =====================

@predictions_router.get("/risk")
async def get_risk_prediction(
    student_id: str = Query(...),
    user: User = Depends(get_current_user)
):
    """Get risk prediction for a student"""
    prediction = await db.risk_predictions.find_one(
        {"student_id": student_id},
        {"_id": 0},
        sort=[("predicted_at", -1)]
    )
    
    if not prediction:
        raise HTTPException(status_code=404, detail="No prediction found for student")
    
    return prediction

# ===================== JOBS ROUTES (ADMIN ONLY) =====================

@jobs_router.post("/run-etl")
async def run_etl(user: User = Depends(require_role(["ADMIN"]))):
    """Run ETL pipeline (admin only)"""
    # In production, this would trigger the ETL process
    return {"status": "ETL job started", "job_id": str(uuid.uuid4())}

@jobs_router.post("/train-models")
async def train_models(user: User = Depends(require_role(["ADMIN"]))):
    """Train ML models (admin only)"""
    # In production, this would trigger model training
    return {"status": "Model training started", "job_id": str(uuid.uuid4())}

@jobs_router.post("/seed-data")
async def seed_data(user: User = Depends(require_role(["ADMIN"]))):
    """Seed database with synthetic data (admin only)"""
    from data_generator import generate_and_seed_data
    await generate_and_seed_data(db)
    return {"status": "Data seeding complete"}

# ===================== HEALTH CHECK =====================

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@api_router.get("/")
async def root():
    return {"message": "Smart Campus Analytics API", "version": "1.0.0"}

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(students_router)
api_router.include_router(courses_router)
api_router.include_router(analytics_router)
api_router.include_router(predictions_router)
api_router.include_router(jobs_router)

app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
