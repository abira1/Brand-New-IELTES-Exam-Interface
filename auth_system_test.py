#!/usr/bin/env python3
"""
Phase 2 Authentication System Testing
Tests authentication components, Firebase integration, demo modes, and route protection
"""

import requests
import json
import time
import os
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import subprocess

# Test Configuration
FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:5001"
FIREBASE_FUNCTIONS_URL = "http://localhost:5001"

class AuthenticationSystemTester:
    def __init__(self):
        self.frontend_url = FRONTEND_URL
        self.backend_url = BACKEND_URL
        self.test_results = []
        self.driver = None
        
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
        
    def setup_browser(self):
        """Setup headless Chrome browser for testing"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.implicitly_wait(10)
            
            self.log_test("Browser Setup", True, "Chrome headless browser initialized")
            return True
        except Exception as e:
            self.log_test("Browser Setup", False, f"Error: {str(e)}")
            return False
            
    def cleanup_browser(self):
        """Cleanup browser resources"""
        if self.driver:
            self.driver.quit()
            
    def test_frontend_server_running(self):
        """Test if frontend server is accessible"""
        try:
            response = requests.get(self.frontend_url, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            self.log_test("Frontend Server Running", success, details)
            return success
        except Exception as e:
            self.log_test("Frontend Server Running", False, f"Error: {str(e)}")
            return False
            
    def test_backend_server_running(self):
        """Test if Firebase Functions backend is accessible"""
        try:
            response = requests.get(f"{self.backend_url}/healthCheck", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Response: {response.json()}"
            self.log_test("Backend Server Running", success, details)
            return success
        except Exception as e:
            self.log_test("Backend Server Running", False, f"Error: {str(e)}")
            return False
            
    def test_login_page_component(self):
        """Test LoginPage.jsx component exists and renders correctly"""
        try:
            if not self.driver:
                return False
                
            self.driver.get(f"{self.frontend_url}/login")
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Check for key elements
            elements_to_check = [
                ("IELTS Mock Test", "Page title"),
                ("Sign In to Your Account", "Login card title"),
                ("Continue with Google", "Google login button"),
                ("Enter Demo Mode", "Demo mode button")
            ]
            
            found_elements = []
            for text, description in elements_to_check:
                try:
                    element = self.driver.find_element(By.XPATH, f"//*[contains(text(), '{text}')]")
                    found_elements.append(f"✓ {description}")
                except NoSuchElementException:
                    found_elements.append(f"✗ {description}")
            
            # Check if all critical elements are present
            success = all("✓" in elem for elem in found_elements)
            details = f"Elements found: {', '.join(found_elements)}"
            
            self.log_test("LoginPage Component Rendering", success, details)
            return success
            
        except Exception as e:
            self.log_test("LoginPage Component Rendering", False, f"Error: {str(e)}")
            return False
            
    def test_pending_approval_component(self):
        """Test PendingApproval.jsx component accessibility"""
        try:
            if not self.driver:
                return False
                
            # Try to access pending approval page directly
            self.driver.get(f"{self.frontend_url}/pending")
            
            # Should redirect to login if not authenticated
            WebDriverWait(self.driver, 5).until(
                lambda driver: "/login" in driver.current_url
            )
            
            success = "/login" in self.driver.current_url
            details = f"Redirected to: {self.driver.current_url}"
            
            self.log_test("PendingApproval Component Protection", success, details)
            return success
            
        except Exception as e:
            self.log_test("PendingApproval Component Protection", False, f"Error: {str(e)}")
            return False
            
    def test_demo_admin_mode(self):
        """Test ?demo=admin URL parameter functionality"""
        try:
            if not self.driver:
                return False
                
            # Access with demo=admin parameter
            self.driver.get(f"{self.frontend_url}/?demo=admin")
            
            # Wait for redirect to admin dashboard
            WebDriverWait(self.driver, 10).until(
                lambda driver: "/admin" in driver.current_url
            )
            
            # Check for admin dashboard elements
            try:
                # Look for admin-specific elements
                admin_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Admin') or contains(text(), 'Dashboard') or contains(text(), 'Students') or contains(text(), 'Exams')]")
                has_admin_elements = len(admin_elements) > 0
                
                success = "/admin" in self.driver.current_url and has_admin_elements
                details = f"URL: {self.driver.current_url}, Admin elements found: {len(admin_elements)}"
                
            except Exception:
                success = "/admin" in self.driver.current_url
                details = f"URL: {self.driver.current_url}"
            
            self.log_test("Demo Admin Mode", success, details)
            return success
            
        except Exception as e:
            self.log_test("Demo Admin Mode", False, f"Error: {str(e)}")
            return False
            
    def test_demo_student_mode(self):
        """Test ?demo=student URL parameter functionality"""
        try:
            if not self.driver:
                return False
                
            # Clear any existing demo mode
            self.driver.execute_script("localStorage.clear();")
            
            # Access with demo=student parameter
            self.driver.get(f"{self.frontend_url}/?demo=student")
            
            # Wait for redirect to student dashboard
            WebDriverWait(self.driver, 10).until(
                lambda driver: "/student" in driver.current_url
            )
            
            # Check for student dashboard elements
            try:
                student_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Student') or contains(text(), 'Dashboard') or contains(text(), 'Exam') or contains(text(), 'My Results')]")
                has_student_elements = len(student_elements) > 0
                
                success = "/student" in self.driver.current_url and has_student_elements
                details = f"URL: {self.driver.current_url}, Student elements found: {len(student_elements)}"
                
            except Exception:
                success = "/student" in self.driver.current_url
                details = f"URL: {self.driver.current_url}"
            
            self.log_test("Demo Student Mode", success, details)
            return success
            
        except Exception as e:
            self.log_test("Demo Student Mode", False, f"Error: {str(e)}")
            return False
            
    def test_demo_mode_persistence(self):
        """Test demo mode localStorage persistence"""
        try:
            if not self.driver:
                return False
                
            # Set demo mode and check localStorage
            self.driver.get(f"{self.frontend_url}/?demo=admin")
            
            # Wait for page to load
            time.sleep(2)
            
            # Check localStorage
            demo_mode = self.driver.execute_script("return localStorage.getItem('demoMode');")
            
            success = demo_mode == 'admin'
            details = f"localStorage demoMode: {demo_mode}"
            
            self.log_test("Demo Mode Persistence", success, details)
            return success
            
        except Exception as e:
            self.log_test("Demo Mode Persistence", False, f"Error: {str(e)}")
            return False
            
    def test_route_protection_admin(self):
        """Test admin-only routes (/admin/*) protection"""
        try:
            if not self.driver:
                return False
                
            # Clear demo mode
            self.driver.execute_script("localStorage.clear();")
            
            # Try to access admin route without authentication
            self.driver.get(f"{self.frontend_url}/admin")
            
            # Should redirect to login
            WebDriverWait(self.driver, 10).until(
                lambda driver: "/login" in driver.current_url
            )
            
            success = "/login" in self.driver.current_url
            details = f"Redirected to: {self.driver.current_url}"
            
            self.log_test("Admin Route Protection", success, details)
            return success
            
        except Exception as e:
            self.log_test("Admin Route Protection", False, f"Error: {str(e)}")
            return False
            
    def test_route_protection_student(self):
        """Test student-only routes (/student/*, /exam/*) protection"""
        try:
            if not self.driver:
                return False
                
            # Clear demo mode
            self.driver.execute_script("localStorage.clear();")
            
            # Try to access student route without authentication
            self.driver.get(f"{self.frontend_url}/student")
            
            # Should redirect to login
            WebDriverWait(self.driver, 10).until(
                lambda driver: "/login" in driver.current_url
            )
            
            success = "/login" in self.driver.current_url
            details = f"Redirected to: {self.driver.current_url}"
            
            self.log_test("Student Route Protection", success, details)
            return success
            
        except Exception as e:
            self.log_test("Student Route Protection", False, f"Error: {str(e)}")
            return False
            
    def test_exam_route_protection(self):
        """Test exam route (/exam/*) protection"""
        try:
            if not self.driver:
                return False
                
            # Clear demo mode
            self.driver.execute_script("localStorage.clear();")
            
            # Try to access exam route without authentication
            self.driver.get(f"{self.frontend_url}/exam/test-exam-id")
            
            # Should redirect to login
            WebDriverWait(self.driver, 10).until(
                lambda driver: "/login" in driver.current_url
            )
            
            success = "/login" in self.driver.current_url
            details = f"Redirected to: {self.driver.current_url}"
            
            self.log_test("Exam Route Protection", success, details)
            return success
            
        except Exception as e:
            self.log_test("Exam Route Protection", False, f"Error: {str(e)}")
            return False
            
    def test_unauthorized_access_redirect(self):
        """Test unauthorized access redirects"""
        try:
            if not self.driver:
                return False
                
            # Set student demo mode
            self.driver.get(f"{self.frontend_url}/?demo=student")
            time.sleep(2)
            
            # Try to access admin route as student
            self.driver.get(f"{self.frontend_url}/admin")
            
            # Should redirect away from admin (to student dashboard or unauthorized)
            time.sleep(3)
            current_url = self.driver.current_url
            
            success = "/admin" not in current_url
            details = f"Student trying to access admin redirected to: {current_url}"
            
            self.log_test("Unauthorized Access Redirect", success, details)
            return success
            
        except Exception as e:
            self.log_test("Unauthorized Access Redirect", False, f"Error: {str(e)}")
            return False
            
    def test_firebase_config_setup(self):
        """Test Firebase configuration setup"""
        try:
            # Check if Firebase environment variables are set
            env_file_path = "/app/frontend/.env"
            
            if not os.path.exists(env_file_path):
                self.log_test("Firebase Configuration", False, ".env file not found")
                return False
                
            with open(env_file_path, 'r') as f:
                env_content = f.read()
                
            required_vars = [
                'REACT_APP_FIREBASE_API_KEY',
                'REACT_APP_FIREBASE_AUTH_DOMAIN',
                'REACT_APP_FIREBASE_PROJECT_ID'
            ]
            
            found_vars = []
            for var in required_vars:
                if var in env_content and not env_content.split(var + '=')[1].split('\n')[0].strip() == '':
                    found_vars.append(var)
                    
            success = len(found_vars) == len(required_vars)
            details = f"Found {len(found_vars)}/{len(required_vars)} required Firebase config vars"
            
            self.log_test("Firebase Configuration Setup", success, details)
            return success
            
        except Exception as e:
            self.log_test("Firebase Configuration Setup", False, f"Error: {str(e)}")
            return False
            
    def test_auth_context_functionality(self):
        """Test AuthContext.js provides proper authentication context"""
        try:
            if not self.driver:
                return False
                
            # Access demo mode to test auth context
            self.driver.get(f"{self.frontend_url}/?demo=admin")
            
            # Wait for authentication to process
            time.sleep(3)
            
            # Check if we're redirected to admin (indicating auth context works)
            success = "/admin" in self.driver.current_url
            details = f"Auth context processed demo mode, redirected to: {self.driver.current_url}"
            
            self.log_test("AuthContext Functionality", success, details)
            return success
            
        except Exception as e:
            self.log_test("AuthContext Functionality", False, f"Error: {str(e)}")
            return False
            
    def test_auth_service_fallback(self):
        """Test authService.js handles Firebase not configured gracefully"""
        try:
            if not self.driver:
                return False
                
            # Access login page and check for Firebase fallback behavior
            self.driver.get(f"{self.frontend_url}/login")
            
            # Wait for page to load
            time.sleep(3)
            
            # Check if demo mode button is available (fallback behavior)
            try:
                demo_button = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Demo Mode')]")
                has_demo_fallback = True
            except NoSuchElementException:
                has_demo_fallback = False
                
            # Check if Google login button exists (even if Firebase not configured)
            try:
                google_button = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Continue with Google')]")
                has_google_button = True
            except NoSuchElementException:
                has_google_button = False
                
            success = has_demo_fallback and has_google_button
            details = f"Demo fallback: {has_demo_fallback}, Google button: {has_google_button}"
            
            self.log_test("AuthService Fallback Behavior", success, details)
            return success
            
        except Exception as e:
            self.log_test("AuthService Fallback Behavior", False, f"Error: {str(e)}")
            return False
            
    def test_role_based_access_control(self):
        """Test role-based access control implementation"""
        try:
            if not self.driver:
                return False
                
            test_results = []
            
            # Test admin role access
            self.driver.get(f"{self.frontend_url}/?demo=admin")
            time.sleep(2)
            admin_success = "/admin" in self.driver.current_url
            test_results.append(f"Admin access: {'✓' if admin_success else '✗'}")
            
            # Test student role access
            self.driver.execute_script("localStorage.clear();")
            self.driver.get(f"{self.frontend_url}/?demo=student")
            time.sleep(2)
            student_success = "/student" in self.driver.current_url
            test_results.append(f"Student access: {'✓' if student_success else '✗'}")
            
            success = admin_success and student_success
            details = ", ".join(test_results)
            
            self.log_test("Role-Based Access Control", success, details)
            return success
            
        except Exception as e:
            self.log_test("Role-Based Access Control", False, f"Error: {str(e)}")
            return False
            
    def test_authentication_flow_completeness(self):
        """Test complete authentication flow"""
        try:
            if not self.driver:
                return False
                
            flow_steps = []
            
            # Step 1: Start at root
            self.driver.get(self.frontend_url)
            time.sleep(2)
            if "/login" in self.driver.current_url:
                flow_steps.append("✓ Root redirects to login")
            else:
                flow_steps.append("✗ Root redirect failed")
                
            # Step 2: Login page loads
            login_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Sign In')]")
            if login_elements:
                flow_steps.append("✓ Login page renders")
            else:
                flow_steps.append("✗ Login page failed")
                
            # Step 3: Demo login works
            self.driver.get(f"{self.frontend_url}/?demo=admin")
            time.sleep(2)
            if "/admin" in self.driver.current_url:
                flow_steps.append("✓ Demo authentication works")
            else:
                flow_steps.append("✗ Demo authentication failed")
                
            # Step 4: Protected routes work
            admin_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Admin') or contains(text(), 'Dashboard')]")
            if admin_elements:
                flow_steps.append("✓ Protected content accessible")
            else:
                flow_steps.append("✗ Protected content failed")
                
            success = all("✓" in step for step in flow_steps)
            details = " → ".join(flow_steps)
            
            self.log_test("Complete Authentication Flow", success, details)
            return success
            
        except Exception as e:
            self.log_test("Complete Authentication Flow", False, f"Error: {str(e)}")
            return False
            
    def run_all_tests(self):
        """Run all authentication system tests"""
        print("🔐 Starting Phase 2 Authentication System Tests")
        print("=" * 60)
        
        # Setup browser
        if not self.setup_browser():
            print("❌ Cannot run frontend tests without browser setup")
            return False
            
        # Core functionality tests
        tests = [
            self.test_frontend_server_running,
            self.test_backend_server_running,
            self.test_firebase_config_setup,
            self.test_login_page_component,
            self.test_pending_approval_component,
            self.test_demo_admin_mode,
            self.test_demo_student_mode,
            self.test_demo_mode_persistence,
            self.test_route_protection_admin,
            self.test_route_protection_student,
            self.test_exam_route_protection,
            self.test_unauthorized_access_redirect,
            self.test_auth_context_functionality,
            self.test_auth_service_fallback,
            self.test_role_based_access_control,
            self.test_authentication_flow_completeness
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
            print()  # Add spacing between tests
            
        # Cleanup
        self.cleanup_browser()
        
        # Summary
        print("=" * 60)
        print(f"🔐 Phase 2 Authentication System Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("✅ ALL TESTS PASSED - Authentication system is working correctly!")
        else:
            print(f"❌ {total - passed} tests failed - Authentication system needs attention")
            
        return passed == total

def main():
    """Main test execution"""
    tester = AuthenticationSystemTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 Phase 2 Authentication System implementation is ready for production!")
    else:
        print("\n⚠️  Phase 2 Authentication System has issues that need to be resolved.")
        
    return success

if __name__ == "__main__":
    main()