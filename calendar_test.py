#!/usr/bin/env python3
"""
TribeFit Backend API Testing - Calendar Scheduling Focus
Testing calendar scheduling functionality as requested in review.
Focus on user-reported issue: "missing required fields: date, time, workout_name, user_id" error
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://workout-pact-1.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def test_calendar_scheduling():
    """Test calendar scheduling functionality with focus on user-reported issues"""
    print("🗓️  TESTING CALENDAR SCHEDULING FUNCTIONALITY")
    print("=" * 60)
    
    results = []
    
    # Test 1: Calendar Scheduling API with exact payload from review request
    print("\n1. Testing Calendar Scheduling API (POST /api/calendar)")
    print("   Using exact payload from review request...")
    
    try:
        payload = {
            "date": "2024-01-15",
            "time": "07:00",
            "workout_name": "Push/Pull/Legs",
            "user_id": "00000000-0000-0000-0000-000000000001",
            "user_name": "Alex Chen",
            "shared": True,
            "workout_type": "predefined"
        }
        
        response = requests.post(f"{API_BASE}/calendar", json=payload, timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("   ✅ SUCCESS: Workout scheduled successfully")
                results.append("✅ Calendar scheduling with exact payload: WORKING")
            else:
                print("   ❌ FAILED: Success flag not set")
                results.append("❌ Calendar scheduling with exact payload: FAILED")
        else:
            print(f"   ❌ FAILED: HTTP {response.status_code}")
            results.append(f"❌ Calendar scheduling with exact payload: FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results.append(f"❌ Calendar scheduling with exact payload: ERROR ({str(e)})")
    
    # Test 2: Field Validation - Missing required fields
    print("\n2. Testing Field Validation - Missing Required Fields")
    
    # Test missing date
    try:
        payload_missing_date = {
            "time": "08:00",
            "workout_name": "Upper Body",
            "user_id": "00000000-0000-0000-0000-000000000001",
            "user_name": "Alex Chen"
        }
        
        response = requests.post(f"{API_BASE}/calendar", json=payload_missing_date, timeout=10)
        print(f"   Missing date - Status: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            if "Missing required fields" in data.get('error', ''):
                print("   ✅ SUCCESS: Proper validation for missing date")
                results.append("✅ Field validation (missing date): WORKING")
            else:
                print("   ❌ FAILED: Wrong error message")
                results.append("❌ Field validation (missing date): FAILED")
        else:
            print(f"   ❌ FAILED: Expected 400, got {response.status_code}")
            results.append(f"❌ Field validation (missing date): FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results.append(f"❌ Field validation (missing date): ERROR ({str(e)})")
    
    # Test missing time
    try:
        payload_missing_time = {
            "date": "2024-01-16",
            "workout_name": "Lower Body",
            "user_id": "00000000-0000-0000-0000-000000000001",
            "user_name": "Alex Chen"
        }
        
        response = requests.post(f"{API_BASE}/calendar", json=payload_missing_time, timeout=10)
        print(f"   Missing time - Status: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            if "Missing required fields" in data.get('error', ''):
                print("   ✅ SUCCESS: Proper validation for missing time")
                results.append("✅ Field validation (missing time): WORKING")
            else:
                print("   ❌ FAILED: Wrong error message")
                results.append("❌ Field validation (missing time): FAILED")
        else:
            print(f"   ❌ FAILED: Expected 400, got {response.status_code}")
            results.append(f"❌ Field validation (missing time): FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results.append(f"❌ Field validation (missing time): ERROR ({str(e)})")
    
    # Test missing workout_name
    try:
        payload_missing_workout = {
            "date": "2024-01-17",
            "time": "09:00",
            "user_id": "00000000-0000-0000-0000-000000000001",
            "user_name": "Alex Chen"
        }
        
        response = requests.post(f"{API_BASE}/calendar", json=payload_missing_workout, timeout=10)
        print(f"   Missing workout_name - Status: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            if "Missing required fields" in data.get('error', ''):
                print("   ✅ SUCCESS: Proper validation for missing workout_name")
                results.append("✅ Field validation (missing workout_name): WORKING")
            else:
                print("   ❌ FAILED: Wrong error message")
                results.append("❌ Field validation (missing workout_name): FAILED")
        else:
            print(f"   ❌ FAILED: Expected 400, got {response.status_code}")
            results.append(f"❌ Field validation (missing workout_name): FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results.append(f"❌ Field validation (missing workout_name): ERROR ({str(e)})")
    
    # Test missing user_id
    try:
        payload_missing_user = {
            "date": "2024-01-18",
            "time": "10:00",
            "workout_name": "Cardio",
            "user_name": "Alex Chen"
        }
        
        response = requests.post(f"{API_BASE}/calendar", json=payload_missing_user, timeout=10)
        print(f"   Missing user_id - Status: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            if "Missing required fields" in data.get('error', ''):
                print("   ✅ SUCCESS: Proper validation for missing user_id")
                results.append("✅ Field validation (missing user_id): WORKING")
            else:
                print("   ❌ FAILED: Wrong error message")
                results.append("❌ Field validation (missing user_id): FAILED")
        else:
            print(f"   ❌ FAILED: Expected 400, got {response.status_code}")
            results.append(f"❌ Field validation (missing user_id): FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results.append(f"❌ Field validation (missing user_id): ERROR ({str(e)})")
    
    # Test 3: Calendar Retrieval (GET /api/calendar)
    print("\n3. Testing Calendar Retrieval (GET /api/calendar)")
    
    try:
        response = requests.get(f"{API_BASE}/calendar", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'schedule' in data:
                print(f"   ✅ SUCCESS: Retrieved calendar schedule with {len(data['schedule'])} dates")
                results.append("✅ Calendar retrieval (all): WORKING")
            else:
                print("   ❌ FAILED: No schedule in response")
                results.append("❌ Calendar retrieval (all): FAILED")
        else:
            print(f"   ❌ FAILED: HTTP {response.status_code}")
            results.append(f"❌ Calendar retrieval (all): FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results.append(f"❌ Calendar retrieval (all): ERROR ({str(e)})")
    
    # Test 4: Calendar Retrieval by Date
    print("\n4. Testing Calendar Retrieval by Date")
    
    try:
        response = requests.get(f"{API_BASE}/calendar?date=2024-01-15", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'workouts' in data:
                workouts = data['workouts']
                print(f"   ✅ SUCCESS: Retrieved {len(workouts)} workouts for 2024-01-15")
                results.append("✅ Calendar retrieval (by date): WORKING")
            else:
                print("   ❌ FAILED: No workouts in response")
                results.append("❌ Calendar retrieval (by date): FAILED")
        else:
            print(f"   ❌ FAILED: HTTP {response.status_code}")
            results.append(f"❌ Calendar retrieval (by date): FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results.append(f"❌ Calendar retrieval (by date): ERROR ({str(e)})")
    
    # Test 5: Calendar Retrieval by User
    print("\n5. Testing Calendar Retrieval by User")
    
    try:
        response = requests.get(f"{API_BASE}/calendar?date=2024-01-15&user_id=00000000-0000-0000-0000-000000000001", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'workouts' in data:
                workouts = data['workouts']
                print(f"   ✅ SUCCESS: Retrieved {len(workouts)} workouts for user Alex Chen")
                results.append("✅ Calendar retrieval (by user): WORKING")
            else:
                print("   ❌ FAILED: No workouts in response")
                results.append("❌ Calendar retrieval (by user): FAILED")
        else:
            print(f"   ❌ FAILED: HTTP {response.status_code}")
            results.append(f"❌ Calendar retrieval (by user): FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results.append(f"❌ Calendar retrieval (by user): ERROR ({str(e)})")
    
    # Test 6: Conflict Detection
    print("\n6. Testing Conflict Detection")
    
    try:
        # Try to schedule another workout at the same time for the same user
        conflict_payload = {
            "date": "2024-01-15",
            "time": "07:00",  # Same time as existing workout
            "workout_name": "Conflicting Workout",
            "user_id": "00000000-0000-0000-0000-000000000001",  # Same user
            "user_name": "Alex Chen",
            "shared": False
        }
        
        response = requests.post(f"{API_BASE}/calendar", json=conflict_payload, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 409:
            data = response.json()
            if "already have a workout scheduled" in data.get('error', ''):
                print("   ✅ SUCCESS: Proper conflict detection")
                results.append("✅ Conflict detection: WORKING")
            else:
                print("   ❌ FAILED: Wrong error message")
                results.append("❌ Conflict detection: FAILED")
        else:
            print(f"   ❌ FAILED: Expected 409, got {response.status_code}")
            results.append(f"❌ Conflict detection: FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results.append(f"❌ Conflict detection: ERROR ({str(e)})")
    
    # Test 7: Invalid Date Format
    print("\n7. Testing Invalid Date Format")
    
    try:
        invalid_date_payload = {
            "date": "01-15-2024",  # Wrong format
            "time": "11:00",
            "workout_name": "Test Workout",
            "user_id": "00000000-0000-0000-0000-000000000001",
            "user_name": "Alex Chen"
        }
        
        response = requests.post(f"{API_BASE}/calendar", json=invalid_date_payload, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            if "Invalid date format" in data.get('error', ''):
                print("   ✅ SUCCESS: Proper date format validation")
                results.append("✅ Date format validation: WORKING")
            else:
                print("   ❌ FAILED: Wrong error message")
                results.append("❌ Date format validation: FAILED")
        else:
            print(f"   ❌ FAILED: Expected 400, got {response.status_code}")
            results.append(f"❌ Date format validation: FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results.append(f"❌ Date format validation: ERROR ({str(e)})")
    
    # Test 8: Invalid Time Format
    print("\n8. Testing Invalid Time Format")
    
    try:
        invalid_time_payload = {
            "date": "2024-01-19",
            "time": "25:00",  # Invalid hour
            "workout_name": "Test Workout",
            "user_id": "00000000-0000-0000-0000-000000000001",
            "user_name": "Alex Chen"
        }
        
        response = requests.post(f"{API_BASE}/calendar", json=invalid_time_payload, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            if "Invalid time format" in data.get('error', ''):
                print("   ✅ SUCCESS: Proper time format validation")
                results.append("✅ Time format validation: WORKING")
            else:
                print("   ❌ FAILED: Wrong error message")
                results.append("❌ Time format validation: FAILED")
        else:
            print(f"   ❌ FAILED: Expected 400, got {response.status_code}")
            results.append(f"❌ Time format validation: FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results.append(f"❌ Time format validation: ERROR ({str(e)})")
    
    # Test 9: Schedule Another Valid Workout
    print("\n9. Testing Schedule Another Valid Workout")
    
    try:
        new_workout_payload = {
            "date": "2024-01-20",
            "time": "08:30",
            "workout_name": "Full Body Strength",
            "user_id": "00000000-0000-0000-0000-000000000002",
            "user_name": "Jordan Kim",
            "shared": True,
            "workout_type": "custom"
        }
        
        response = requests.post(f"{API_BASE}/calendar", json=new_workout_payload, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("   ✅ SUCCESS: New workout scheduled successfully")
                results.append("✅ Schedule new workout: WORKING")
            else:
                print("   ❌ FAILED: Success flag not set")
                results.append("❌ Schedule new workout: FAILED")
        else:
            print(f"   ❌ FAILED: HTTP {response.status_code}")
            results.append(f"❌ Schedule new workout: FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results.append(f"❌ Schedule new workout: ERROR ({str(e)})")
    
    return results

def main():
    """Main testing function"""
    print("🏋️  TribeFit Backend Testing - Calendar Scheduling Focus")
    print("=" * 60)
    print(f"Testing against: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run calendar scheduling tests
    calendar_results = test_calendar_scheduling()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 CALENDAR SCHEDULING TEST SUMMARY")
    print("=" * 60)
    
    total_tests = len(calendar_results)
    passed_tests = len([r for r in calendar_results if r.startswith("✅")])
    failed_tests = total_tests - passed_tests
    
    print(f"\nTotal Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    print("\nDetailed Results:")
    for result in calendar_results:
        print(f"  {result}")
    
    # Key findings for the user's reported issue
    print("\n" + "=" * 60)
    print("🔍 KEY FINDINGS FOR USER'S REPORTED ISSUE")
    print("=" * 60)
    
    scheduling_test = next((r for r in calendar_results if "Calendar scheduling with exact payload" in r), None)
    validation_tests = [r for r in calendar_results if "Field validation" in r]
    
    if scheduling_test and scheduling_test.startswith("✅"):
        print("✅ CALENDAR SCHEDULING API IS WORKING CORRECTLY")
        print("   - The exact payload from the review request works fine")
        print("   - API accepts all required fields properly")
    else:
        print("❌ CALENDAR SCHEDULING API HAS ISSUES")
        print("   - The reported error may still be occurring")
    
    if all(v.startswith("✅") for v in validation_tests):
        print("✅ FIELD VALIDATION IS WORKING CORRECTLY")
        print("   - Missing required fields are properly detected")
        print("   - Error messages are appropriate")
    else:
        print("❌ FIELD VALIDATION HAS ISSUES")
        print("   - Some validation tests failed")
    
    print("\n" + "=" * 60)
    print("🎯 CONCLUSION")
    print("=" * 60)
    
    if passed_tests >= 7:  # Most tests should pass
        print("✅ CALENDAR SCHEDULING FUNCTIONALITY IS WORKING WELL")
        print("   The user's reported issue may be a frontend problem")
        print("   or related to how the payload is being sent from the UI.")
    else:
        print("❌ CALENDAR SCHEDULING HAS SIGNIFICANT ISSUES")
        print("   Backend API problems detected that need fixing.")
    
    return passed_tests, total_tests

if __name__ == "__main__":
    try:
        passed, total = main()
        sys.exit(0 if passed >= 7 else 1)  # Exit with error if too many failures
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        sys.exit(1)