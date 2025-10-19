#!/usr/bin/env python3
"""
Backend Testing Suite for IELTS Platform - Phase 6 Automated Scoring & Grading System
Tests the Firebase Functions server Phase 6 scoring endpoints and functionality
"""

import requests
import json
import os
from datetime import datetime
import sys
from pathlib import Path

# Firebase Functions server URL (local emulator)
FIREBASE_FUNCTIONS_URL = "http://localhost:5001"

print(f"🔍 Testing Phase 6 Automated Scoring System at: {FIREBASE_FUNCTIONS_URL}")
print("=" * 80)

class Phase6ScoringTester:
    def __init__(self):
        self.api_url = FIREBASE_FUNCTIONS_URL
        self.test_results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        
        # Test data for Phase 6 scoring system
        self.test_exam_id = None
        self.test_submission_id = None
        self.test_student_id = "test-student-scoring-001"
        
        # Sample exam data with various question types for scoring
        self.sample_exam_data = {
            "title": "IELTS Scoring Test Exam",
            "description": "Test exam for automated scoring system",
            "type": "practice",
            "duration": 60,
            "questions": [
                # MCQ Single Choice - Listening
                {
                    "id": "q1",
                    "number": 1,
                    "type": "mcq_single",
                    "section": "Listening",
                    "text": "What is the main topic of the conversation?",
                    "options": [
                        {"id": "A", "text": "Travel plans", "correct": True},
                        {"id": "B", "text": "Work schedule", "correct": False},
                        {"id": "C", "text": "Weather forecast", "correct": False},
                        {"id": "D", "text": "Restaurant booking", "correct": False}
                    ],
                    "correctAnswer": "A",
                    "points": 1
                },
                # MCQ Multiple Choice - Listening
                {
                    "id": "q2",
                    "number": 2,
                    "type": "mcq_multiple",
                    "section": "Listening",
                    "text": "Which activities are mentioned? (Select all that apply)",
                    "options": [
                        {"id": "A", "text": "Swimming", "correct": True},
                        {"id": "B", "text": "Hiking", "correct": True},
                        {"id": "C", "text": "Shopping", "correct": False},
                        {"id": "D", "text": "Cooking", "correct": False}
                    ],
                    "correctAnswer": ["A", "B"],
                    "points": 1
                },
                # Fill in the gaps - Listening
                {
                    "id": "q3",
                    "number": 3,
                    "type": "fill_gaps",
                    "section": "Listening",
                    "text": "The meeting is scheduled for _____ o'clock.",
                    "correctAnswer": "three",
                    "points": 1
                },
                # True/False/Not Given - Reading
                {
                    "id": "q4",
                    "number": 4,
                    "type": "true_false_ng",
                    "section": "Reading",
                    "text": "The company was founded in 1995.",
                    "correctAnswer": "True",
                    "points": 1
                },
                # Sentence Completion - Reading
                {
                    "id": "q5",
                    "number": 5,
                    "type": "sentence_completion",
                    "section": "Reading",
                    "text": "The research shows that climate change affects _____.",
                    "correctAnswer": "biodiversity",
                    "points": 1
                },
                # Matching - Reading
                {
                    "id": "q6",
                    "number": 6,
                    "type": "matching",
                    "section": "Reading",
                    "text": "Match the inventor with their invention.",
                    "correctAnswer": "Edison",
                    "points": 1
                },
                # Writing Task 1 - Should be marked for manual review
                {
                    "id": "q7",
                    "number": 7,
                    "type": "writing_task1",
                    "section": "Writing",
                    "title": "Task 1: Describe the chart",
                    "instructions": "Summarize the information by selecting and reporting the main features.",
                    "prompt": "The chart shows population growth over 50 years.",
                    "wordLimit": 150,
                    "points": 1
                },
                # Writing Task 2 - Should be marked for manual review
                {
                    "id": "q8",
                    "number": 8,
                    "type": "writing_task2",
                    "section": "Writing",
                    "title": "Task 2: Essay",
                    "instructions": "Write an essay discussing both views and give your opinion.",
                    "prompt": "Some people believe technology improves education. Others disagree. Discuss both views.",
                    "wordLimit": 250,
                    "points": 1
                }
            ]
        }
        
        # Sample answers for testing scoring
        self.sample_answers = {
            # Correct answers
            "correct_answers": {
                "q1": "A",  # MCQ Single - Correct
                "q2": ["A", "B"],  # MCQ Multiple - Correct
                "q3": "three",  # Fill gaps - Correct
                "q4": "True",  # True/False - Correct
                "q5": "biodiversity",  # Sentence completion - Correct
                "q6": "Edison",  # Matching - Correct
                "q7": "This is a sample Task 1 response about the chart showing population growth.",  # Writing - Manual review
                "q8": "This is a sample Task 2 essay discussing technology in education."  # Writing - Manual review
            },
            # Mixed answers (some correct, some incorrect)
            "mixed_answers": {
                "q1": "B",  # MCQ Single - Incorrect
                "q2": ["A", "C"],  # MCQ Multiple - Partially incorrect
                "q3": "four",  # Fill gaps - Incorrect
                "q4": "True",  # True/False - Correct
                "q5": "biodiversity",  # Sentence completion - Correct
                "q6": "Tesla",  # Matching - Incorrect
                "q7": "Sample writing response for Task 1.",  # Writing - Manual review
                "q8": "Sample writing response for Task 2."  # Writing - Manual review
            },
            # All incorrect answers
            "incorrect_answers": {
                "q1": "D",  # MCQ Single - Incorrect
                "q2": ["C", "D"],  # MCQ Multiple - Incorrect
                "q3": "five",  # Fill gaps - Incorrect
                "q4": "False",  # True/False - Incorrect
                "q5": "economy",  # Sentence completion - Incorrect
                "q6": "Newton",  # Matching - Incorrect
                "q7": "Wrong writing response.",  # Writing - Manual review
                "q8": "Wrong essay response."  # Writing - Manual review
            }
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
                    self.log_test("Firebase Functions Connectivity", True, "Server is reachable")
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
    
    def setup_test_exam(self):
        """Create a test exam for scoring tests"""
        try:
            response = requests.post(
                f"{self.api_url}/saveExam",
                json=self.sample_exam_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('examId'):
                    self.test_exam_id = data['examId']
                    self.log_test("Setup Test Exam", True, f"Created exam: {self.test_exam_id}")
                    return True
                else:
                    self.log_test("Setup Test Exam", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Setup Test Exam", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Setup Test Exam", False, f"Request error: {str(e)}")
            return False
    
    def test_submit_exam_with_auto_scoring(self):
        """Test POST /submitExam with automatic scoring trigger"""
        if not self.test_exam_id:
            self.log_test("Submit Exam Auto-Scoring", False, "No test exam available")
            return None
        
        try:
            submission_data = {
                "examId": self.test_exam_id,
                "studentId": self.test_student_id,
                "answers": self.sample_answers["correct_answers"],
                "timeSpent": 3600
            }
            
            response = requests.post(
                f"{self.api_url}/submitExam",
                json=submission_data,
                headers={'Content-Type': 'application/json'},
                timeout=15  # Longer timeout for scoring
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('submissionId'):
                    self.test_submission_id = data['submissionId']
                    # Check if message mentions scoring
                    if 'scored' in data.get('message', '').lower():
                        self.log_test("Submit Exam Auto-Scoring", True, f"Submission auto-scored: {self.test_submission_id}")
                        return data
                    else:
                        self.log_test("Submit Exam Auto-Scoring", True, f"Submission created: {self.test_submission_id} (scoring may be async)")
                        return data
                else:
                    self.log_test("Submit Exam Auto-Scoring", False, f"Invalid response: {data}")
                    return None
            else:
                self.log_test("Submit Exam Auto-Scoring", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            self.log_test("Submit Exam Auto-Scoring", False, f"Request error: {str(e)}")
            return None
    
    def test_manual_score_submission(self):
        """Test POST /scoreSubmission endpoint for manual scoring"""
        if not self.test_submission_id:
            self.log_test("Manual Score Submission", False, "No test submission available")
            return None
        
        try:
            score_data = {
                "submissionId": self.test_submission_id
            }
            
            response = requests.post(
                f"{self.api_url}/scoreSubmission",
                json=score_data,
                headers={'Content-Type': 'application/json'},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    scoring_result = data['data']
                    self.log_test("Manual Score Submission", True, f"Submission scored successfully")
                    return scoring_result
                else:
                    self.log_test("Manual Score Submission", False, f"Invalid response: {data}")
                    return None
            else:
                self.log_test("Manual Score Submission", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            self.log_test("Manual Score Submission", False, f"Request error: {str(e)}")
            return None
    
    def test_bulk_score_all_submissions(self):
        """Test POST /scoreAllSubmissions endpoint for bulk scoring"""
        try:
            response = requests.post(
                f"{self.api_url}/scoreAllSubmissions",
                json={},
                headers={'Content-Type': 'application/json'},
                timeout=30  # Longer timeout for bulk operations
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    results = data.get('results', [])
                    self.log_test("Bulk Score All Submissions", True, f"Processed {len(results)} submissions")
                    return data
                else:
                    self.log_test("Bulk Score All Submissions", False, f"Invalid response: {data}")
                    return None
            else:
                self.log_test("Bulk Score All Submissions", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            self.log_test("Bulk Score All Submissions", False, f"Request error: {str(e)}")
            return None
    
    def verify_scoring_data_structure(self, scoring_result):
        """Verify the scoring result has proper data structure"""
        if not scoring_result:
            self.log_test("Scoring Data Structure", False, "No scoring result to verify")
            return False
        
        try:
            # Check required fields
            required_fields = ['sectionScores', 'questionResults', 'overallBandScore', 'totalCorrect', 'totalQuestions']
            missing_fields = [field for field in required_fields if field not in scoring_result]
            
            if missing_fields:
                self.log_test("Scoring Data Structure", False, f"Missing fields: {missing_fields}")
                return False
            
            # Verify sectionScores structure
            section_scores = scoring_result.get('sectionScores', {})
            expected_sections = ['Listening', 'Reading', 'Writing']
            
            for section in expected_sections:
                if section not in section_scores:
                    self.log_test("Scoring Data Structure", False, f"Missing section: {section}")
                    return False
                
                section_data = section_scores[section]
                required_section_fields = ['totalQuestions', 'correctAnswers', 'bandScore']
                missing_section_fields = [field for field in required_section_fields if field not in section_data]
                
                if missing_section_fields:
                    self.log_test("Scoring Data Structure", False, f"Missing section fields in {section}: {missing_section_fields}")
                    return False
            
            # Verify questionResults structure
            question_results = scoring_result.get('questionResults', [])
            if len(question_results) != 8:  # Should match our test exam
                self.log_test("Scoring Data Structure", False, f"Expected 8 question results, got {len(question_results)}")
                return False
            
            # Check question result structure
            for i, result in enumerate(question_results):
                required_q_fields = ['questionId', 'questionType', 'userAnswer', 'isCorrect', 'points']
                missing_q_fields = [field for field in required_q_fields if field not in result]
                
                if missing_q_fields:
                    self.log_test("Scoring Data Structure", False, f"Missing question result fields in Q{i+1}: {missing_q_fields}")
                    return False
            
            self.log_test("Scoring Data Structure", True, "All required fields present and structured correctly")
            return True
            
        except Exception as e:
            self.log_test("Scoring Data Structure", False, f"Error verifying structure: {str(e)}")
            return False
    
    def verify_question_type_scoring(self, scoring_result):
        """Verify different question types are scored correctly"""
        if not scoring_result:
            self.log_test("Question Type Scoring", False, "No scoring result to verify")
            return False
        
        try:
            question_results = scoring_result.get('questionResults', [])
            
            # Check MCQ Single (q1) - Should be correct (A)
            q1_result = next((q for q in question_results if q['questionId'] == 'q1'), None)
            if q1_result and q1_result['questionType'] == 'mcq_single' and q1_result['isCorrect']:
                self.log_test("MCQ Single Scoring", True, "MCQ single choice scored correctly")
            else:
                self.log_test("MCQ Single Scoring", False, f"MCQ single scoring failed: {q1_result}")
                return False
            
            # Check MCQ Multiple (q2) - Should be correct (A, B)
            q2_result = next((q for q in question_results if q['questionId'] == 'q2'), None)
            if q2_result and q2_result['questionType'] == 'mcq_multiple' and q2_result['isCorrect']:
                self.log_test("MCQ Multiple Scoring", True, "MCQ multiple choice scored correctly")
            else:
                self.log_test("MCQ Multiple Scoring", False, f"MCQ multiple scoring failed: {q2_result}")
                return False
            
            # Check Fill in gaps (q3) - Should be correct (three)
            q3_result = next((q for q in question_results if q['questionId'] == 'q3'), None)
            if q3_result and q3_result['questionType'] == 'fill_gaps' and q3_result['isCorrect']:
                self.log_test("Fill Gaps Scoring", True, "Fill in gaps scored correctly")
            else:
                self.log_test("Fill Gaps Scoring", False, f"Fill gaps scoring failed: {q3_result}")
                return False
            
            # Check True/False/NG (q4) - Should be correct (True)
            q4_result = next((q for q in question_results if q['questionId'] == 'q4'), None)
            if q4_result and q4_result['questionType'] == 'true_false_ng' and q4_result['isCorrect']:
                self.log_test("True/False/NG Scoring", True, "True/False/Not Given scored correctly")
            else:
                self.log_test("True/False/NG Scoring", False, f"True/False/NG scoring failed: {q4_result}")
                return False
            
            # Check Writing tasks (q7, q8) - Should be marked for manual review
            q7_result = next((q for q in question_results if q['questionId'] == 'q7'), None)
            q8_result = next((q for q in question_results if q['questionId'] == 'q8'), None)
            
            if (q7_result and q7_result.get('needsManualReview') and 
                q8_result and q8_result.get('needsManualReview')):
                self.log_test("Writing Manual Review", True, "Writing tasks marked for manual review")
            else:
                self.log_test("Writing Manual Review", False, f"Writing tasks not marked for manual review: q7={q7_result}, q8={q8_result}")
                return False
            
            return True
            
        except Exception as e:
            self.log_test("Question Type Scoring", False, f"Error verifying question scoring: {str(e)}")
            return False
    
    def verify_ielts_band_calculation(self, scoring_result):
        """Verify IELTS band score calculation"""
        if not scoring_result:
            self.log_test("IELTS Band Calculation", False, "No scoring result to verify")
            return False
        
        try:
            section_scores = scoring_result.get('sectionScores', {})
            overall_band = scoring_result.get('overallBandScore', 0)
            
            # Check Listening section band score
            listening_section = section_scores.get('Listening', {})
            listening_correct = listening_section.get('correctAnswers', 0)
            listening_total = listening_section.get('totalQuestions', 0)
            listening_band = listening_section.get('bandScore', 0)
            
            if listening_total > 0 and listening_band > 0:
                self.log_test("Listening Band Score", True, f"Listening: {listening_correct}/{listening_total} = Band {listening_band}")
            else:
                self.log_test("Listening Band Score", False, f"Invalid listening band calculation: {listening_section}")
                return False
            
            # Check Reading section band score
            reading_section = section_scores.get('Reading', {})
            reading_correct = reading_section.get('correctAnswers', 0)
            reading_total = reading_section.get('totalQuestions', 0)
            reading_band = reading_section.get('bandScore', 0)
            
            if reading_total > 0 and reading_band > 0:
                self.log_test("Reading Band Score", True, f"Reading: {reading_correct}/{reading_total} = Band {reading_band}")
            else:
                self.log_test("Reading Band Score", False, f"Invalid reading band calculation: {reading_section}")
                return False
            
            # Check Writing section (should be manual review)
            writing_section = section_scores.get('Writing', {})
            writing_status = writing_section.get('status', '')
            
            if writing_status == 'manual_review':
                self.log_test("Writing Manual Review Status", True, "Writing section marked for manual review")
            else:
                self.log_test("Writing Manual Review Status", False, f"Writing section status incorrect: {writing_status}")
                return False
            
            # Check overall band score (should be average of auto-scored sections)
            if 0 <= overall_band <= 9:
                self.log_test("Overall Band Score", True, f"Overall band score: {overall_band}")
            else:
                self.log_test("Overall Band Score", False, f"Invalid overall band score: {overall_band}")
                return False
            
            return True
            
        except Exception as e:
            self.log_test("IELTS Band Calculation", False, f"Error verifying band calculation: {str(e)}")
            return False
    
    def test_mixed_answers_scoring(self):
        """Test scoring with mixed correct/incorrect answers"""
        if not self.test_exam_id:
            self.log_test("Mixed Answers Scoring", False, "No test exam available")
            return None
        
        try:
            # Submit exam with mixed answers
            submission_data = {
                "examId": self.test_exam_id,
                "studentId": f"{self.test_student_id}_mixed",
                "answers": self.sample_answers["mixed_answers"],
                "timeSpent": 3600
            }
            
            response = requests.post(
                f"{self.api_url}/submitExam",
                json=submission_data,
                headers={'Content-Type': 'application/json'},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                submission_id = data.get('submissionId')
                
                if submission_id:
                    # Get the submission to check scoring
                    submissions_response = requests.get(f"{self.api_url}/getSubmissions", timeout=10)
                    if submissions_response.status_code == 200:
                        submissions = submissions_response.json()
                        mixed_submission = next((s for s in submissions if s['id'] == submission_id), None)
                        
                        if mixed_submission and mixed_submission.get('scored'):
                            total_correct = mixed_submission.get('totalCorrect', 0)
                            # With mixed answers, should have some correct (not all 6 objective questions)
                            if 0 < total_correct < 6:
                                self.log_test("Mixed Answers Scoring", True, f"Mixed answers scored correctly: {total_correct}/6 objective questions correct")
                                return mixed_submission
                            else:
                                self.log_test("Mixed Answers Scoring", False, f"Unexpected score for mixed answers: {total_correct}/6")
                                return None
                        else:
                            self.log_test("Mixed Answers Scoring", False, "Mixed submission not found or not scored")
                            return None
                    else:
                        self.log_test("Mixed Answers Scoring", False, "Could not retrieve submissions")
                        return None
                else:
                    self.log_test("Mixed Answers Scoring", False, "No submission ID returned")
                    return None
            else:
                self.log_test("Mixed Answers Scoring", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            self.log_test("Mixed Answers Scoring", False, f"Request error: {str(e)}")
            return None
    
    def test_section_wise_scoring(self):
        """Test section-wise scoring functionality"""
        # Get the scored submission to verify section-wise results
        try:
            response = requests.get(f"{self.api_url}/getSubmissions", timeout=10)
            if response.status_code == 200:
                submissions = response.json()
                scored_submission = next((s for s in submissions if s.get('scored') and s.get('studentId') == self.test_student_id), None)
                
                if scored_submission:
                    section_scores = scored_submission.get('sectionScores', {})
                    
                    # Verify all expected sections are present
                    expected_sections = ['Listening', 'Reading', 'Writing']
                    missing_sections = [s for s in expected_sections if s not in section_scores]
                    
                    if not missing_sections:
                        # Check each section has proper structure
                        all_sections_valid = True
                        for section_name, section_data in section_scores.items():
                            if section_name in ['Listening', 'Reading']:
                                # Auto-scored sections should have band scores
                                if section_data.get('bandScore') is None or section_data.get('status') != 'auto_scored':
                                    all_sections_valid = False
                                    break
                            elif section_name == 'Writing':
                                # Writing should be marked for manual review
                                if section_data.get('status') != 'manual_review':
                                    all_sections_valid = False
                                    break
                        
                        if all_sections_valid:
                            self.log_test("Section-wise Scoring", True, f"All sections scored appropriately: {list(section_scores.keys())}")
                            return True
                        else:
                            self.log_test("Section-wise Scoring", False, f"Invalid section scoring: {section_scores}")
                            return False
                    else:
                        self.log_test("Section-wise Scoring", False, f"Missing sections: {missing_sections}")
                        return False
                else:
                    self.log_test("Section-wise Scoring", False, "No scored submission found for verification")
                    return False
            else:
                self.log_test("Section-wise Scoring", False, f"Could not retrieve submissions: HTTP {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Section-wise Scoring", False, f"Request error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all Phase 6 automated scoring tests"""
        print("🚀 Starting Phase 6 Automated Scoring & Grading System Tests...")
        print("=" * 80)
        
        # Test server connectivity first
        if not self.test_server_connectivity():
            print("\n❌ Firebase Functions server not reachable. Stopping tests.")
            return self.get_summary()
        
        # Setup test exam
        print("\n🔧 Setting up test environment...")
        if not self.setup_test_exam():
            print("\n❌ Could not setup test exam. Stopping tests.")
            return self.get_summary()
        
        # Core Scoring Endpoints Tests
        print("\n🎯 Testing Core Scoring Endpoints...")
        
        # Test 1: Submit exam with auto-scoring
        print("\n1️⃣ Testing POST /submitExam with auto-scoring...")
        submission_result = self.test_submit_exam_with_auto_scoring()
        
        # Test 2: Manual scoring endpoint
        print("\n2️⃣ Testing POST /scoreSubmission...")
        scoring_result = self.test_manual_score_submission()
        
        # Test 3: Bulk scoring endpoint
        print("\n3️⃣ Testing POST /scoreAllSubmissions...")
        self.test_bulk_score_all_submissions()
        
        # Scoring Functionality Tests
        print("\n🧮 Testing Scoring Functionality...")
        
        # Test 4: Verify scoring data structure
        print("\n4️⃣ Testing scoring data structure...")
        if scoring_result:
            self.verify_scoring_data_structure(scoring_result)
        
        # Test 5: Verify question type scoring
        print("\n5️⃣ Testing question type scoring...")
        if scoring_result:
            self.verify_question_type_scoring(scoring_result)
        
        # Test 6: Verify IELTS band calculation
        print("\n6️⃣ Testing IELTS band calculation...")
        if scoring_result:
            self.verify_ielts_band_calculation(scoring_result)
        
        # Test 7: Test mixed answers scoring
        print("\n7️⃣ Testing mixed answers scoring...")
        self.test_mixed_answers_scoring()
        
        # Test 8: Test section-wise scoring
        print("\n8️⃣ Testing section-wise scoring...")
        self.test_section_wise_scoring()
        
        return self.get_summary()
    
    def get_summary(self):
        """Get test summary"""
        print("\n" + "=" * 80)
        print("📊 PHASE 6 AUTOMATED SCORING SYSTEM TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.test_results['total_tests']}")
        print(f"Passed: {self.test_results['passed']}")
        print(f"Failed: {self.test_results['failed']}")
        
        if self.test_results['errors']:
            print("\n❌ FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"  - {error}")
        
        success_rate = (self.test_results['passed'] / self.test_results['total_tests']) * 100 if self.test_results['total_tests'] > 0 else 0
        print(f"\n✅ Success Rate: {success_rate:.1f}%")
        
        # Summary of key features tested
        print(f"\n🎯 KEY FEATURES TESTED:")
        print(f"  ✓ Core Scoring Endpoints (POST /scoreSubmission, POST /scoreAllSubmissions)")
        print(f"  ✓ Auto-scoring on exam submission (POST /submitExam)")
        print(f"  ✓ Question Type Support (MCQ, True/False, Fill-in-blank, Matching, etc.)")
        print(f"  ✓ IELTS Band Score Calculation (9-band system)")
        print(f"  ✓ Section-wise Scoring (Listening/Reading auto, Writing manual)")
        print(f"  ✓ Scoring Data Structure Validation")
        
        return {
            'success_rate': success_rate,
            'total_tests': self.test_results['total_tests'],
            'passed': self.test_results['passed'],
            'failed': self.test_results['failed'],
            'errors': self.test_results['errors']
        }

if __name__ == "__main__":
    tester = Phase6ScoringTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if results['failed'] > 0:
        sys.exit(1)
    else:
        sys.exit(0)