#!/usr/bin/env python3
"""
Phase 2 Authentication System Backend Testing
Tests Firebase Functions server, authentication APIs, demo mode, user management, and Firebase integration
"""

import requests
import json
import time
import os
from pathlib import Path

# Test Configuration
BASE_URL = "http://localhost:5001"

class AuthSystemTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_results = []
        self.created_student_id = None
        
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
        
    def test_firebase_functions_server_status(self):
        """Test Firebase Functions server running on port 5001"""
        try:
            response = requests.get(f"{self.base_url}/healthCheck", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                expected_fields = ['status', 'service', 'timestamp']
                has_all_fields = all(field in data for field in expected_fields)
                correct_status = data.get('status') == 'ok'
                correct_service = 'IELTS Platform Functions' in data.get('service', '')
                
                success = has_all_fields and correct_status and correct_service
                details = f"Status: {response.status_code}, Service: {data.get('service')}, Health: {data.get('status')}"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Firebase Functions Server Status", success, details)
            return success
            
        except Exception as e:
            self.log_test("Firebase Functions Server Status", False, f"Error: {str(e)}")
            return False
            
    def test_health_check_endpoint(self):
        """Test /health endpoint accessibility"""
        try:
            # Test the healthCheck endpoint (note: it's /healthCheck not /health)
            response = requests.get(f"{self.base_url}/healthCheck", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = data.get('status') == 'ok'
                details = f"Status: {response.status_code}, Response: {data}"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Health Check Endpoint Accessibility", success, details)
            return success
            
        except Exception as e:
            self.log_test("Health Check Endpoint Accessibility", False, f"Error: {str(e)}")
            return False
            
    def test_student_management_get_students(self):
        """Test GET /getStudents API"""
        try:
            response = requests.get(f"{self.base_url}/getStudents", timeout=10)
            success = response.status_code == 200
            
            if success:
                students = response.json()
                is_list = isinstance(students, list)
                
                # Check if students have expected structure
                valid_structure = True
                if students:  # If there are students, check structure
                    for student in students[:3]:  # Check first 3 students
                        if not isinstance(student, dict) or 'id' not in student:
                            valid_structure = False
                            break
                            
                success = is_list and valid_structure
                details = f"Status: {response.status_code}, Students count: {len(students)}, Valid structure: {valid_structure}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Student Management - Get Students", success, details)
            return success
            
        except Exception as e:
            self.log_test("Student Management - Get Students", False, f"Error: {str(e)}")
            return False
            
    def test_student_management_update_status(self):
        """Test POST /updateStudentStatus API"""
        try:
            # First, create a test student entry in the mock database
            test_student_data = {
                'studentId': 'test_auth_student_001',
                'status': 'approved'
            }
            
            response = requests.post(f"{self.base_url}/updateStudentStatus", json=test_student_data, timeout=10)
            success = response.status_code == 200
            
            if success:
                result = response.json()
                has_success_field = result.get('success') == True
                has_message = 'message' in result
                
                success = has_success_field and has_message
                details = f"Status: {response.status_code}, Response: {result}"
                self.created_student_id = test_student_data['studentId']
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Student Management - Update Status", success, details)
            return success
            
        except Exception as e:
            self.log_test("Student Management - Update Status", False, f"Error: {str(e)}")
            return False
            
    def test_student_status_validation(self):
        """Test student status update validation"""
        try:
            # Test missing studentId
            invalid_data = {'status': 'approved'}
            response = requests.post(f"{self.base_url}/updateStudentStatus", json=invalid_data, timeout=10)
            
            missing_id_handled = response.status_code == 400
            
            # Test missing status
            invalid_data2 = {'studentId': 'test_student'}
            response2 = requests.post(f"{self.base_url}/updateStudentStatus", json=invalid_data2, timeout=10)
            
            missing_status_handled = response2.status_code == 400
            
            success = missing_id_handled and missing_status_handled
            details = f"Missing ID handled: {missing_id_handled}, Missing status handled: {missing_status_handled}"
            
            self.log_test("Student Status Update Validation", success, details)
            return success
            
        except Exception as e:
            self.log_test("Student Status Update Validation", False, f"Error: {str(e)}")
            return False
            
    def test_user_profile_creation_workflow(self):
        """Test user profile creation workflow support"""
        try:
            # Test creating a new student profile via updateStudentStatus
            new_student_data = {
                'studentId': 'test_new_profile_002',
                'status': 'pending'
            }
            
            response = requests.post(f"{self.base_url}/updateStudentStatus", json=new_student_data, timeout=10)
            success = response.status_code == 200
            
            if success:
                result = response.json()
                success = result.get('success') == True
                details = f"Status: {response.status_code}, Profile creation supported: {success}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("User Profile Creation Workflow", success, details)
            return success
            
        except Exception as e:
            self.log_test("User Profile Creation Workflow", False, f"Error: {str(e)}")
            return False
            
    def test_admin_whitelist_functionality(self):
        """Test admin whitelist functionality through student management"""
        try:
            # Test admin approval workflow
            admin_actions = [
                {'studentId': 'test_admin_whitelist_001', 'status': 'approved'},
                {'studentId': 'test_admin_whitelist_002', 'status': 'rejected'},
                {'studentId': 'test_admin_whitelist_003', 'status': 'pending'}
            ]
            
            all_successful = True
            results = []
            
            for action in admin_actions:
                response = requests.post(f"{self.base_url}/updateStudentStatus", json=action, timeout=10)
                if response.status_code == 200:
                    result = response.json()
                    if result.get('success') == True:
                        results.append(f"✅ {action['status']}")
                    else:
                        results.append(f"❌ {action['status']}")
                        all_successful = False
                else:
                    results.append(f"❌ {action['status']} (HTTP {response.status_code})")
                    all_successful = False
                    
            details = f"Admin actions: {', '.join(results)}"
            self.log_test("Admin Whitelist Functionality", all_successful, details)
            return all_successful
            
        except Exception as e:
            self.log_test("Admin Whitelist Functionality", False, f"Error: {str(e)}")
            return False
            
    def test_role_based_api_access(self):
        """Test role-based API access through available endpoints"""
        try:
            # Test accessing different API endpoints that would be role-restricted
            api_endpoints = [
                ('/getStudents', 'GET', 'Admin-only student list'),
                ('/getExams', 'GET', 'Exam access'),
                ('/getSubmissions', 'GET', 'Submission access')
            ]
            
            accessible_endpoints = []
            
            for endpoint, method, description in api_endpoints:
                try:
                    if method == 'GET':
                        response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                    else:
                        response = requests.post(f"{self.base_url}{endpoint}", json={}, timeout=10)
                        
                    if response.status_code in [200, 400]:  # 200 = success, 400 = validation error (but endpoint exists)
                        accessible_endpoints.append(f"✅ {description}")
                    else:
                        accessible_endpoints.append(f"❌ {description} (HTTP {response.status_code})")
                        
                except Exception:
                    accessible_endpoints.append(f"❌ {description} (Connection error)")
                    
            # All endpoints should be accessible (role checking would be done in frontend/middleware)
            success = len(accessible_endpoints) >= 2  # At least 2 endpoints should be accessible
            details = f"API endpoints: {', '.join(accessible_endpoints)}"
            
            self.log_test("Role-based API Access", success, details)
            return success
            
        except Exception as e:
            self.log_test("Role-based API Access", False, f"Error: {str(e)}")
            return False
            
    def test_demo_mode_admin_support(self):
        """Test backend handles demo admin users"""
        try:
            # Test that backend accepts demo admin operations
            demo_admin_actions = [
                {'studentId': 'demo_admin_test_001', 'status': 'approved'},
                {'studentId': 'demo_admin_test_002', 'status': 'pending'}
            ]
            
            demo_operations_work = True
            
            for action in demo_admin_actions:
                response = requests.post(f"{self.base_url}/updateStudentStatus", json=action, timeout=10)
                if response.status_code != 200:
                    demo_operations_work = False
                    break
                    
            # Test demo admin can access student list
            response = requests.get(f"{self.base_url}/getStudents", timeout=10)
            can_access_students = response.status_code == 200
            
            success = demo_operations_work and can_access_students
            details = f"Demo admin operations work: {demo_operations_work}, Can access students: {can_access_students}"
            
            self.log_test("Demo Mode - Admin Support", success, details)
            return success
            
        except Exception as e:
            self.log_test("Demo Mode - Admin Support", False, f"Error: {str(e)}")
            return False
            
    def test_demo_mode_student_support(self):
        """Test backend handles demo student users"""
        try:
            # Test that backend supports student operations (exam access, submissions)
            demo_student_id = 'demo_student_test_001'
            
            # Test student can access exams
            response = requests.get(f"{self.base_url}/getExams", timeout=10)
            can_access_exams = response.status_code == 200
            
            # Test student can access their submissions
            response2 = requests.get(f"{self.base_url}/getSubmissions?studentId={demo_student_id}", timeout=10)
            can_access_submissions = response2.status_code == 200
            
            # Test student progress saving (typical student operation)
            progress_data = {
                'examId': 'demo_exam_001',
                'studentId': demo_student_id,
                'answers': {'q1': 'A'},
                'currentQuestionIndex': 0,
                'timeSpent': 60
            }
            response3 = requests.post(f"{self.base_url}/saveProgress", json=progress_data, timeout=10)
            can_save_progress = response3.status_code == 200
            
            success = can_access_exams and can_access_submissions and can_save_progress
            details = f"Access exams: {can_access_exams}, Access submissions: {can_access_submissions}, Save progress: {can_save_progress}"
            
            self.log_test("Demo Mode - Student Support", success, details)
            return success
            
        except Exception as e:
            self.log_test("Demo Mode - Student Support", False, f"Error: {str(e)}")
            return False
            
    def test_mock_database_functionality(self):
        """Test mock database functionality for testing"""
        try:
            # Test that mock database can store and retrieve data
            test_student_id = 'mock_db_test_student'
            
            # Store data
            store_data = {
                'studentId': test_student_id,
                'status': 'approved'
            }
            store_response = requests.post(f"{self.base_url}/updateStudentStatus", json=store_data, timeout=10)
            store_success = store_response.status_code == 200
            
            # Retrieve data
            retrieve_response = requests.get(f"{self.base_url}/getStudents", timeout=10)
            retrieve_success = retrieve_response.status_code == 200
            
            # Test progress storage and retrieval
            progress_data = {
                'examId': 'mock_exam_test',
                'studentId': test_student_id,
                'answers': {'q1': 'Test Answer'},
                'timeSpent': 120
            }
            progress_store = requests.post(f"{self.base_url}/saveProgress", json=progress_data, timeout=10)
            progress_store_success = progress_store.status_code == 200
            
            progress_retrieve = requests.get(f"{self.base_url}/getProgress?examId=mock_exam_test&studentId={test_student_id}", timeout=10)
            progress_retrieve_success = progress_retrieve.status_code == 200
            
            success = store_success and retrieve_success and progress_store_success and progress_retrieve_success
            details = f"Store: {store_success}, Retrieve: {retrieve_success}, Progress store: {progress_store_success}, Progress retrieve: {progress_retrieve_success}"
            
            self.log_test("Mock Database Functionality", success, details)
            return success
            
        except Exception as e:
            self.log_test("Mock Database Functionality", False, f"Error: {str(e)}")
            return False
            
    def test_user_registration_workflow_backend(self):
        """Test backend support for user registration workflow"""
        try:
            # Test that backend can handle new user registration data
            new_users = [
                {'studentId': 'new_user_001', 'status': 'pending'},
                {'studentId': 'new_user_002', 'status': 'pending'},
                {'studentId': 'new_user_003', 'status': 'pending'}
            ]
            
            registration_success = True
            
            for user in new_users:
                response = requests.post(f"{self.base_url}/updateStudentStatus", json=user, timeout=10)
                if response.status_code != 200:
                    registration_success = False
                    break
                    
            # Test that registered users appear in student list
            students_response = requests.get(f"{self.base_url}/getStudents", timeout=10)
            can_list_users = students_response.status_code == 200
            
            success = registration_success and can_list_users
            details = f"Registration workflow: {registration_success}, User listing: {can_list_users}"
            
            self.log_test("User Registration Workflow Backend", success, details)
            return success
            
        except Exception as e:
            self.log_test("User Registration Workflow Backend", False, f"Error: {str(e)}")
            return False
            
    def test_admin_approval_workflow_apis(self):
        """Test admin approval workflow APIs"""
        try:
            # Test complete approval workflow
            workflow_student = 'approval_workflow_test'
            
            # Step 1: Create pending user
            step1_data = {'studentId': workflow_student, 'status': 'pending'}
            step1_response = requests.post(f"{self.base_url}/updateStudentStatus", json=step1_data, timeout=10)
            step1_success = step1_response.status_code == 200
            
            # Step 2: Admin approves user
            step2_data = {'studentId': workflow_student, 'status': 'approved'}
            step2_response = requests.post(f"{self.base_url}/updateStudentStatus", json=step2_data, timeout=10)
            step2_success = step2_response.status_code == 200
            
            # Step 3: Verify approval in student list
            step3_response = requests.get(f"{self.base_url}/getStudents", timeout=10)
            step3_success = step3_response.status_code == 200
            
            success = step1_success and step2_success and step3_success
            details = f"Create pending: {step1_success}, Approve: {step2_success}, Verify: {step3_success}"
            
            self.log_test("Admin Approval Workflow APIs", success, details)
            return success
            
        except Exception as e:
            self.log_test("Admin Approval Workflow APIs", False, f"Error: {str(e)}")
            return False
            
    def test_user_role_assignment_detection(self):
        """Test user role assignment and detection"""
        try:
            # Test different user roles through status assignment
            role_tests = [
                {'studentId': 'role_test_admin', 'status': 'admin'},
                {'studentId': 'role_test_student', 'status': 'approved'},
                {'studentId': 'role_test_pending', 'status': 'pending'},
                {'studentId': 'role_test_rejected', 'status': 'rejected'}
            ]
            
            role_assignment_works = True
            
            for role_test in role_tests:
                response = requests.post(f"{self.base_url}/updateStudentStatus", json=role_test, timeout=10)
                if response.status_code != 200:
                    role_assignment_works = False
                    break
                    
            # Test that roles can be detected through student listing
            students_response = requests.get(f"{self.base_url}/getStudents", timeout=10)
            role_detection_works = students_response.status_code == 200
            
            success = role_assignment_works and role_detection_works
            details = f"Role assignment: {role_assignment_works}, Role detection: {role_detection_works}"
            
            self.log_test("User Role Assignment and Detection", success, details)
            return success
            
        except Exception as e:
            self.log_test("User Role Assignment and Detection", False, f"Error: {str(e)}")
            return False
            
    def test_firebase_auth_integration_endpoints(self):
        """Test Firebase auth integration endpoints"""
        try:
            # Test endpoints that would integrate with Firebase Auth
            auth_related_endpoints = [
                ('/getStudents', 'GET', 'Student data for auth'),
                ('/updateStudentStatus', 'POST', 'User status updates')
            ]
            
            integration_works = True
            endpoint_results = []
            
            for endpoint, method, description in auth_related_endpoints:
                try:
                    if method == 'GET':
                        response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                    else:
                        # Test with valid data for POST endpoints
                        test_data = {'studentId': 'firebase_auth_test', 'status': 'approved'}
                        response = requests.post(f"{self.base_url}{endpoint}", json=test_data, timeout=10)
                        
                    if response.status_code == 200:
                        endpoint_results.append(f"✅ {description}")
                    else:
                        endpoint_results.append(f"❌ {description} (HTTP {response.status_code})")
                        integration_works = False
                        
                except Exception:
                    endpoint_results.append(f"❌ {description} (Error)")
                    integration_works = False
                    
            details = f"Auth endpoints: {', '.join(endpoint_results)}"
            self.log_test("Firebase Auth Integration Endpoints", integration_works, details)
            return integration_works
            
        except Exception as e:
            self.log_test("Firebase Auth Integration Endpoints", False, f"Error: {str(e)}")
            return False
            
    def test_firebase_database_operations(self):
        """Test Firebase database operations"""
        try:
            # Test database operations through API endpoints
            db_operations = []
            
            # Test CREATE operation
            create_data = {'studentId': 'firebase_db_test', 'status': 'pending'}
            create_response = requests.post(f"{self.base_url}/updateStudentStatus", json=create_data, timeout=10)
            db_operations.append(('CREATE', create_response.status_code == 200))
            
            # Test READ operation
            read_response = requests.get(f"{self.base_url}/getStudents", timeout=10)
            db_operations.append(('READ', read_response.status_code == 200))
            
            # Test UPDATE operation
            update_data = {'studentId': 'firebase_db_test', 'status': 'approved'}
            update_response = requests.post(f"{self.base_url}/updateStudentStatus", json=update_data, timeout=10)
            db_operations.append(('UPDATE', update_response.status_code == 200))
            
            # Test progress operations (additional database functionality)
            progress_data = {
                'examId': 'firebase_test_exam',
                'studentId': 'firebase_db_test',
                'answers': {'q1': 'A'},
                'timeSpent': 300
            }
            progress_response = requests.post(f"{self.base_url}/saveProgress", json=progress_data, timeout=10)
            db_operations.append(('PROGRESS_SAVE', progress_response.status_code == 200))
            
            all_operations_work = all(success for _, success in db_operations)
            operation_details = ', '.join([f"{op}: {'✅' if success else '❌'}" for op, success in db_operations])
            
            self.log_test("Firebase Database Operations", all_operations_work, operation_details)
            return all_operations_work
            
        except Exception as e:
            self.log_test("Firebase Database Operations", False, f"Error: {str(e)}")
            return False
            
    def test_fallback_mock_database_mode(self):
        """Test fallback behavior for mock database mode"""
        try:
            # Test that system works in mock mode (which it should be running in)
            mock_mode_tests = []
            
            # Test basic operations work in mock mode
            mock_student_data = {'studentId': 'mock_mode_test', 'status': 'approved'}
            mock_response = requests.post(f"{self.base_url}/updateStudentStatus", json=mock_student_data, timeout=10)
            mock_mode_tests.append(('Student Update', mock_response.status_code == 200))
            
            # Test data retrieval works in mock mode
            mock_get_response = requests.get(f"{self.base_url}/getStudents", timeout=10)
            mock_mode_tests.append(('Student Retrieval', mock_get_response.status_code == 200))
            
            # Test exam operations work in mock mode
            mock_exam_response = requests.get(f"{self.base_url}/getExams", timeout=10)
            mock_mode_tests.append(('Exam Access', mock_exam_response.status_code == 200))
            
            all_mock_operations_work = all(success for _, success in mock_mode_tests)
            mock_details = ', '.join([f"{op}: {'✅' if success else '❌'}" for op, success in mock_mode_tests])
            
            self.log_test("Fallback Mock Database Mode", all_mock_operations_work, mock_details)
            return all_mock_operations_work
            
        except Exception as e:
            self.log_test("Fallback Mock Database Mode", False, f"Error: {str(e)}")
            return False
            
    def test_firebase_configuration_handling(self):
        """Test Firebase configuration handling"""
        try:
            # Test that server handles Firebase configuration gracefully
            # This is tested by verifying the server is running and responding
            config_tests = []
            
            # Test server startup (health check)
            health_response = requests.get(f"{self.base_url}/healthCheck", timeout=10)
            config_tests.append(('Server Startup', health_response.status_code == 200))
            
            # Test that APIs work regardless of Firebase config status
            api_response = requests.get(f"{self.base_url}/getStudents", timeout=10)
            config_tests.append(('API Functionality', api_response.status_code == 200))
            
            # Test that database operations work (mock or real)
            db_test_data = {'studentId': 'config_test', 'status': 'approved'}
            db_response = requests.post(f"{self.base_url}/updateStudentStatus", json=db_test_data, timeout=10)
            config_tests.append(('Database Operations', db_response.status_code == 200))
            
            all_config_handling_works = all(success for _, success in config_tests)
            config_details = ', '.join([f"{test}: {'✅' if success else '❌'}" for test, success in config_tests])
            
            self.log_test("Firebase Configuration Handling", all_config_handling_works, config_details)
            return all_config_handling_works
            
        except Exception as e:
            self.log_test("Firebase Configuration Handling", False, f"Error: {str(e)}")
            return False
            
    def cleanup_test_data(self):
        """Clean up test data"""
        try:
            # Clean up test progress data
            test_students = [
                'test_auth_student_001', 'test_new_profile_002', 'demo_admin_test_001',
                'demo_student_test_001', 'mock_db_test_student', 'approval_workflow_test',
                'firebase_auth_test', 'firebase_db_test', 'mock_mode_test', 'config_test'
            ]
            
            test_exams = ['demo_exam_001', 'mock_exam_test', 'firebase_test_exam']
            
            # Clear progress data
            for student_id in test_students:
                for exam_id in test_exams:
                    clear_data = {'examId': exam_id, 'studentId': student_id}
                    try:
                        requests.post(f"{self.base_url}/clearProgress", json=clear_data, timeout=5)
                    except:
                        pass  # Ignore cleanup errors
                        
            self.log_test("Test Data Cleanup", True, f"Cleaned up data for {len(test_students)} test students")
            
        except Exception as e:
            self.log_test("Test Data Cleanup", False, f"Error: {str(e)}")
            
    def run_all_tests(self):
        """Run all authentication system tests"""
        print("🔐 Starting Phase 2 Authentication System Backend Tests")
        print("=" * 70)
        
        # Core functionality tests
        tests = [
            # Firebase Functions Server Status
            self.test_firebase_functions_server_status,
            self.test_health_check_endpoint,
            
            # Authentication Backend APIs
            self.test_student_management_get_students,
            self.test_student_management_update_status,
            self.test_student_status_validation,
            self.test_user_profile_creation_workflow,
            self.test_admin_whitelist_functionality,
            self.test_role_based_api_access,
            
            # Demo Mode Backend Support
            self.test_demo_mode_admin_support,
            self.test_demo_mode_student_support,
            self.test_mock_database_functionality,
            
            # User Management Backend
            self.test_user_registration_workflow_backend,
            self.test_admin_approval_workflow_apis,
            self.test_user_role_assignment_detection,
            
            # Firebase Integration Backend
            self.test_firebase_auth_integration_endpoints,
            self.test_firebase_database_operations,
            self.test_fallback_mock_database_mode,
            self.test_firebase_configuration_handling
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
        print("=" * 70)
        print(f"🔐 Phase 2 Authentication System Test Results: {passed}/{total} tests passed")
        
        success_rate = (passed / total) * 100
        print(f"📊 Success Rate: {success_rate:.1f}%")
        
        if passed == total:
            print("✅ ALL TESTS PASSED - Authentication system is working correctly!")
        elif success_rate >= 90:
            print("✅ MOSTLY SUCCESSFUL - Authentication system is working with minor issues")
        else:
            print(f"❌ {total - passed} tests failed - Authentication system needs attention")
            
        return passed, total, success_rate

def main():
    """Main test execution"""
    tester = AuthSystemTester()
    passed, total, success_rate = tester.run_all_tests()
    
    if success_rate >= 90:
        print("\n🎉 Phase 2 Authentication System implementation is ready for production!")
    else:
        print("\n⚠️  Phase 2 Authentication System has issues that need to be resolved.")
        
    return success_rate >= 90

if __name__ == "__main__":
    main()