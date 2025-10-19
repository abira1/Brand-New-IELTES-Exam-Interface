#!/usr/bin/env python3
"""
Phase 2 Authentication System Backend Testing
Tests Firebase Functions backend authentication endpoints and functionality
"""

import requests
import json
import time
import os
from pathlib import Path

# Test Configuration
BACKEND_URL = "http://localhost:5001"
FRONTEND_URL = "http://localhost:3000"

class AuthenticationBackendTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.frontend_url = FRONTEND_URL
        self.test_results = []
        
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
        
    def test_backend_health_check(self):
        """Test Firebase Functions backend health"""
        try:
            response = requests.get(f"{self.backend_url}/healthCheck", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Status: {response.status_code}, Service: {data.get('service', 'Unknown')}"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Backend Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Backend Health Check", False, f"Error: {str(e)}")
            return False
            
    def test_frontend_server_accessibility(self):
        """Test frontend server accessibility"""
        try:
            response = requests.get(self.frontend_url, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            self.log_test("Frontend Server Accessibility", success, details)
            return success
        except Exception as e:
            self.log_test("Frontend Server Accessibility", False, f"Error: {str(e)}")
            return False
            
    def test_student_management_apis(self):
        """Test student management APIs for authentication system"""
        try:
            # Test getStudents endpoint
            response = requests.get(f"{self.backend_url}/getStudents", timeout=10)
            success = response.status_code == 200
            
            if success:
                students = response.json()
                details = f"Status: {response.status_code}, Students count: {len(students) if isinstance(students, list) else 'N/A'}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Student Management API - getStudents", success, details)
            return success
            
        except Exception as e:
            self.log_test("Student Management API - getStudents", False, f"Error: {str(e)}")
            return False
            
    def test_student_status_update_api(self):
        """Test student status update API for approval workflow"""
        try:
            # Test updateStudentStatus endpoint with mock data
            test_data = {
                'studentId': 'test-student-id',
                'status': 'approved'
            }
            
            response = requests.post(f"{self.backend_url}/updateStudentStatus", json=test_data, timeout=10)
            
            # Accept both 200 (success) and 404 (student not found) as valid responses
            # since we're testing with mock data
            success = response.status_code in [200, 404]
            
            if response.status_code == 200:
                result = response.json()
                details = f"Status: {response.status_code}, Response: {result}"
            elif response.status_code == 404:
                details = f"Status: {response.status_code} (Expected for test data)"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                
            self.log_test("Student Status Update API", success, details)
            return success
            
        except Exception as e:
            self.log_test("Student Status Update API", False, f"Error: {str(e)}")
            return False
            
    def test_firebase_config_files(self):
        """Test Firebase configuration files exist and are properly configured"""
        try:
            config_checks = []
            
            # Check frontend .env file
            frontend_env_path = "/app/frontend/.env"
            if os.path.exists(frontend_env_path):
                with open(frontend_env_path, 'r') as f:
                    env_content = f.read()
                    
                firebase_vars = [
                    'REACT_APP_FIREBASE_API_KEY',
                    'REACT_APP_FIREBASE_AUTH_DOMAIN',
                    'REACT_APP_FIREBASE_PROJECT_ID'
                ]
                
                found_vars = 0
                for var in firebase_vars:
                    if var in env_content and not env_content.split(var + '=')[1].split('\n')[0].strip() == '':
                        found_vars += 1
                        
                config_checks.append(f"Frontend Firebase config: {found_vars}/{len(firebase_vars)} vars")
            else:
                config_checks.append("Frontend .env file: Missing")
                
            # Check firebase.json
            firebase_json_path = "/app/firebase.json"
            if os.path.exists(firebase_json_path):
                config_checks.append("firebase.json: Present")
            else:
                config_checks.append("firebase.json: Missing")
                
            # Check Firebase Functions
            functions_path = "/app/functions"
            if os.path.exists(functions_path):
                config_checks.append("Functions directory: Present")
            else:
                config_checks.append("Functions directory: Missing")
                
            success = all("Missing" not in check for check in config_checks)
            details = ", ".join(config_checks)
            
            self.log_test("Firebase Configuration Files", success, details)
            return success
            
        except Exception as e:
            self.log_test("Firebase Configuration Files", False, f"Error: {str(e)}")
            return False
            
    def test_authentication_components_exist(self):
        """Test authentication component files exist"""
        try:
            component_checks = []
            
            # Check authentication components
            auth_components = [
                "/app/frontend/src/components/auth/LoginPage.jsx",
                "/app/frontend/src/components/auth/PendingApproval.jsx",
                "/app/frontend/src/contexts/AuthContext.js",
                "/app/frontend/src/services/authService.js",
                "/app/frontend/src/config/firebase.js"
            ]
            
            for component_path in auth_components:
                if os.path.exists(component_path):
                    component_name = os.path.basename(component_path)
                    component_checks.append(f"{component_name}: ✓")
                else:
                    component_name = os.path.basename(component_path)
                    component_checks.append(f"{component_name}: ✗")
                    
            success = all("✓" in check for check in component_checks)
            details = ", ".join(component_checks)
            
            self.log_test("Authentication Components Exist", success, details)
            return success
            
        except Exception as e:
            self.log_test("Authentication Components Exist", False, f"Error: {str(e)}")
            return False
            
    def test_auth_context_implementation(self):
        """Test AuthContext.js implementation details"""
        try:
            auth_context_path = "/app/frontend/src/contexts/AuthContext.js"
            
            if not os.path.exists(auth_context_path):
                self.log_test("AuthContext Implementation", False, "AuthContext.js file not found")
                return False
                
            with open(auth_context_path, 'r') as f:
                content = f.read()
                
            # Check for key features
            features = [
                ('demo=admin', 'Admin demo mode support'),
                ('demo=student', 'Student demo mode support'),
                ('localStorage', 'Demo mode persistence'),
                ('useAuth', 'useAuth hook export'),
                ('AuthProvider', 'AuthProvider component'),
                ('userRole', 'User role management'),
                ('isAdmin', 'Admin role check'),
                ('isStudent', 'Student role check'),
                ('isPending', 'Pending role check')
            ]
            
            found_features = []
            for feature, description in features:
                if feature in content:
                    found_features.append(f"✓ {description}")
                else:
                    found_features.append(f"✗ {description}")
                    
            success = all("✓" in feature for feature in found_features)
            details = f"Features: {len([f for f in found_features if '✓' in f])}/{len(features)} implemented"
            
            self.log_test("AuthContext Implementation", success, details)
            return success
            
        except Exception as e:
            self.log_test("AuthContext Implementation", False, f"Error: {str(e)}")
            return False
            
    def test_auth_service_implementation(self):
        """Test authService.js implementation details"""
        try:
            auth_service_path = "/app/frontend/src/services/authService.js"
            
            if not os.path.exists(auth_service_path):
                self.log_test("AuthService Implementation", False, "authService.js file not found")
                return False
                
            with open(auth_service_path, 'r') as f:
                content = f.read()
                
            # Check for key features
            features = [
                ('signInWithGoogle', 'Google OAuth integration'),
                ('signOut', 'Sign out functionality'),
                ('checkUserRole', 'Role checking logic'),
                ('createUserProfile', 'User profile creation'),
                ('updateUserProfile', 'Profile update functionality'),
                ('isFirebaseEnabled', 'Firebase availability check'),
                ('mock', 'Fallback/mock implementations'),
                ('admin/whitelist', 'Admin whitelist system'),
                ('students/', 'Student data management')
            ]
            
            found_features = []
            for feature, description in features:
                if feature in content:
                    found_features.append(f"✓ {description}")
                else:
                    found_features.append(f"✗ {description}")
                    
            success = len([f for f in found_features if '✓' in f]) >= 7  # At least 7/9 features
            details = f"Features: {len([f for f in found_features if '✓' in f])}/{len(features)} implemented"
            
            self.log_test("AuthService Implementation", success, details)
            return success
            
        except Exception as e:
            self.log_test("AuthService Implementation", False, f"Error: {str(e)}")
            return False
            
    def test_route_protection_implementation(self):
        """Test route protection implementation in App.js"""
        try:
            app_js_path = "/app/frontend/src/App.js"
            
            if not os.path.exists(app_js_path):
                self.log_test("Route Protection Implementation", False, "App.js file not found")
                return False
                
            with open(app_js_path, 'r') as f:
                content = f.read()
                
            # Check for route protection features
            features = [
                ('ProtectedRoute', 'ProtectedRoute component'),
                ('allowedRoles', 'Role-based access control'),
                ('/admin/*', 'Admin route protection'),
                ('/student/*', 'Student route protection'),
                ('/exam/', 'Exam route protection'),
                ('/pending', 'Pending approval route'),
                ('Navigate to="/login"', 'Login redirect'),
                ('useAuth', 'Authentication context usage')
            ]
            
            found_features = []
            for feature, description in features:
                if feature in content:
                    found_features.append(f"✓ {description}")
                else:
                    found_features.append(f"✗ {description}")
                    
            success = all("✓" in feature for feature in found_features)
            details = f"Protection features: {len([f for f in found_features if '✓' in f])}/{len(features)} implemented"
            
            self.log_test("Route Protection Implementation", success, details)
            return success
            
        except Exception as e:
            self.log_test("Route Protection Implementation", False, f"Error: {str(e)}")
            return False
            
    def test_login_page_implementation(self):
        """Test LoginPage.jsx implementation details"""
        try:
            login_page_path = "/app/frontend/src/components/auth/LoginPage.jsx"
            
            if not os.path.exists(login_page_path):
                self.log_test("LoginPage Implementation", False, "LoginPage.jsx file not found")
                return False
                
            with open(login_page_path, 'r') as f:
                content = f.read()
                
            # Check for key features
            features = [
                ('Continue with Google', 'Google OAuth button'),
                ('Demo Mode', 'Demo mode functionality'),
                ('useAuth', 'Authentication context usage'),
                ('Navigate', 'Route navigation'),
                ('isAuthenticated', 'Authentication check'),
                ('userRole', 'Role-based redirects'),
                ('signIn', 'Sign in functionality'),
                ('loading', 'Loading state handling')
            ]
            
            found_features = []
            for feature, description in features:
                if feature in content:
                    found_features.append(f"✓ {description}")
                else:
                    found_features.append(f"✗ {description}")
                    
            success = all("✓" in feature for feature in found_features)
            details = f"Features: {len([f for f in found_features if '✓' in f])}/{len(features)} implemented"
            
            self.log_test("LoginPage Implementation", success, details)
            return success
            
        except Exception as e:
            self.log_test("LoginPage Implementation", False, f"Error: {str(e)}")
            return False
            
    def test_pending_approval_implementation(self):
        """Test PendingApproval.jsx implementation details"""
        try:
            pending_page_path = "/app/frontend/src/components/auth/PendingApproval.jsx"
            
            if not os.path.exists(pending_page_path):
                self.log_test("PendingApproval Implementation", False, "PendingApproval.jsx file not found")
                return False
                
            with open(pending_page_path, 'r') as f:
                content = f.read()
                
            # Check for key features
            features = [
                ('Account Pending', 'Pending status display'),
                ('useAuth', 'Authentication context usage'),
                ('user?.displayName', 'User information display'),
                ('user?.email', 'Email display'),
                ('signOut', 'Sign out functionality'),
                ('Pending Approval', 'Status message'),
                ('admin team', 'Admin review process info'),
                ('support@', 'Support contact info')
            ]
            
            found_features = []
            for feature, description in features:
                if feature in content:
                    found_features.append(f"✓ {description}")
                else:
                    found_features.append(f"✗ {description}")
                    
            success = len([f for f in found_features if '✓' in f]) >= 6  # At least 6/8 features
            details = f"Features: {len([f for f in found_features if '✓' in f])}/{len(features)} implemented"
            
            self.log_test("PendingApproval Implementation", success, details)
            return success
            
        except Exception as e:
            self.log_test("PendingApproval Implementation", False, f"Error: {str(e)}")
            return False
            
    def test_firebase_integration_setup(self):
        """Test Firebase integration setup and configuration"""
        try:
            firebase_config_path = "/app/frontend/src/config/firebase.js"
            
            if not os.path.exists(firebase_config_path):
                self.log_test("Firebase Integration Setup", False, "firebase.js config file not found")
                return False
                
            with open(firebase_config_path, 'r') as f:
                content = f.read()
                
            # Check for Firebase integration features
            features = [
                ('initializeApp', 'Firebase app initialization'),
                ('getAuth', 'Firebase Auth setup'),
                ('getDatabase', 'Firebase Database setup'),
                ('GoogleAuthProvider', 'Google OAuth provider'),
                ('isFirebaseConfigured', 'Configuration check'),
                ('mock services', 'Fallback mock services'),
                ('process.env.REACT_APP_FIREBASE', 'Environment variable usage'),
                ('auth.onAuthStateChanged', 'Auth state listener')
            ]
            
            found_features = []
            for feature, description in features:
                if feature in content:
                    found_features.append(f"✓ {description}")
                else:
                    found_features.append(f"✗ {description}")
                    
            success = len([f for f in found_features if '✓' in f]) >= 6  # At least 6/8 features
            details = f"Integration features: {len([f for f in found_features if '✓' in f])}/{len(features)} implemented"
            
            self.log_test("Firebase Integration Setup", success, details)
            return success
            
        except Exception as e:
            self.log_test("Firebase Integration Setup", False, f"Error: {str(e)}")
            return False
            
    def test_demo_mode_functionality(self):
        """Test demo mode functionality through URL parameters"""
        try:
            # Test frontend accessibility with demo parameters
            demo_tests = []
            
            # Test if frontend serves pages with demo parameters
            try:
                response = requests.get(f"{self.frontend_url}/?demo=admin", timeout=10)
                if response.status_code == 200:
                    demo_tests.append("✓ Admin demo URL accessible")
                else:
                    demo_tests.append("✗ Admin demo URL failed")
            except:
                demo_tests.append("✗ Admin demo URL error")
                
            try:
                response = requests.get(f"{self.frontend_url}/?demo=student", timeout=10)
                if response.status_code == 200:
                    demo_tests.append("✓ Student demo URL accessible")
                else:
                    demo_tests.append("✗ Student demo URL failed")
            except:
                demo_tests.append("✗ Student demo URL error")
                
            success = all("✓" in test for test in demo_tests)
            details = ", ".join(demo_tests)
            
            self.log_test("Demo Mode URL Functionality", success, details)
            return success
            
        except Exception as e:
            self.log_test("Demo Mode URL Functionality", False, f"Error: {str(e)}")
            return False
            
    def run_all_tests(self):
        """Run all authentication system backend tests"""
        print("🔐 Starting Phase 2 Authentication System Backend Tests")
        print("=" * 60)
        
        # Core functionality tests
        tests = [
            self.test_backend_health_check,
            self.test_frontend_server_accessibility,
            self.test_firebase_config_files,
            self.test_authentication_components_exist,
            self.test_auth_context_implementation,
            self.test_auth_service_implementation,
            self.test_route_protection_implementation,
            self.test_login_page_implementation,
            self.test_pending_approval_implementation,
            self.test_firebase_integration_setup,
            self.test_student_management_apis,
            self.test_student_status_update_api,
            self.test_demo_mode_functionality
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
            print()  # Add spacing between tests
            
        # Summary
        print("=" * 60)
        print(f"🔐 Phase 2 Authentication System Backend Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("✅ ALL TESTS PASSED - Authentication system backend is working correctly!")
        else:
            print(f"❌ {total - passed} tests failed - Authentication system needs attention")
            
        return passed == total

def main():
    """Main test execution"""
    tester = AuthenticationBackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 Phase 2 Authentication System backend implementation is ready!")
    else:
        print("\n⚠️  Phase 2 Authentication System backend has issues that need to be resolved.")
        
    return success

if __name__ == "__main__":
    main()