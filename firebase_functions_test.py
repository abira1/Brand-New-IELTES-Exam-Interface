#!/usr/bin/env python3
"""
Firebase Functions Testing Suite for IELTS Platform
Tests the Firebase Cloud Functions backend running on port 5001
"""

import requests
import json
import os
import sys
import tempfile
import zipfile
from datetime import datetime
from pathlib import Path

# Firebase Functions URL
FUNCTIONS_URL = "http://localhost:5001"

print(f"🔍 Testing Firebase Functions at: {FUNCTIONS_URL}")
print("=" * 60)

class FirebaseFunctionsTester:
    def __init__(self):
        self.base_url = FUNCTIONS_URL
        self.test_results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        self.created_exam_id = None
        self.created_submission_id = None
    
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
    
    def test_health_check(self):
        """Test GET /healthCheck endpoint"""
        try:
            response = requests.get(f"{self.base_url}/healthCheck", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['status', 'service', 'timestamp']
                
                if all(field in data for field in required_fields):
                    if data['status'] == 'ok':
                        self.log_test("Health Check", True, f"Service: {data.get('service', 'Unknown')}")
                        return True
                    else:
                        self.log_test("Health Check", False, f"Status not OK: {data['status']}")
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Health Check", False, f"Missing fields: {missing}")
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_get_students(self):
        """Test GET /getStudents endpoint"""
        try:
            response = requests.get(f"{self.base_url}/getStudents", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    self.log_test("Get Students", True, f"Retrieved {len(data)} students")
                    return data
                else:
                    self.log_test("Get Students", False, "Response is not a list")
                    return None
            else:
                self.log_test("Get Students", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            self.log_test("Get Students", False, f"Request error: {str(e)}")
            return None
    
    def test_update_student_status(self):
        """Test POST /updateStudentStatus endpoint"""
        try:
            test_data = {
                "studentId": "test_student_001",
                "status": "approved"
            }
            
            response = requests.post(
                f"{self.base_url}/updateStudentStatus",
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') == True:
                    self.log_test("Update Student Status", True, f"Updated student: {test_data['studentId']}")
                    return True
                else:
                    self.log_test("Update Student Status", False, f"Success flag not true: {data}")
                    return False
            else:
                self.log_test("Update Student Status", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Update Student Status", False, f"Request error: {str(e)}")
            return False
    
    def test_get_exams(self):
        """Test GET /getExams endpoint"""
        try:
            response = requests.get(f"{self.base_url}/getExams", timeout=10)
            
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
    
    def test_save_exam(self):
        """Test POST /saveExam endpoint"""
        try:
            test_exam = {
                "title": "IELTS Practice Test - Automated Test",
                "description": "Test exam created by automated testing",
                "type": "practice",
                "duration": 60,
                "totalQuestions": 10,
                "status": "draft",
                "questions": [
                    {
                        "id": "q1",
                        "number": 1,
                        "type": "mcq_single",
                        "section": "Reading",
                        "text": "What is the capital of Australia?",
                        "options": [
                            {"id": "a", "text": "Sydney", "correct": False},
                            {"id": "b", "text": "Melbourne", "correct": False},
                            {"id": "c", "text": "Canberra", "correct": True},
                            {"id": "d", "text": "Perth", "correct": False}
                        ],
                        "points": 1
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/saveExam",
                json=test_exam,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') == True and 'examId' in data:
                    self.created_exam_id = data['examId']
                    self.log_test("Save Exam", True, f"Created exam with ID: {self.created_exam_id}")
                    return data
                else:
                    self.log_test("Save Exam", False, f"Missing success or examId: {data}")
                    return None
            else:
                self.log_test("Save Exam", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            self.log_test("Save Exam", False, f"Request error: {str(e)}")
            return None
    
    def test_get_exam_by_id(self):
        """Test GET /getExamById endpoint"""
        if not self.created_exam_id:
            self.log_test("Get Exam By ID", False, "No exam ID available (save exam test failed)")
            return None
        
        try:
            response = requests.get(
                f"{self.base_url}/getExamById",
                params={'id': self.created_exam_id},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if 'id' in data and data['id'] == self.created_exam_id:
                    self.log_test("Get Exam By ID", True, f"Retrieved exam: {data.get('title', 'Unknown')}")
                    return data
                else:
                    self.log_test("Get Exam By ID", False, f"ID mismatch or missing: {data}")
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
        """Test POST /submitExam endpoint"""
        if not self.created_exam_id:
            self.log_test("Submit Exam", False, "No exam ID available (save exam test failed)")
            return None
        
        try:
            submission_data = {
                "examId": self.created_exam_id,
                "studentId": "test_student_001",
                "answers": {
                    "q1": "c"
                },
                "timeSpent": 1800
            }
            
            response = requests.post(
                f"{self.base_url}/submitExam",
                json=submission_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') == True and 'submissionId' in data:
                    self.created_submission_id = data['submissionId']
                    self.log_test("Submit Exam", True, f"Created submission: {self.created_submission_id}")
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
        """Test GET /getSubmissions endpoint"""
        try:
            response = requests.get(f"{self.base_url}/getSubmissions", timeout=10)
            
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
    
    def test_delete_exam(self):
        """Test POST /deleteExam endpoint"""
        if not self.created_exam_id:
            self.log_test("Delete Exam", False, "No exam ID available (save exam test failed)")
            return None
        
        try:
            delete_data = {
                "examId": self.created_exam_id
            }
            
            response = requests.post(
                f"{self.base_url}/deleteExam",
                json=delete_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') == True:
                    self.log_test("Delete Exam", True, f"Deleted exam: {self.created_exam_id}")
                    return True
                else:
                    self.log_test("Delete Exam", False, f"Success flag not true: {data}")
                    return False
            else:
                self.log_test("Delete Exam", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Delete Exam", False, f"Request error: {str(e)}")
            return False
    
    def create_sample_zip(self):
        """Create a minimal sample ZIP file for testing"""
        try:
            # Create a temporary ZIP file
            temp_dir = tempfile.mkdtemp()
            zip_path = os.path.join(temp_dir, "sample_exam.zip")
            
            with zipfile.ZipFile(zip_path, 'w') as zip_file:
                # Add a sample XHTML file
                xhtml_content = '''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Reading Test</title>
</head>
<body>
    <div connect:class="assessmentItemRef" connect:identifier="q1">
        <p class="question-text">What is the main idea of the passage?</p>
        <div class="option">A) Option A</div>
        <div class="option correct">B) Option B</div>
        <div class="option">C) Option C</div>
        <div class="option">D) Option D</div>
    </div>
    <div connect:class="assessmentItemRef" connect:identifier="q2">
        <p class="question-text">Fill in the blank: The capital of Australia is ____.</p>
    </div>
</body>
</html>'''
                zip_file.writestr("Reading/Multiple Choice (one answer)/test.xhtml", xhtml_content)
                
                # Add a sample CSS file
                css_content = "body { font-family: Arial, sans-serif; }"
                zip_file.writestr("styles/main.css", css_content)
            
            return zip_path
        except Exception as e:
            print(f"Error creating sample ZIP: {e}")
            return None
    
    def test_upload_zip(self):
        """Test POST /uploadZip endpoint"""
        zip_path = self.create_sample_zip()
        if not zip_path:
            self.log_test("Upload ZIP", False, "Could not create sample ZIP file")
            return None
        
        try:
            with open(zip_path, 'rb') as zip_file:
                files = {'file': ('sample_exam.zip', zip_file, 'application/zip')}
                data = {'examTitle': 'IELTS Practice Test - ZIP Upload Test'}
                
                response = requests.post(
                    f"{self.base_url}/uploadZip",
                    files=files,
                    data=data,
                    timeout=30
                )
            
            # Clean up temp file
            os.unlink(zip_path)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') == True and 'examId' in data:
                    exam_data = data.get('data', {})
                    self.log_test("Upload ZIP", True, 
                                f"Imported exam: {exam_data.get('title', 'Unknown')} "
                                f"({exam_data.get('totalQuestions', 0)} questions)")
                    return data
                else:
                    self.log_test("Upload ZIP", False, f"Missing success or examId: {data}")
                    return None
            else:
                self.log_test("Upload ZIP", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            self.log_test("Upload ZIP", False, f"Request error: {str(e)}")
            return None
        except Exception as e:
            self.log_test("Upload ZIP", False, f"Error: {str(e)}")
            return None
    
    def test_error_handling(self):
        """Test API error handling"""
        print("\n🔍 Testing Error Handling...")
        
        # Test missing required fields
        try:
            response = requests.post(
                f"{self.base_url}/updateStudentStatus",
                json={},  # Missing required fields
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 400:
                self.log_test("Error Handling - Missing Fields", True, "Correctly rejected missing fields")
            else:
                self.log_test("Error Handling - Missing Fields", False, f"Expected 400, got {response.status_code}")
        except requests.exceptions.RequestException as e:
            self.log_test("Error Handling - Missing Fields", False, f"Request error: {str(e)}")
        
        # Test non-existent exam
        try:
            response = requests.get(
                f"{self.base_url}/getExamById",
                params={'id': 'non_existent_exam_id'},
                timeout=10
            )
            
            if response.status_code == 404:
                self.log_test("Error Handling - Not Found", True, "Correctly returns 404 for non-existent exam")
            else:
                self.log_test("Error Handling - Not Found", False, f"Expected 404, got {response.status_code}")
        except requests.exceptions.RequestException as e:
            self.log_test("Error Handling - Not Found", False, f"Request error: {str(e)}")
    
    def run_all_tests(self):
        """Run all Firebase Functions tests"""
        print("🚀 Starting Firebase Functions Tests...")
        print("=" * 60)
        
        # Test health check first
        if not self.test_health_check():
            print("\n❌ Health check failed. Firebase Functions may not be running.")
            return self.get_summary()
        
        print("\n🔍 Testing Student Management APIs...")
        self.test_get_students()
        self.test_update_student_status()
        
        print("\n🔍 Testing Exam Management APIs...")
        self.test_get_exams()
        self.test_save_exam()
        self.test_get_exam_by_id()
        
        print("\n🔍 Testing ZIP Upload...")
        self.test_upload_zip()
        
        print("\n🔍 Testing Submission APIs...")
        self.test_submit_exam()
        self.test_get_submissions()
        
        print("\n🔍 Testing Error Handling...")
        self.test_error_handling()
        
        print("\n🔍 Cleanup...")
        self.test_delete_exam()
        
        return self.get_summary()
    
    def get_summary(self):
        """Get test summary"""
        print("\n" + "=" * 60)
        print("📊 FIREBASE FUNCTIONS TEST SUMMARY")
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
    tester = FirebaseFunctionsTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if results['failed'] > 0:
        sys.exit(1)
    else:
        sys.exit(0)