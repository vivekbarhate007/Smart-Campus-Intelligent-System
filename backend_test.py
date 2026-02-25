#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class SmartCampusAPITester:
    def __init__(self, base_url="https://risk-intel-dash-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            
        result = {
            "test_name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def test_health_endpoint(self):
        """Test health check endpoint"""
        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Status: {data.get('status', 'unknown')}"
            else:
                details = f"Status code: {response.status_code}"
                
            self.log_test("Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def create_test_session(self):
        """Create test user and session in MongoDB for protected endpoints"""
        try:
            import subprocess
            import uuid
            
            # Generate test credentials
            timestamp = int(datetime.now().timestamp())
            self.user_id = f"test-user-{timestamp}"
            self.session_token = f"test_session_{timestamp}"
            
            # MongoDB command to create test user and session
            mongo_cmd = f'''
            use test_database;
            db.users.insertOne({{
              user_id: "{self.user_id}",
              email: "test.user.{timestamp}@example.com",
              name: "Test User",
              picture: "https://via.placeholder.com/150",
              role: "ADVISOR",
              created_at: new Date()
            }});
            db.user_sessions.insertOne({{
              user_id: "{self.user_id}",
              session_token: "{self.session_token}",
              expires_at: new Date(Date.now() + 7*24*60*60*1000),
              created_at: new Date()
            }});
            '''
            
            # Execute MongoDB command
            result = subprocess.run(['mongosh', '--eval', mongo_cmd], 
                                  capture_output=True, text=True, timeout=30)
            
            success = result.returncode == 0
            self.log_test("Create Test Session", success, 
                         f"User ID: {self.user_id}, Session: {self.session_token[:20]}...")
            return success
            
        except Exception as e:
            self.log_test("Create Test Session", False, f"Exception: {str(e)}")
            return False

    def test_protected_endpoint(self, endpoint, method="GET", data=None):
        """Test protected endpoint with session token"""
        try:
            headers = {
                'Authorization': f'Bearer {self.session_token}',
                'Content-Type': 'application/json'
            }
            
            url = f"{self.api_url}/{endpoint}"
            
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=10)
            
            success = response.status_code == 200
            
            if success:
                try:
                    resp_data = response.json()
                    details = f"Response keys: {list(resp_data.keys()) if isinstance(resp_data, dict) else 'non-dict response'}"
                except:
                    details = f"Status: {response.status_code}"
            else:
                details = f"Status code: {response.status_code}, Response: {response.text[:100]}"
            
            self.log_test(f"{method} /{endpoint}", success, details)
            return success, response.json() if success else {}
            
        except Exception as e:
            self.log_test(f"{method} /{endpoint}", False, f"Exception: {str(e)}")
            return False, {}

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting Smart Campus Analytics API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic health check first
        if not self.test_health_endpoint():
            print("❌ Health check failed - stopping tests")
            return self.generate_report()
        
        # Create test session for protected endpoints
        if not self.create_test_session():
            print("❌ Could not create test session - testing public endpoints only")
            return self.generate_report()
            
        # Test protected endpoints
        endpoints_to_test = [
            "auth/me",
            "analytics/overview", 
            "analytics/risk-distribution",
            "analytics/engagement-trend",
            "analytics/course-difficulty",
            "analytics/burnout-heatmap",
            "students?limit=5",
            "courses?limit=5"
        ]
        
        print("\n📡 Testing Protected Endpoints...")
        for endpoint in endpoints_to_test:
            self.test_protected_endpoint(endpoint)
        
        return self.generate_report()
    
    def generate_report(self):
        """Generate test report"""
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        print(f"✅ Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        failed_tests = [t for t in self.test_results if not t['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  - {test['test_name']}: {test['details']}")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": self.tests_passed/self.tests_run if self.tests_run > 0 else 0,
            "test_results": self.test_results,
            "session_token": self.session_token,
            "user_id": self.user_id
        }

def main():
    tester = SmartCampusAPITester()
    report = tester.run_all_tests()
    
    # Return exit code based on results
    return 0 if report["success_rate"] >= 0.8 else 1

if __name__ == "__main__":
    sys.exit(main())