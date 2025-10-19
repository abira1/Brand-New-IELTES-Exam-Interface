#!/usr/bin/env python3
"""
Phase 5 Backend Testing Suite for IELTS Student Portal
Tests the new Phase 5 endpoints for exam progress functionality
"""

import requests
import json
import sys

# Firebase Functions server URL (local emulator)
FIREBASE_FUNCTIONS_URL = "http://localhost:5001"

print(f"🔍 Testing Phase 5 Backend Endpoints at: {FIREBASE_FUNCTIONS_URL}")
print("=" * 60)

class Phase5Tester:
    def __init__(self):
        self.api_url = FIREBASE_FUNCTIONS_URL
        self.test_results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        # Test data for Phase 5 endpoints
        self.test_exam_id = "test-exam-001"
        self.test_student_id = "test-student-001"
        self.test_progress_data = {
            "examId": self.test_exam_id,
            "studentId": self.test_student_id,
            "answers": {"q1": "A", "q2": "B", "q3": "C"},
            "reviewFlags": [0, 2],
            "currentQuestionIndex": 2,
            "timeSpent": 300
        }
    
    def log_test(self, test_name, success, message=""):
        """Log test results"""
        self.test_results['total_tests'] += 1
        if success:
            self.test_results['passed'] += 1
            print(f"✅ {test_name}: PASSED {message}")
        else:
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: FAILED - {message}")
    
    def test_server_connectivity(self):
        """Test if the Firebase Functions server is reachable"""
        try:
            response = requests.get(f"{self.api_url}/healthCheck", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok' and 'IELTS Platform Functions' in data.get('service', ''):
                    self.log_test("Firebase Functions Connectivity", True, "Firebase Functions server is reachable")
                    return True
                else:
                    self.log_test("Firebase Functions Connectivity", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Firebase Functions Connectivity", False, f"HTTP {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Firebase Functions Connectivity", False, f"Connection error: {str(e)}")
            return False
    
    def test_save_progress(self):
        """Test POST /saveProgress endpoint - Phase 5 auto-save functionality"""
        try:
            response = requests.post(
                f"{self.api_url}/saveProgress",
                json=self.test_progress_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True:
                    self.log_test("Save Progress", True, f"Progress saved for exam {self.test_exam_id}")
                    return True
                else:
                    self.log_test("Save Progress", False, f"Success flag not true: {data}")
                    return False
            else:
                self.log_test("Save Progress", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Save Progress", False, f"Request error: {str(e)}")
            return False
    
    def test_get_progress(self):
        """Test GET /getProgress endpoint - Phase 5 progress retrieval"""
        try:
            params = {
                'examId': self.test_exam_id,
                'studentId': self.test_student_id
            }
            
            response = requests.get(
                f"{self.api_url}/getProgress",
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                progress = data.get('progress')
                
                if progress is not None:
                    # Verify the progress data matches what we saved
                    if (progress.get('examId') == self.test_exam_id and
                        progress.get('studentId') == self.test_student_id and
                        progress.get('answers') is not None):
                        self.log_test("Get Progress", True, f"Retrieved progress with {len(progress.get('answers', {}))} answers")
                        return progress
                    else:
                        self.log_test("Get Progress", False, f"Progress data mismatch: {progress}")
                        return None
                else:
                    # Progress might be null if none exists - this is valid
                    self.log_test("Get Progress", True, "No progress found (null response - valid)")
                    return None
            else:
                self.log_test("Get Progress", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            self.log_test("Get Progress", False, f"Request error: {str(e)}")
            return None
    
    def test_clear_progress(self):
        """Test POST /clearProgress endpoint - Phase 5 progress cleanup"""
        try:
            clear_data = {
                "examId": self.test_exam_id,
                "studentId": self.test_student_id
            }
            
            response = requests.post(
                f"{self.api_url}/clearProgress",
                json=clear_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True:
                    self.log_test("Clear Progress", True, f"Progress cleared for exam {self.test_exam_id}")
                    return True
                else:
                    self.log_test("Clear Progress", False, f"Success flag not true: {data}")
                    return False
            else:
                self.log_test("Clear Progress", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Clear Progress", False, f"Request error: {str(e)}")
            return False
    
    def test_get_exams(self):
        """Test GET /getExams endpoint - Existing functionality verification"""
        try:
            response = requests.get(f"{self.api_url}/getExams", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Exams", True, f"Retrieved {len(data)} exams")
                    return data
                else:
                    self.log_test("Get Exams", False, "Response is not a list")
                    return None
            else:
                self.log_test("Get Exams", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            self.log_test("Get Exams", False, f"Request error: {str(e)}")
            return None
    
    def test_get_exam_by_id(self):
        """Test GET /getExamById endpoint - Existing functionality verification"""
        # First get available exams to test with
        exams = self.test_get_exams()
        if not exams or len(exams) == 0:
            self.log_test("Get Exam By ID", False, "No exams available to test with")
            return None
        
        # Use the first exam ID
        exam_id = exams[0].get('id')
        if not exam_id:
            self.log_test("Get Exam By ID", False, "No exam ID found in exam list")
            return None
        
        try:
            params = {'id': exam_id}
            response = requests.get(
                f"{self.api_url}/getExamById",
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('id') == exam_id:
                    self.log_test("Get Exam By ID", True, f"Retrieved exam: {data.get('title', 'Unknown')}")
                    return data
                else:
                    self.log_test("Get Exam By ID", False, f"ID mismatch: expected {exam_id}, got {data.get('id')}")
                    return None
            elif response.status_code == 404:
                self.log_test("Get Exam By ID", False, "Exam not found (404)")
                return None
            else:
                self.log_test("Get Exam By ID", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            self.log_test("Get Exam By ID", False, f"Request error: {str(e)}")
            return None
    
    def test_submit_exam(self):
        """Test POST /submitExam endpoint - Existing functionality verification"""
        # Get available exams first
        exams = self.test_get_exams()
        if not exams or len(exams) == 0:
            self.log_test("Submit Exam", False, "No exams available to test with")
            return None
        
        exam_id = exams[0].get('id')
        if not exam_id:
            self.log_test("Submit Exam", False, "No exam ID found")
            return None
        
        try:
            submission_data = {
                "examId": exam_id,
                "studentId": self.test_student_id,
                "answers": {"q1": "A", "q2": "B"},
                "timeSpent": 1800
            }
            
            response = requests.post(
                f"{self.api_url}/submitExam",
                json=submission_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True and 'submissionId' in data:
                    self.log_test("Submit Exam", True, f"Created submission: {data['submissionId']}")
                    return data
                else:
                    self.log_test("Submit Exam", False, f"Missing success or submissionId: {data}")
                    return None
            else:
                self.log_test("Submit Exam", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            self.log_test("Submit Exam", False, f"Request error: {str(e)}")
            return None
    
    def test_get_submissions(self):
        """Test GET /getSubmissions endpoint - Existing functionality verification"""
        try:
            response = requests.get(f"{self.api_url}/getSubmissions", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Submissions", True, f"Retrieved {len(data)} submissions")
                    return data
                else:
                    self.log_test("Get Submissions", False, "Response is not a list")
                    return None
            else:
                self.log_test("Get Submissions", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            self.log_test("Get Submissions", False, f"Request error: {str(e)}")
            return None
    
    def run_all_tests(self):
        """Run all Phase 5 backend endpoint tests"""
        print("🚀 Starting Phase 5 IELTS Student Portal Backend Tests...")
        print("=" * 60)
        
        # Test server connectivity first
        if not self.test_server_connectivity():
            print("\n❌ Firebase Functions server not reachable. Stopping tests.")
            return self.get_summary()
        
        # Phase 5 New Endpoints Tests
        print("\n🆕 Testing Phase 5 New Endpoints...")
        print("Testing exam progress auto-save functionality...")
        
        # Test the complete progress workflow
        self.test_save_progress()
        self.test_get_progress()
        self.test_clear_progress()
        
        # Verify progress is cleared by testing get again
        print("\n🔍 Verifying progress cleared...")
        progress_after_clear = self.test_get_progress()
        if progress_after_clear is None:
            self.log_test("Progress Cleared Verification", True, "Progress successfully cleared")
        else:
            self.log_test("Progress Cleared Verification", False, "Progress still exists after clear")
        
        # Existing Endpoints Verification
        print("\n✅ Testing Existing Endpoints...")
        self.test_get_exams()
        self.test_get_exam_by_id()
        self.test_submit_exam()
        self.test_get_submissions()
        
        return self.get_summary()
    
    def get_summary(self):
        """Get test summary"""
        print("\n" + "=" * 60)
        print("📊 PHASE 5 BACKEND TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.test_results['total_tests']}")
        print(f"Passed: {self.test_results['passed']}")
        print(f"Failed: {self.test_results['failed']}")
        
        if self.test_results['errors']:
            print("\n❌ FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"  - {error}")
        
        success_rate = (self.test_results['passed'] / self.test_results['total_tests']) * 100 if self.test_results['total_tests'] > 0 else 0
        print(f"\n✅ Success Rate: {success_rate:.1f}%")
        
        return {
            'success_rate': success_rate,
            'total_tests': self.test_results['total_tests'],
            'passed': self.test_results['passed'],
            'failed': self.test_results['failed'],
            'errors': self.test_results['errors']
        }

if __name__ == "__main__":
    tester = Phase5Tester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if results['failed'] > 0:
        sys.exit(1)
    else:
        sys.exit(0)