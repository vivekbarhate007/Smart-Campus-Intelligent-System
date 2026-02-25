"""
Synthetic Data Generator for Smart Campus Analytics
Generates realistic student, course, and engagement data
"""
import random
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict
import math

# Constants
MAJORS = [
    "Computer Science", "Data Science", "Mathematics", "Physics", "Chemistry",
    "Biology", "Psychology", "Economics", "Business Administration", "Engineering",
    "English Literature", "History", "Political Science", "Sociology", "Philosophy"
]

FIRST_NAMES = [
    "James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "Oliver",
    "Isabella", "Ethan", "Mia", "Lucas", "Charlotte", "Mason", "Amelia", "Logan",
    "Harper", "Alexander", "Evelyn", "Aiden", "Luna", "Jackson", "Camila", "Sebastian",
    "Aria", "Mateo", "Penelope", "Henry", "Layla", "Owen", "Chloe", "Daniel", "Ella",
    "Jacob", "Grace", "Michael", "Nora", "Benjamin", "Zoey", "Ryan", "Riley", "David",
    "Lily", "John", "Sofia", "Andrew", "Ellie", "Christopher", "Aubrey"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"
]

COURSE_PREFIXES = {
    "Computer Science": "CS",
    "Data Science": "DS", 
    "Mathematics": "MATH",
    "Physics": "PHYS",
    "Chemistry": "CHEM",
    "Biology": "BIO",
    "Psychology": "PSYCH",
    "Economics": "ECON",
    "Business Administration": "BUS",
    "Engineering": "ENG",
    "English Literature": "ENG",
    "History": "HIST",
    "Political Science": "POLI",
    "Sociology": "SOC",
    "Philosophy": "PHIL"
}

COURSE_NAMES = {
    "CS": ["Intro to Programming", "Data Structures", "Algorithms", "Machine Learning", "Database Systems", 
           "Operating Systems", "Computer Networks", "Software Engineering", "Artificial Intelligence", "Web Development"],
    "DS": ["Data Analytics", "Statistical Learning", "Big Data Systems", "Data Visualization", "Predictive Modeling"],
    "MATH": ["Calculus I", "Calculus II", "Linear Algebra", "Discrete Mathematics", "Statistics", "Probability Theory"],
    "PHYS": ["Physics I", "Physics II", "Quantum Mechanics", "Thermodynamics", "Electromagnetism"],
    "CHEM": ["General Chemistry", "Organic Chemistry", "Biochemistry", "Physical Chemistry", "Analytical Chemistry"],
    "BIO": ["Biology I", "Genetics", "Microbiology", "Cell Biology", "Ecology"],
    "PSYCH": ["Intro to Psychology", "Cognitive Psychology", "Developmental Psychology", "Social Psychology", "Abnormal Psychology"],
    "ECON": ["Microeconomics", "Macroeconomics", "Econometrics", "International Economics", "Financial Economics"],
    "BUS": ["Business Foundations", "Marketing", "Management", "Finance", "Accounting"],
    "ENG": ["English Composition", "American Literature", "British Literature", "Creative Writing", "Technical Writing"],
    "HIST": ["World History", "American History", "European History", "Ancient Civilizations", "Modern History"],
    "POLI": ["Political Theory", "American Government", "International Relations", "Comparative Politics", "Public Policy"],
    "SOC": ["Intro to Sociology", "Social Theory", "Research Methods", "Urban Sociology", "Cultural Sociology"],
    "PHIL": ["Intro to Philosophy", "Ethics", "Logic", "Philosophy of Mind", "Metaphysics"]
}

INSTRUCTORS = [
    "Dr. Sarah Chen", "Prof. Michael Roberts", "Dr. Emily Watson", "Prof. James Miller",
    "Dr. Lisa Park", "Prof. David Anderson", "Dr. Jennifer Lee", "Prof. Robert Taylor",
    "Dr. Maria Garcia", "Prof. Thomas Wilson", "Dr. Amanda Brown", "Prof. Christopher Davis",
    "Dr. Rachel Kim", "Prof. Daniel Martinez", "Dr. Jessica White", "Prof. Kevin Johnson"
]

def generate_student_id() -> str:
    return f"STU{random.randint(100000, 999999)}"

def generate_course_id() -> str:
    return f"CRS{random.randint(10000, 99999)}"

def generate_students(count: int = 5000) -> List[Dict]:
    """Generate synthetic student data"""
    students = []
    
    for i in range(count):
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        name = f"{first_name} {last_name}"
        
        year = random.choices([1, 2, 3, 4], weights=[0.3, 0.28, 0.25, 0.17])[0]
        
        # GPA with realistic distribution
        gpa = min(4.0, max(0.0, random.gauss(2.9, 0.6)))
        
        # Engagement metrics with some correlation to GPA
        base_engagement = (gpa / 4.0) * 0.6 + random.uniform(0, 0.4)
        engagement_score = min(1.0, max(0.0, base_engagement + random.gauss(0, 0.15)))
        
        attendance_rate = min(1.0, max(0.0, engagement_score + random.gauss(0.1, 0.1)))
        
        # Late submission inversely correlated
        late_ratio = max(0, min(1.0, 1 - engagement_score + random.gauss(-0.2, 0.15)))
        
        # Determine risk level based on metrics
        risk_score = (1 - engagement_score) * 0.3 + (1 - attendance_rate) * 0.3 + late_ratio * 0.2 + (1 - gpa/4) * 0.2
        
        if risk_score > 0.6:
            risk_level = "high"
        elif risk_score > 0.35:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        enrollment_year = 2024 - year + 1
        enrollment_date = f"{enrollment_year}-08-{random.randint(15, 31):02d}"
        
        students.append({
            "student_id": generate_student_id(),
            "name": name,
            "email": f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 99)}@campus.edu",
            "major": random.choice(MAJORS),
            "year": year,
            "gpa": round(gpa, 2),
            "enrollment_date": enrollment_date,
            "risk_level": risk_level,
            "engagement_score": round(engagement_score, 3),
            "attendance_rate": round(attendance_rate, 3),
            "late_submission_ratio": round(late_ratio, 3),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    return students

def generate_courses(count: int = 150) -> List[Dict]:
    """Generate synthetic course data"""
    courses = []
    used_codes = set()
    
    for _ in range(count):
        dept = random.choice(list(COURSE_PREFIXES.keys()))
        prefix = COURSE_PREFIXES[dept]
        
        # Generate unique course code
        while True:
            course_num = random.randint(100, 499)
            code = f"{prefix}{course_num}"
            if code not in used_codes:
                used_codes.add(code)
                break
        
        course_name = random.choice(COURSE_NAMES.get(prefix, ["General Studies"]))
        
        # Difficulty based on course level
        base_difficulty = course_num / 500
        difficulty_score = min(1.0, max(0.0, base_difficulty + random.gauss(0, 0.15)))
        
        # Average grade inversely related to difficulty
        avg_grade = max(50, min(100, 85 - difficulty_score * 20 + random.gauss(0, 8)))
        
        # Dropout rate related to difficulty
        dropout_rate = min(0.3, max(0, difficulty_score * 0.2 + random.gauss(0, 0.05)))
        
        term = random.choice(["Fall 2024", "Spring 2025"])
        
        courses.append({
            "course_id": generate_course_id(),
            "code": code,
            "name": f"{course_name}",
            "department": dept,
            "credits": random.choice([3, 4]),
            "difficulty_score": round(difficulty_score, 3),
            "avg_grade": round(avg_grade, 1),
            "dropout_rate": round(dropout_rate, 3),
            "instructor": random.choice(INSTRUCTORS),
            "term": term
        })
    
    return courses

def generate_enrollments(students: List[Dict], courses: List[Dict]) -> List[Dict]:
    """Generate enrollment records"""
    enrollments = []
    
    for student in students:
        # Each student takes 4-6 courses per term
        num_courses = random.randint(4, 6)
        selected_courses = random.sample(courses, min(num_courses, len(courses)))
        
        for course in selected_courses:
            # Grade based on student GPA and course difficulty
            base_grade = student["gpa"] * 25
            difficulty_penalty = course["difficulty_score"] * 15
            grade = min(100, max(0, base_grade - difficulty_penalty + random.gauss(0, 10)))
            
            enrollments.append({
                "enrollment_id": f"ENR{uuid.uuid4().hex[:8].upper()}",
                "student_id": student["student_id"],
                "course_id": course["course_id"],
                "term": course["term"],
                "grade": round(grade, 1),
                "status": random.choices(["active", "completed", "dropped"], weights=[0.3, 0.65, 0.05])[0]
            })
    
    return enrollments

def generate_engagement_history(students: List[Dict]) -> List[Dict]:
    """Generate engagement history for time-series charts"""
    history = []
    
    for student in students:
        base_engagement = student["engagement_score"]
        base_attendance = student["attendance_rate"]
        
        # Generate 12 weeks of data
        for week in range(1, 13):
            # Add some randomness and trend
            trend = -0.02 if student["risk_level"] == "high" else 0.01
            
            engagement = min(1.0, max(0.0, base_engagement + trend * week + random.gauss(0, 0.08)))
            attendance = min(1.0, max(0.0, base_attendance + trend * week + random.gauss(0, 0.06)))
            submissions = min(1.0, max(0.0, 1 - student["late_submission_ratio"] + random.gauss(0, 0.1)))
            
            history.append({
                "student_id": student["student_id"],
                "week": week,
                "date": (datetime.now(timezone.utc) - timedelta(weeks=12-week)).strftime("%Y-%m-%d"),
                "engagement_score": round(engagement, 3),
                "attendance_rate": round(attendance, 3),
                "submission_rate": round(submissions, 3)
            })
    
    return history

def generate_risk_predictions(students: List[Dict]) -> List[Dict]:
    """Generate risk predictions with SHAP values"""
    predictions = []
    
    for student in students:
        # Calculate risk score
        risk_score = (
            (1 - student["engagement_score"]) * 0.25 +
            (1 - student["attendance_rate"]) * 0.25 +
            student["late_submission_ratio"] * 0.25 +
            (1 - student["gpa"] / 4.0) * 0.25
        )
        
        risk_level = student["risk_level"]
        
        # Generate SHAP values (feature importance for this prediction)
        shap_values = {
            "engagement_score": round((0.5 - student["engagement_score"]) * 0.4, 3),
            "attendance_rate": round((0.5 - student["attendance_rate"]) * 0.3, 3),
            "late_submission_ratio": round((student["late_submission_ratio"] - 0.3) * 0.35, 3),
            "gpa": round((2.5 - student["gpa"]) * 0.15, 3),
            "study_hours": round(random.gauss(0, 0.1), 3),
            "assignment_completion": round(random.gauss(-0.05, 0.08), 3)
        }
        
        # Generate recommendations based on risk factors
        recommendations = []
        if student["attendance_rate"] < 0.7:
            recommendations.append("Attend next 2 sessions + set reminder notifications")
        if student["late_submission_ratio"] > 0.4:
            recommendations.append("Enable deadline alerts and calendar reminders")
        if student["engagement_score"] < 0.5:
            recommendations.append("Schedule consistent daily study blocks")
        if student["gpa"] < 2.5:
            recommendations.append("Book advising session to discuss academic support")
        if not recommendations:
            recommendations.append("Maintain current study habits - you're doing great!")
        
        predictions.append({
            "prediction_id": f"PRED{uuid.uuid4().hex[:8].upper()}",
            "student_id": student["student_id"],
            "risk_score": round(risk_score, 3),
            "risk_level": risk_level,
            "confidence": round(random.uniform(0.75, 0.95), 3),
            "features": {
                "engagement_score": student["engagement_score"],
                "attendance_rate": student["attendance_rate"],
                "late_submission_ratio": student["late_submission_ratio"],
                "gpa": student["gpa"],
                "study_hours": round(random.uniform(5, 40), 1),
                "assignment_completion": round(1 - student["late_submission_ratio"] + random.gauss(0, 0.1), 3)
            },
            "shap_values": shap_values,
            "recommendations": recommendations,
            "predicted_at": datetime.now(timezone.utc).isoformat()
        })
    
    return predictions

def generate_engagement_trends() -> List[Dict]:
    """Generate weekly engagement trends for dashboard charts"""
    trends = []
    
    for week in range(1, 13):
        # Simulate realistic trends with mid-term dip
        base = 75
        if week in [6, 7]:  # Mid-term exam week
            base -= 8
        elif week in [11, 12]:  # Finals prep
            base -= 5
        
        trends.append({
            "week": f"Week {week}",
            "week_num": week,
            "engagement": round(base + random.gauss(0, 4), 1),
            "attendance": round(base + 10 + random.gauss(0, 3), 1),
            "submissions": round(base + 5 + random.gauss(0, 3), 1)
        })
    
    return trends

async def generate_and_seed_data(db):
    """Generate and seed all synthetic data to database"""
    print("Generating synthetic data...")
    
    # Generate data
    students = generate_students(500)  # Reduced for faster seeding
    courses = generate_courses(50)
    enrollments = generate_enrollments(students, courses)
    engagement_history = generate_engagement_history(students)
    predictions = generate_risk_predictions(students)
    trends = generate_engagement_trends()
    
    # Clear existing data
    await db.students.delete_many({})
    await db.courses.delete_many({})
    await db.enrollments.delete_many({})
    await db.engagement_history.delete_many({})
    await db.risk_predictions.delete_many({})
    await db.engagement_trends.delete_many({})
    
    # Insert data
    if students:
        await db.students.insert_many(students)
        print(f"Inserted {len(students)} students")
    
    if courses:
        await db.courses.insert_many(courses)
        print(f"Inserted {len(courses)} courses")
    
    if enrollments:
        await db.enrollments.insert_many(enrollments)
        print(f"Inserted {len(enrollments)} enrollments")
    
    if engagement_history:
        await db.engagement_history.insert_many(engagement_history)
        print(f"Inserted {len(engagement_history)} engagement records")
    
    if predictions:
        await db.risk_predictions.insert_many(predictions)
        print(f"Inserted {len(predictions)} predictions")
    
    if trends:
        await db.engagement_trends.insert_many(trends)
        print(f"Inserted {len(trends)} trend records")
    
    # Create indexes
    await db.students.create_index("student_id", unique=True)
    await db.students.create_index("risk_level")
    await db.students.create_index("email")
    await db.courses.create_index("course_id", unique=True)
    await db.courses.create_index("code")
    await db.enrollments.create_index("student_id")
    await db.enrollments.create_index("course_id")
    await db.engagement_history.create_index([("student_id", 1), ("week", 1)])
    await db.risk_predictions.create_index("student_id")
    
    print("Data seeding complete!")
    
    return {
        "students": len(students),
        "courses": len(courses),
        "enrollments": len(enrollments),
        "engagement_records": len(engagement_history),
        "predictions": len(predictions)
    }

if __name__ == "__main__":
    # Test data generation
    students = generate_students(10)
    print(f"Generated {len(students)} students")
    print(students[0])
