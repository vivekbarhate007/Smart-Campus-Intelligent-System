"""
Seed script to populate the database with synthetic data
Run with: python seed_data.py
"""
import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).parent / '.env')

from data_generator import generate_and_seed_data

async def main():
    print("Connecting to MongoDB...")
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"Connected to database: {db_name}")
    
    result = await generate_and_seed_data(db)
    
    print("\n=== Seeding Complete ===")
    print(f"Students: {result['students']}")
    print(f"Courses: {result['courses']}")
    print(f"Enrollments: {result['enrollments']}")
    print(f"Engagement Records: {result['engagement_records']}")
    print(f"Predictions: {result['predictions']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
