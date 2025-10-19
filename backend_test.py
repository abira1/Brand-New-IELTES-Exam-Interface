#!/usr/bin/env python3
"""
Phase 7A Audio System Backend Testing
Tests audio serving endpoints, metadata, progress saving, and JSON import with audio
"""

import requests
import json
import time
import os
from pathlib import Path

# Test Configuration
BASE_URL = "http://localhost:5001"
SAMPLE_AUDIO_FILE = "Multiple Choice (one answer)/sample-audio.ogg"
SAMPLE_JSON_FILE = "/app/sample-listening-with-audio.json"
TEST_EXAM_ID = "0fe1e3a8-9ea6-4667-9d56-caa1b73688b8"

class AudioSystemTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_results = []
        self.created_exam_id = None
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        
    def test_health_check(self):
        """Test server health"""
        try:
            response = requests.get(f"{self.base_url}/healthCheck", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Response: {response.json()}"
            self.log_test("Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Health Check", False, f"Error: {str(e)}")
            return False
            
    def test_audio_serving_endpoint(self):
        """Test GET /audio/:questionType/:filename endpoint"""
        try:
            # Test with existing audio file
            url = f"{self.base_url}/audio/Multiple Choice (one answer)/sample-audio.ogg"
            response = requests.get(url, timeout=10)
            
            success = response.status_code == 200
            
            # Check headers
            content_type = response.headers.get('Content-Type', '')
            accept_ranges = response.headers.get('Accept-Ranges', '')
            cache_control = response.headers.get('Cache-Control', '')
            
            headers_correct = (
                content_type == 'audio/ogg' and
                accept_ranges == 'bytes' and
                'public' in cache_control
            )
            
            details = f"Status: {response.status_code}, Content-Type: {content_type}, Accept-Ranges: {accept_ranges}, Cache-Control: {cache_control}, Content-Length: {len(response.content)} bytes"
            
            if success and headers_correct:
                self.log_test("Audio Serving Endpoint - Valid File", True, details)
            else:
                self.log_test("Audio Serving Endpoint - Valid File", False, details)
                
            return success and headers_correct
            
        except Exception as e:
            self.log_test("Audio Serving Endpoint - Valid File", False, f"Error: {str(e)}")
            return False
            
    def test_audio_serving_404(self):
        """Test 404 for non-existent audio files"""
        try:
            url = f"{self.base_url}/audio/Multiple Choice (one answer)/nonexistent.ogg"
            response = requests.get(url, timeout=10)
            
            success = response.status_code == 404
            details = f"Status: {response.status_code}, Response: {response.json() if response.headers.get('content-type') == 'application/json' else response.text}"
            
            self.log_test("Audio Serving - 404 for Non-existent File", success, details)
            return success
            
        except Exception as e:
            self.log_test("Audio Serving - 404 for Non-existent File", False, f"Error: {str(e)}")
            return False
            
    def test_audio_security(self):
        """Test security - reject paths with .., /, backslashes"""
        security_tests = [
            ("../../../etc/passwd", "Directory traversal with ../", [400, 404]),  # Can be 400 or 404
            ("test/../sample.ogg", "Directory traversal in filename", [400, 404]),  # Can be 400 or 404
            ("test\\sample.ogg", "Backslash in path", [400]),  # Should be 400
            ("sample.txt", "Non-ogg file extension", [400])  # Should be 400
        ]
        
        all_passed = True
        
        for malicious_path, description, expected_codes in security_tests:
            try:
                url = f"{self.base_url}/audio/test/{malicious_path}"
                response = requests.get(url, timeout=10)
                
                # Should return one of the expected status codes
                success = response.status_code in expected_codes
                if not success:
                    all_passed = False
                    
                details = f"{description} - Status: {response.status_code} (expected: {expected_codes})"
                self.log_test(f"Audio Security - {description}", success, details)
                
            except Exception as e:
                self.log_test(f"Audio Security - {description}", False, f"Error: {str(e)}")
                all_passed = False
                
        return all_passed
        
    def test_audio_info_endpoint(self):
        """Test GET /audioInfo/:questionType/:filename endpoint"""
        try:
            url = f"{self.base_url}/audioInfo/Multiple Choice (one answer)/sample-audio.ogg"
            response = requests.get(url, timeout=10)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                expected_fields = ['success', 'filename', 'questionType', 'size', 'url', 'type']
                has_all_fields = all(field in data for field in expected_fields)
                
                correct_values = (
                    data.get('filename') == 'sample-audio.ogg' and
                    data.get('questionType') == 'Multiple Choice (one answer)' and
                    data.get('type') == 'audio/ogg' and
                    data.get('url') == '/audio/Multiple Choice (one answer)/sample-audio.ogg'
                )
                
                success = has_all_fields and correct_values
                details = f"Status: {response.status_code}, Data: {data}"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Audio Info Endpoint", success, details)
            return success
            
        except Exception as e:
            self.log_test("Audio Info Endpoint", False, f"Error: {str(e)}")
            return False
            
    def test_json_import_with_audio(self):
        """Test uploading JSON with audioFile field"""
        try:
            # Read the sample JSON file
            with open(SAMPLE_JSON_FILE, 'r') as f:
                json_content = f.read()
                
            # Prepare multipart form data
            files = {
                'file': ('sample-listening-with-audio.json', json_content, 'application/json')
            }
            data = {
                'examTitle': 'Audio Test Exam'
            }
            
            response = requests.post(f"{self.base_url}/uploadJson", files=files, data=data, timeout=30)
            
            success = response.status_code == 200
            
            if success:
                result = response.json()
                self.created_exam_id = result.get('examId')
                
                # Check if response contains expected fields
                has_required_fields = (
                    result.get('success') == True and
                    'examId' in result and
                    'message' in result
                )
                
                success = has_required_fields
                details = f"Status: {response.status_code}, ExamId: {self.created_exam_id}, Response: {result}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("JSON Import with Audio", success, details)
            return success
            
        except Exception as e:
            self.log_test("JSON Import with Audio", False, f"Error: {str(e)}")
            return False
            
    def test_exam_retrieval_with_audio(self):
        """Test exam retrieval contains audioUrl and audioFile fields"""
        try:
            # Use the created exam ID or the sample exam ID
            exam_id = self.created_exam_id or TEST_EXAM_ID
            
            url = f"{self.base_url}/getExamById?id={exam_id}"
            response = requests.get(url, timeout=10)
            
            success = response.status_code == 200
            
            if success:
                exam_data = response.json()
                
                # Check for audio metadata
                has_audio_fields = (
                    'audioFile' in exam_data and
                    'audioUrl' in exam_data
                )
                
                # Check audio field values
                correct_audio_values = (
                    exam_data.get('audioFile') == 'Multiple Choice (one answer)/sample-audio.ogg' and
                    exam_data.get('audioUrl') == '/audio/Multiple Choice (one answer)/sample-audio.ogg'
                )
                
                # Check sections contain audio metadata
                sections_have_audio = False
                if 'sections' in exam_data and exam_data['sections']:
                    for section in exam_data['sections']:
                        if section.get('name') == 'Listening' and 'audioFile' in section:
                            sections_have_audio = True
                            break
                
                success = has_audio_fields and correct_audio_values and sections_have_audio
                details = f"Status: {response.status_code}, AudioFile: {exam_data.get('audioFile')}, AudioUrl: {exam_data.get('audioUrl')}, Sections with audio: {sections_have_audio}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Exam Retrieval with Audio Metadata", success, details)
            return success
            
        except Exception as e:
            self.log_test("Exam Retrieval with Audio Metadata", False, f"Error: {str(e)}")
            return False
            
    def test_audio_progress_saving(self):
        """Test POST /saveProgress with audioProgress field"""
        try:
            # Use the created exam ID or sample exam ID
            exam_id = self.created_exam_id or TEST_EXAM_ID
            student_id = "test_student_audio"
            
            # Save progress with audio position
            progress_data = {
                'examId': exam_id,
                'studentId': student_id,
                'answers': {'q1': 'A', 'q2': 'B'},
                'reviewFlags': ['q3'],
                'currentQuestionIndex': 2,
                'timeSpent': 300,
                'audioProgress': 45.5  # Audio position in seconds
            }
            
            response = requests.post(f"{self.base_url}/saveProgress", json=progress_data, timeout=10)
            
            success = response.status_code == 200
            
            if success:
                result = response.json()
                success = result.get('success') == True
                details = f"Status: {response.status_code}, Response: {result}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Audio Progress Saving", success, details)
            return success
            
        except Exception as e:
            self.log_test("Audio Progress Saving", False, f"Error: {str(e)}")
            return False
            
    def test_audio_progress_retrieval(self):
        """Test GET /getProgress retrieves audioProgress correctly"""
        try:
            # Use the created exam ID or sample exam ID
            exam_id = self.created_exam_id or TEST_EXAM_ID
            student_id = "test_student_audio"
            
            url = f"{self.base_url}/getProgress?examId={exam_id}&studentId={student_id}"
            response = requests.get(url, timeout=10)
            
            success = response.status_code == 200
            
            if success:
                result = response.json()
                
                if result.get('success') and result.get('progress'):
                    progress = result['progress']
                    
                    # Check if audioProgress is preserved
                    has_audio_progress = 'audioProgress' in progress
                    correct_audio_value = progress.get('audioProgress') == 45.5
                    
                    success = has_audio_progress and correct_audio_value
                    details = f"Status: {response.status_code}, AudioProgress: {progress.get('audioProgress')}, Full Progress: {progress}"
                else:
                    success = False
                    details = f"Status: {response.status_code}, No progress found or success=False"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Audio Progress Retrieval", success, details)
            return success
            
        except Exception as e:
            self.log_test("Audio Progress Retrieval", False, f"Error: {str(e)}")
            return False
            
    def test_audio_progress_persistence(self):
        """Test audioProgress persists across save/load cycles"""
        try:
            exam_id = self.created_exam_id or TEST_EXAM_ID
            student_id = "test_student_persistence"
            
            # Test multiple save/load cycles with different audio positions
            audio_positions = [10.5, 25.0, 67.3, 120.8]
            
            for i, audio_pos in enumerate(audio_positions):
                # Save progress
                progress_data = {
                    'examId': exam_id,
                    'studentId': student_id,
                    'answers': {f'q{i+1}': f'Answer{i+1}'},
                    'currentQuestionIndex': i,
                    'timeSpent': (i+1) * 60,
                    'audioProgress': audio_pos
                }
                
                save_response = requests.post(f"{self.base_url}/saveProgress", json=progress_data, timeout=10)
                
                if save_response.status_code != 200:
                    self.log_test("Audio Progress Persistence", False, f"Save failed at position {audio_pos}")
                    return False
                
                # Retrieve progress
                get_url = f"{self.base_url}/getProgress?examId={exam_id}&studentId={student_id}"
                get_response = requests.get(get_url, timeout=10)
                
                if get_response.status_code != 200:
                    self.log_test("Audio Progress Persistence", False, f"Retrieve failed at position {audio_pos}")
                    return False
                
                result = get_response.json()
                retrieved_audio_pos = result.get('progress', {}).get('audioProgress')
                
                if retrieved_audio_pos != audio_pos:
                    self.log_test("Audio Progress Persistence", False, f"Audio position mismatch: saved {audio_pos}, retrieved {retrieved_audio_pos}")
                    return False
                    
            self.log_test("Audio Progress Persistence", True, f"Successfully tested {len(audio_positions)} save/load cycles")
            return True
            
        except Exception as e:
            self.log_test("Audio Progress Persistence", False, f"Error: {str(e)}")
            return False
            
    def test_complete_workflow(self):
        """Test complete workflow: upload → retrieve → progress save → progress load"""
        try:
            # This test combines multiple operations to verify end-to-end functionality
            workflow_steps = []
            
            # Step 1: Upload JSON with audio (already done in previous test)
            if self.created_exam_id:
                workflow_steps.append("✅ JSON Upload")
            else:
                workflow_steps.append("❌ JSON Upload")
                
            # Step 2: Retrieve exam with audio metadata
            exam_id = self.created_exam_id or TEST_EXAM_ID
            get_response = requests.get(f"{self.base_url}/getExamById?id={exam_id}", timeout=10)
            if get_response.status_code == 200 and 'audioFile' in get_response.json():
                workflow_steps.append("✅ Exam Retrieval")
            else:
                workflow_steps.append("❌ Exam Retrieval")
                
            # Step 3: Save progress with audio
            progress_data = {
                'examId': exam_id,
                'studentId': 'workflow_test_student',
                'answers': {'q1': 'A'},
                'audioProgress': 30.0
            }
            save_response = requests.post(f"{self.base_url}/saveProgress", json=progress_data, timeout=10)
            if save_response.status_code == 200:
                workflow_steps.append("✅ Progress Save")
            else:
                workflow_steps.append("❌ Progress Save")
                
            # Step 4: Load progress with audio
            get_url = f"{self.base_url}/getProgress?examId={exam_id}&studentId=workflow_test_student"
            load_response = requests.get(get_url, timeout=10)
            if load_response.status_code == 200:
                result = load_response.json()
                if result.get('progress', {}).get('audioProgress') == 30.0:
                    workflow_steps.append("✅ Progress Load")
                else:
                    workflow_steps.append("❌ Progress Load")
            else:
                workflow_steps.append("❌ Progress Load")
                
            success = all("✅" in step for step in workflow_steps)
            details = " → ".join(workflow_steps)
            
            self.log_test("Complete Audio Workflow", success, details)
            return success
            
        except Exception as e:
            self.log_test("Complete Audio Workflow", False, f"Error: {str(e)}")
            return False
            
    def cleanup_test_data(self):
        """Clean up test progress data"""
        try:
            test_students = ["test_student_audio", "test_student_persistence", "workflow_test_student"]
            exam_id = self.created_exam_id or TEST_EXAM_ID
            
            for student_id in test_students:
                clear_data = {
                    'examId': exam_id,
                    'studentId': student_id
                }
                requests.post(f"{self.base_url}/clearProgress", json=clear_data, timeout=10)
                
            self.log_test("Test Data Cleanup", True, f"Cleaned up progress for {len(test_students)} test students")
            
        except Exception as e:
            self.log_test("Test Data Cleanup", False, f"Error: {str(e)}")
            
    def run_all_tests(self):
        """Run all audio system tests"""
        print("🎧 Starting Phase 7A Audio System Backend Tests")
        print("=" * 60)
        
        # Core functionality tests
        tests = [
            self.test_health_check,
            self.test_audio_serving_endpoint,
            self.test_audio_serving_404,
            self.test_audio_security,
            self.test_audio_info_endpoint,
            self.test_json_import_with_audio,
            self.test_exam_retrieval_with_audio,
            self.test_audio_progress_saving,
            self.test_audio_progress_retrieval,
            self.test_audio_progress_persistence,
            self.test_complete_workflow
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
            print()  # Add spacing between tests
            
        # Cleanup
        self.cleanup_test_data()
        
        # Summary
        print("=" * 60)
        print(f"🎧 Phase 7A Audio System Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("✅ ALL TESTS PASSED - Audio system is working correctly!")
        else:
            print(f"❌ {total - passed} tests failed - Audio system needs attention")
            
        return passed == total

def main():
    """Main test execution"""
    tester = AudioSystemTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 Phase 7A Audio System implementation is ready for production!")
    else:
        print("\n⚠️  Phase 7A Audio System has issues that need to be resolved.")
        
    return success

if __name__ == "__main__":
    main()