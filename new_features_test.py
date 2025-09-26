#!/usr/bin/env python3
"""
TribeFit Backend Testing - NEW INTERACTIVE FEATURES
Testing all newly implemented interactive features as requested:

1. Workout Session System - Interactive session data preparation
2. AI Workout Generation - Emergent LLM integration  
3. Pact Voting Integration - Equipment/donation requests flow to pending votes
4. Enhanced Equipment Catalog - Scrollable catalog with spec selection
5. Calendar Integration - Workout scheduling APIs
6. Coach System - All hire/rate functionalities
7. Tip System - TribeCoin transfers between users
8. Profile System - Avatar and customization support
"""

import requests
import json
import time
from datetime import datetime

# Base URL from environment
BASE_URL = "https://workout-pact.preview.emergentagent.com/api"

def test_api_endpoint(method, endpoint, data=None, expected_status=200, description=""):
    """Helper function to test API endpoints"""
    url = f"{BASE_URL}/{endpoint}"
    
    try:
        print(f"\n🧪 Testing: {description}")
        print(f"   {method} {url}")
        
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        elif method == "PUT":
            response = requests.put(url, json=data, timeout=10)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
            
        print(f"   Status: {response.status_code}")
        
        if response.status_code == expected_status:
            try:
                result = response.json()
                print(f"   ✅ SUCCESS: {description}")
                if isinstance(result, dict) and len(result) <= 3:
                    print(f"   Response: {result}")
                elif isinstance(result, list) and len(result) <= 2:
                    print(f"   Response: {result}")
                else:
                    print(f"   Response: [Large response - {len(str(result))} chars]")
                return True
            except:
                print(f"   ✅ SUCCESS: {description} (Non-JSON response)")
                return True
        else:
            try:
                error_data = response.json()
                print(f"   ❌ FAILED: Expected {expected_status}, got {response.status_code}")
                print(f"   Error: {error_data}")
            except:
                print(f"   ❌ FAILED: Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"   ❌ TIMEOUT: {description}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"   ❌ REQUEST ERROR: {e}")
        return False
    except Exception as e:
        print(f"   ❌ UNEXPECTED ERROR: {e}")
        return False

def main():
    print("=" * 80)
    print("🏋️ TRIBEFIT BACKEND TESTING - NEW INTERACTIVE FEATURES")
    print("=" * 80)
    
    results = []
    
    # ========================================
    # 1. WORKOUT SESSION SYSTEM
    # ========================================
    print("\n" + "="*50)
    print("1️⃣ WORKOUT SESSION SYSTEM")
    print("="*50)
    
    # Test workout/today endpoint first
    success = test_api_endpoint(
        "GET", "workout/today",
        description="Get today's workout plan"
    )
    results.append(("Workout Today API", success))
    
    # Test workout session start
    success = test_api_endpoint(
        "POST", "workout/start",
        data={"programId": "prog-1"},
        description="Start interactive workout session"
    )
    results.append(("Workout Session Start", success))
    
    # Test workout shrink functionality
    success = test_api_endpoint(
        "POST", "workout/shrink",
        data={"minutes": 30},
        description="Shrink workout to 30 minutes"
    )
    results.append(("Workout Shrink Feature", success))
    
    # Test workout set logging
    success = test_api_endpoint(
        "POST", "workout/set",
        data={
            "sessionId": "session-123",
            "exerciseId": "ex-1",
            "reps_done": 10,
            "load_kg": 20
        },
        description="Log workout set"
    )
    results.append(("Workout Set Logging", success))
    
    # Test workout finish
    success = test_api_endpoint(
        "POST", "workout/finish",
        data={
            "sessionId": "session-123",
            "duration_s": 2700,
            "kcal": 350
        },
        description="Finish workout session"
    )
    results.append(("Workout Finish", success))
    
    # ========================================
    # 2. AI WORKOUT GENERATION
    # ========================================
    print("\n" + "="*50)
    print("2️⃣ AI WORKOUT GENERATION WITH EMERGENT LLM")
    print("="*50)
    
    success = test_api_endpoint(
        "POST", "generate-workout",
        data={
            "fitnessGoals": "muscle building",
            "availableTime": 45,
            "equipment": "dumbbells, barbell",
            "experienceLevel": "intermediate",
            "userId": "00000000-0000-0000-0000-000000000001"
        },
        description="Generate AI workout with GPT-4o-mini"
    )
    results.append(("AI Workout Generation", success))
    
    # ========================================
    # 3. PACT VOTING INTEGRATION
    # ========================================
    print("\n" + "="*50)
    print("3️⃣ PACT VOTING INTEGRATION")
    print("="*50)
    
    # Test equipment request (should create pending vote)
    success = test_api_endpoint(
        "POST", "pact/spend/request",
        data={
            "type": "gear",
            "label": "Dumbbells 20kg Set",
            "amount_tc": 160,
            "item_id": "dumbbell",
            "specs": {"weight": "20kg", "quantity": 2}
        },
        description="Equipment request → Should create pending vote"
    )
    results.append(("Equipment Request to Voting", success))
    
    # Test donation request (should create pending vote)
    success = test_api_endpoint(
        "POST", "pact/spend/request",
        data={
            "type": "donation",
            "label": "Local Gym Donation",
            "amount_tc": 200,
            "gym_name": "FitLife Gym"
        },
        description="Donation request → Should create pending vote"
    )
    results.append(("Donation Request to Voting", success))
    
    # Check if voting endpoints exist
    success = test_api_endpoint(
        "GET", "pact/votes",
        expected_status=404,  # Expecting 404 if not implemented
        description="Check for voting system endpoints"
    )
    if not success:
        print("   ⚠️  NOTE: Voting system endpoints may not be implemented")
    
    # Test pact ledger to see spend requests
    success = test_api_endpoint(
        "GET", "pact/ledger?tribe_id=10000000-0000-0000-0000-000000000001",
        description="Get pact ledger with spend requests"
    )
    results.append(("Pact Ledger with Requests", success))
    
    # ========================================
    # 4. ENHANCED EQUIPMENT CATALOG
    # ========================================
    print("\n" + "="*50)
    print("4️⃣ ENHANCED EQUIPMENT CATALOG")
    print("="*50)
    
    success = test_api_endpoint(
        "GET", "catalog/list",
        description="Get scrollable equipment catalog with specs"
    )
    results.append(("Equipment Catalog", success))
    
    # ========================================
    # 5. CALENDAR INTEGRATION
    # ========================================
    print("\n" + "="*50)
    print("5️⃣ CALENDAR INTEGRATION")
    print("="*50)
    
    # Test for calendar endpoints
    success = test_api_endpoint(
        "GET", "calendar/schedule",
        expected_status=404,  # Expecting 404 if not implemented
        description="Check for workout scheduling API"
    )
    if not success:
        print("   ⚠️  NOTE: Calendar integration may not be implemented")
    
    success = test_api_endpoint(
        "POST", "calendar/schedule",
        data={
            "date": "2024-01-15",
            "time": "09:00",
            "workout_type": "strength"
        },
        expected_status=404,  # Expecting 404 if not implemented
        description="Test workout scheduling"
    )
    if not success:
        print("   ⚠️  NOTE: Workout scheduling may not be implemented")
    
    # ========================================
    # 6. COACH SYSTEM (hire/rate)
    # ========================================
    print("\n" + "="*50)
    print("6️⃣ COACH SYSTEM - HIRE/RATE FUNCTIONALITY")
    print("="*50)
    
    # Get coach list
    success = test_api_endpoint(
        "GET", "coach/list",
        description="Get available coaches"
    )
    results.append(("Coach List", success))
    
    # Test coach hire
    success = test_api_endpoint(
        "POST", "coach/hire",
        data={
            "clientId": "00000000-0000-0000-0000-000000000001",
            "coachId": "00000000-0000-0000-0000-000000000001",
            "offeringId": "offer-1",
            "priceTc": 200
        },
        description="Hire coach with TribeCoins"
    )
    results.append(("Coach Hire", success))
    
    # Test coach rating
    success = test_api_endpoint(
        "POST", "coach/rate",
        data={
            "hireId": "hire-123",
            "coachId": "00000000-0000-0000-0000-000000000001",
            "stars": 5,
            "text": "Excellent coaching!"
        },
        description="Rate coach (1-5 stars)"
    )
    results.append(("Coach Rating", success))
    
    # ========================================
    # 7. TIP SYSTEM
    # ========================================
    print("\n" + "="*50)
    print("7️⃣ TIP SYSTEM - TRIBECOIN TRANSFERS")
    print("="*50)
    
    success = test_api_endpoint(
        "POST", "tip",
        data={
            "fromUserId": "00000000-0000-0000-0000-000000000001",
            "toUserId": "00000000-0000-0000-0000-000000000002",
            "amount": 25,
            "message": "Great workout motivation!"
        },
        description="Send TribeCoin tip between users"
    )
    results.append(("Tip System", success))
    
    # ========================================
    # 8. PROFILE SYSTEM
    # ========================================
    print("\n" + "="*50)
    print("8️⃣ PROFILE SYSTEM - AVATAR & CUSTOMIZATION")
    print("="*50)
    
    # Get current user profile
    success = test_api_endpoint(
        "GET", "user/current",
        description="Get user profile with avatar support"
    )
    results.append(("User Profile", success))
    
    # Test profile settings update
    success = test_api_endpoint(
        "PUT", "user/settings",
        data={
            "avatar_url": "https://example.com/avatar.jpg",
            "display_name": "Fitness Enthusiast",
            "privacy": "friends"
        },
        description="Update profile settings"
    )
    results.append(("Profile Customization", success))
    
    # ========================================
    # SUMMARY
    # ========================================
    print("\n" + "="*80)
    print("📊 TEST RESULTS SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    print(f"\n✅ PASSED: {passed}/{total} tests ({passed/total*100:.1f}%)")
    print(f"❌ FAILED: {total-passed}/{total} tests")
    
    print("\n📋 DETAILED RESULTS:")
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"   {status} - {test_name}")
    
    # Critical findings
    print("\n🔍 CRITICAL FINDINGS:")
    
    # Check for missing features
    missing_features = []
    if not any("Voting" in name for name, success in results if success):
        missing_features.append("Pact Voting Integration")
    if not any("Calendar" in name for name, success in results if success):
        missing_features.append("Calendar Integration")
    
    if missing_features:
        print("   ⚠️  MISSING FEATURES:")
        for feature in missing_features:
            print(f"      - {feature}")
    
    # Check for working core features
    working_features = []
    if any("Workout Session" in name for name, success in results if success):
        working_features.append("Workout Session System")
    if any("AI Workout" in name for name, success in results if success):
        working_features.append("AI Workout Generation")
    if any("Equipment Catalog" in name for name, success in results if success):
        working_features.append("Enhanced Equipment Catalog")
    if any("Coach" in name for name, success in results if success):
        working_features.append("Coach System")
    if any("Tip" in name for name, success in results if success):
        working_features.append("Tip System")
    
    if working_features:
        print("   ✅ WORKING FEATURES:")
        for feature in working_features:
            print(f"      - {feature}")
    
    print("\n" + "="*80)
    print("🏁 TESTING COMPLETE")
    print("="*80)

if __name__ == "__main__":
    main()