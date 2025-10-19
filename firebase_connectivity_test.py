#!/usr/bin/env python3
"""
Simple Firebase connectivity test
"""

import requests
import json
import time

# Test direct Firebase REST API access
FIREBASE_DB_URL = "https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app"

def test_firebase_rest_api():
    """Test Firebase Realtime Database REST API"""
    try:
        # Test reading from Firebase directly
        response = requests.get(f"{FIREBASE_DB_URL}/test.json", timeout=10)
        print(f"Firebase REST API Status: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        return response.status_code == 200
    except Exception as e:
        print(f"Firebase REST API Error: {e}")
        return False

def test_firebase_write():
    """Test writing to Firebase directly"""
    try:
        test_data = {
            "timestamp": int(time.time()),
            "test": "connectivity_check"
        }
        response = requests.put(
            f"{FIREBASE_DB_URL}/connectivity_test.json",
            json=test_data,
            timeout=10
        )
        print(f"Firebase Write Status: {response.status_code}")
        print(f"Write Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Firebase Write Error: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Firebase Connectivity...")
    print("=" * 50)
    
    print("\n1. Testing Firebase REST API Read...")
    read_success = test_firebase_rest_api()
    
    print("\n2. Testing Firebase REST API Write...")
    write_success = test_firebase_write()
    
    print(f"\n📊 Results:")
    print(f"Read: {'✅ Success' if read_success else '❌ Failed'}")
    print(f"Write: {'✅ Success' if write_success else '❌ Failed'}")