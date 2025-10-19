#!/usr/bin/env python3
"""
Phase 4 Admin Dashboard Backend Integration Test Suite
Testing Firebase Functions server running on port 5001

Test Scenarios:
1. Health Check & Server Status
2. Student Management APIs
3. Exam Management APIs
4. Submission Management APIs
5. JSON Import System
6. Dashboard Statistics
"""

import requests
import json
import time
import os
from typing import Dict, Any, List, Optional

class FirebaseFunctionsTestSuite:
    def __init__(self):
        self.base_url = "http://localhost:5001"
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def test_health_check(self):
        """Test 1: Health Check & Server Status"""
        print("=== TEST 1: HEALTH CHECK & SERVER STATUS ===")
        
        try:
            response = requests.get(f"{self.base_url}/healthCheck", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok' and 'service' in data:
                    self.log_test(
                        "Health Check Endpoint", 
                        True, 
                        f"Server running: {data.get('service')}, Status: {data.get('status')}"
                    )
                else:
                    self.log_test(
                        "Health Check Endpoint", 
                        False, 
                        "Invalid health check response format",
                        data
                    )
            else:
                self.log_test(
                    "Health Check Endpoint", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "Health Check Endpoint", 
                False, 
                f"Connection error: {str(e)}"
            )

    def test_student_management(self):
        """Test 2: Student Management APIs"""
        print("=== TEST 2: STUDENT MANAGEMENT APIS ===")
        
        # Test GET /getStudents
        try:
            response = requests.get(f"{self.base_url}/getStudents", timeout=10)
            
            if response.status_code == 200:
                students = response.json()
                if isinstance(students, list):
                    self.log_test(
                        "GET /getStudents", 
                        True, 
                        f"Retrieved {len(students)} students"
                    )
                else:
                    self.log_test(
                        "GET /getStudents", 
                        False, 
                        "Response is not a list",
                        students
                    )
            else:
                self.log_test(
                    "GET /getStudents", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "GET /getStudents", 
                False, 
                f"Request error: {str(e)}"
            )
        
        # Test POST /updateStudentStatus
        try:
            test_data = {
                "studentId": "test_student_123",
                "status": "approved"
            }
            
            response = requests.post(
                f"{self.base_url}/updateStudentStatus", 
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "POST /updateStudentStatus", 
                        True, 
                        f"Student status updated: {data.get('message')}"
                    )
                else:
                    self.log_test(
                        "POST /updateStudentStatus", 
                        False, 
                        "Success flag not true",
                        data
                    )
            else:
                self.log_test(
                    "POST /updateStudentStatus", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "POST /updateStudentStatus", 
                False, 
                f"Request error: {str(e)}"
            )

    def test_exam_management(self):
        """Test 3: Exam Management APIs"""
        print("=== TEST 3: EXAM MANAGEMENT APIS ===")
        
        # Test GET /getExams (light metadata for dashboard)
        try:
            response = requests.get(f"{self.base_url}/getExams", timeout=10)
            
            if response.status_code == 200:
                exams = response.json()
                if isinstance(exams, list):
                    self.log_test(
                        "GET /getExams (Dashboard Metadata)", 
                        True, 
                        f"Retrieved {len(exams)} exam metadata entries"
                    )
                else:
                    self.log_test(
                        "GET /getExams (Dashboard Metadata)", 
                        False, 
                        "Response is not a list",
                        exams
                    )
            else:
                self.log_test(
                    "GET /getExams (Dashboard Metadata)", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "GET /getExams (Dashboard Metadata)", 
                False, 
                f"Request error: {str(e)}"
            )
        
        # Test POST /saveExam for exam creation
        try:
            test_exam = {
                "title": "Test Admin Dashboard Exam",
                "description": "Test exam for admin dashboard integration",
                "type": "practice",
                "duration": 60,
                "totalQuestions": 5,
                "status": "draft",
                "questions": [
                    {
                        "id": "q1",
                        "number": 1,
                        "type": "mcq_single",
                        "section": "Reading",
                        "text": "What is the capital of France?",
                        "options": [
                            {"id": "a", "text": "London", "correct": False},
                            {"id": "b", "text": "Paris", "correct": True},
                            {"id": "c", "text": "Berlin", "correct": False}
                        ],
                        "correctAnswer": "b",
                        "points": 1
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/saveExam", 
                json=test_exam,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('examId'):
                    exam_id = data.get('examId')
                    self.log_test(
                        "POST /saveExam (Create Exam)", 
                        True, 
                        f"Exam created with ID: {exam_id}"
                    )
                    
                    # Test GET /getExamById for full exam data
                    try:
                        response = requests.get(
                            f"{self.base_url}/getExamById", 
                            params={"id": exam_id},
                            timeout=10
                        )
                        
                        if response.status_code == 200:
                            exam_data = response.json()
                            if exam_data.get('id') == exam_id and 'questions' in exam_data:
                                self.log_test(
                                    "GET /getExamById (Full Exam Data)", 
                                    True, 
                                    f"Retrieved full exam data with {len(exam_data.get('questions', []))} questions"
                                )
                            else:
                                self.log_test(
                                    "GET /getExamById (Full Exam Data)", 
                                    False, 
                                    "Invalid exam data structure",
                                    exam_data
                                )
                        else:
                            self.log_test(
                                "GET /getExamById (Full Exam Data)", 
                                False, 
                                f"HTTP {response.status_code}",
                                response.text
                            )
                            
                    except Exception as e:
                        self.log_test(
                            "GET /getExamById (Full Exam Data)", 
                            False, 
                            f"Request error: {str(e)}"
                        )
                    
                    # Test POST /deleteExam for removal
                    try:
                        response = requests.post(
                            f"{self.base_url}/deleteExam", 
                            json={"examId": exam_id},
                            timeout=10
                        )
                        
                        if response.status_code == 200:
                            data = response.json()
                            if data.get('success'):
                                self.log_test(
                                    "POST /deleteExam (Remove Exam)", 
                                    True, 
                                    f"Exam deleted successfully: {data.get('message')}"
                                )
                            else:
                                self.log_test(
                                    "POST /deleteExam (Remove Exam)", 
                                    False, 
                                    "Success flag not true",
                                    data
                                )
                        else:
                            self.log_test(
                                "POST /deleteExam (Remove Exam)", 
                                False, 
                                f"HTTP {response.status_code}",
                                response.text
                            )
                            
                    except Exception as e:
                        self.log_test(
                            "POST /deleteExam (Remove Exam)", 
                            False, 
                            f"Request error: {str(e)}"
                        )
                        
                else:
                    self.log_test(
                        "POST /saveExam (Create Exam)", 
                        False, 
                        "Missing success flag or examId",
                        data
                    )
            else:
                self.log_test(
                    "POST /saveExam (Create Exam)", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "POST /saveExam (Create Exam)", 
                False, 
                f"Request error: {str(e)}"
            )

    def test_submission_management(self):
        """Test 4: Submission Management APIs"""
        print("=== TEST 4: SUBMISSION MANAGEMENT APIS ===")
        
        # Test GET /getSubmissions
        try:
            response = requests.get(f"{self.base_url}/getSubmissions", timeout=10)
            
            if response.status_code == 200:
                submissions = response.json()
                if isinstance(submissions, list):
                    self.log_test(
                        "GET /getSubmissions (Dashboard Stats)", 
                        True, 
                        f"Retrieved {len(submissions)} submissions for dashboard"
                    )
                else:
                    self.log_test(
                        "GET /getSubmissions (Dashboard Stats)", 
                        False, 
                        "Response is not a list",
                        submissions
                    )
            else:
                self.log_test(
                    "GET /getSubmissions (Dashboard Stats)", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "GET /getSubmissions (Dashboard Stats)", 
                False, 
                f"Request error: {str(e)}"
            )
        
        # Test submission filtering by studentId
        try:
            response = requests.get(
                f"{self.base_url}/getSubmissions", 
                params={"studentId": "test_student_123"},
                timeout=10
            )
            
            if response.status_code == 200:
                submissions = response.json()
                if isinstance(submissions, list):
                    self.log_test(
                        "GET /getSubmissions (Filter by Student)", 
                        True, 
                        f"Retrieved {len(submissions)} submissions for specific student"
                    )
                else:
                    self.log_test(
                        "GET /getSubmissions (Filter by Student)", 
                        False, 
                        "Response is not a list",
                        submissions
                    )
            else:
                self.log_test(
                    "GET /getSubmissions (Filter by Student)", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "GET /getSubmissions (Filter by Student)", 
                False, 
                f"Request error: {str(e)}"
            )

    def test_json_import_system(self):
        """Test 5: JSON Import System"""
        print("=== TEST 5: JSON IMPORT SYSTEM ===")
        
        # Create sample JSON files for testing
        sample_listening_json = {
            "section": "Listening",
            "title": "Admin Dashboard Test - Listening",
            "duration": 30,
            "audioFile": "Multiple Choice (one answer)/sample-audio.ogg",
            "questions": [
                {
                    "id": "l1",
                    "number": 1,
                    "type": "mcq_single",
                    "text": "What time does the library open?",
                    "options": [
                        {"id": "a", "text": "8:00 AM", "correct": False},
                        {"id": "b", "text": "9:00 AM", "correct": True},
                        {"id": "c", "text": "10:00 AM", "correct": False}
                    ],
                    "answer": "b"
                },
                {
                    "id": "l2",
                    "number": 2,
                    "type": "fill_gaps",
                    "text": "The library is located on _____ street.",
                    "answer": "Main"
                }
            ]
        }
        
        sample_reading_json = {
            "section": "Reading",
            "title": "Admin Dashboard Test - Reading",
            "duration": 60,
            "passages": [
                {
                    "passageNumber": 1,
                    "title": "Climate Change",
                    "text": "Climate change is a long-term shift in global temperatures...",
                    "questions": [
                        {
                            "id": "r1",
                            "number": 1,
                            "type": "true_false_ng",
                            "text": "Climate change only affects polar regions.",
                            "answer": "False"
                        },
                        {
                            "id": "r2",
                            "number": 2,
                            "type": "mcq_multiple",
                            "text": "Which factors contribute to climate change?",
                            "options": [
                                {"id": "a", "text": "Greenhouse gases", "correct": True},
                                {"id": "b", "text": "Deforestation", "correct": True},
                                {"id": "c", "text": "Solar activity", "correct": False}
                            ],
                            "answer": ["a", "b"]
                        }
                    ]
                }
            ]
        }
        
        sample_writing_json = {
            "section": "Writing",
            "title": "Admin Dashboard Test - Writing",
            "duration": 60,
            "tasks": [
                {
                    "taskNumber": 1,
                    "type": "writing_task1",
                    "title": "Task 1: Describe the Chart",
                    "instructions": "Summarize the information by selecting and reporting the main features.",
                    "prompt": "The chart shows the percentage of households with internet access from 2010 to 2020.",
                    "wordLimit": 150,
                    "timeAllocation": 20
                }
            ]
        }
        
        # Test JSON upload for each section
        for section_name, json_data in [
            ("Listening", sample_listening_json),
            ("Reading", sample_reading_json),
            ("Writing", sample_writing_json)
        ]:
            try:
                # Prepare multipart form data
                files = {
                    'file': (f'test-{section_name.lower()}.json', json.dumps(json_data), 'application/json')
                }
                data = {
                    'examTitle': f'Admin Dashboard Test - {section_name}'
                }
                
                response = requests.post(
                    f"{self.base_url}/uploadJson",
                    files=files,
                    data=data,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get('success') and result.get('examId'):
                        exam_id = result.get('examId')
                        exam_data = result.get('data', {})
                        self.log_test(
                            f"POST /uploadJson ({section_name} Section)", 
                            True, 
                            f"JSON imported successfully - ID: {exam_id}, Questions: {exam_data.get('totalQuestions', 0)}"
                        )
                    else:
                        self.log_test(
                            f"POST /uploadJson ({section_name} Section)", 
                            False, 
                            "Missing success flag or examId",
                            result
                        )
                else:
                    self.log_test(
                        f"POST /uploadJson ({section_name} Section)", 
                        False, 
                        f"HTTP {response.status_code}",
                        response.text
                    )
                    
            except Exception as e:
                self.log_test(
                    f"POST /uploadJson ({section_name} Section)", 
                    False, 
                    f"Request error: {str(e)}"
                )
        
        # Test JSON validation with invalid file
        try:
            files = {
                'file': ('invalid.txt', 'This is not JSON', 'text/plain')
            }
            data = {
                'examTitle': 'Invalid File Test'
            }
            
            response = requests.post(
                f"{self.base_url}/uploadJson",
                files=files,
                data=data,
                timeout=10
            )
            
            if response.status_code == 400:
                self.log_test(
                    "POST /uploadJson (Invalid File Validation)", 
                    True, 
                    "Correctly rejected non-JSON file"
                )
            else:
                self.log_test(
                    "POST /uploadJson (Invalid File Validation)", 
                    False, 
                    f"Should have returned 400, got {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "POST /uploadJson (Invalid File Validation)", 
                False, 
                f"Request error: {str(e)}"
            )

    def test_dashboard_statistics(self):
        """Test 6: Dashboard Statistics"""
        print("=== TEST 6: DASHBOARD STATISTICS ===")
        
        # Test data aggregation for dashboard
        endpoints_to_test = [
            ("/getStudents", "Students"),
            ("/getExams", "Exams"),
            ("/getSubmissions", "Submissions")
        ]
        
        dashboard_stats = {}
        
        for endpoint, name in endpoints_to_test:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        count = len(data)
                        dashboard_stats[name] = count
                        self.log_test(
                            f"Dashboard Stats - {name} Count", 
                            True, 
                            f"Retrieved {count} {name.lower()} for dashboard statistics"
                        )
                    else:
                        self.log_test(
                            f"Dashboard Stats - {name} Count", 
                            False, 
                            "Response is not a list",
                            data
                        )
                else:
                    self.log_test(
                        f"Dashboard Stats - {name} Count", 
                        False, 
                        f"HTTP {response.status_code}",
                        response.text
                    )
                    
            except Exception as e:
                self.log_test(
                    f"Dashboard Stats - {name} Count", 
                    False, 
                    f"Request error: {str(e)}"
                )
        
        # Test mock database fallback functionality
        if dashboard_stats:
            self.log_test(
                "Mock Database Fallback", 
                True, 
                f"Mock database working - Stats: {dashboard_stats}"
            )
        else:
            self.log_test(
                "Mock Database Fallback", 
                False, 
                "No data retrieved from any endpoint"
            )

    def run_all_tests(self):
        """Run all test scenarios"""
        print("🧪 STARTING PHASE 4 ADMIN DASHBOARD BACKEND INTEGRATION TESTS")
        print("=" * 80)
        print(f"Testing Firebase Functions server at: {self.base_url}")
        print("=" * 80)
        print()
        
        # Run all test scenarios
        self.test_health_check()
        self.test_student_management()
        self.test_exam_management()
        self.test_submission_management()
        self.test_json_import_system()
        self.test_dashboard_statistics()
        
        # Print summary
        print("=" * 80)
        print("🎯 TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {(self.passed_tests / self.total_tests * 100):.1f}%")
        print()
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print("❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
        else:
            print("✅ ALL TESTS PASSED!")
        
        print("=" * 80)
        
        return self.passed_tests == self.total_tests

if __name__ == "__main__":
    test_suite = FirebaseFunctionsTestSuite()
    success = test_suite.run_all_tests()
    
    if success:
        print("🎉 All tests passed! Firebase Functions backend is ready for admin dashboard integration.")
    else:
        print("⚠️  Some tests failed. Please review the issues above.")
    
    exit(0 if success else 1)