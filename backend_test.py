#!/usr/bin/env python3
"""
TribeFit Backend API Testing Suite
Tests critical button functionality reported as broken by user:
1. Start Workout Button: POST /api/workout/start
2. Shrink Workout Button: POST /api/workout/shrink  
3. Share Today's Progress: POST /api/posts/create
4. Become Coach Button: POST /api/coach/apply
5. Hire Coach Button: POST /api/coach/hire
6. Notification System: GET /api/notifications

Also tests initial data endpoints:
- GET /api/user/current 
- GET /api/wallet/balance
- GET /api/workout/today
- GET /api/coach/list
- GET /api/posts/feed
"""

import requests
import json
import time
from typing import Dict, Any
from datetime import datetime

# Configuration
BASE_URL = "https://workout-pact.preview.emergentagent.com/api"
TEST_USER_ID = "00000000-0000-0000-0000-000000000001"  # Alex Chen with ~400 TC
TEST_USER_ID_2 = "00000000-0000-0000-0000-000000000002"  # Jordan Kim with 250 TC
TEST_COACH_ID = "00000000-0000-0000-0000-000000000001"  # Alex Chen is also a coach

class TribeFitTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'TribeFit-Backend-Tester/1.0'
        })
        self.test_results = []
        
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = f"{status}: {test_name}"
        if details:
            result += f" - {details}"
        print(result)
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        
    def make_request(self, method: str, endpoint: str, data: Dict[Any, Any] = None) -> Dict[Any, Any]:
        """Make HTTP request and return response"""
        url = f"{BASE_URL}/{endpoint.lstrip('/')}"
        try:
            if method.upper() == 'GET':
                response = self.session.get(url)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return {
                'status_code': response.status_code,
                'data': response.json() if response.content else {},
                'success': response.status_code < 400
            }
        except Exception as e:
            return {
                'status_code': 0,
                'data': {'error': str(e)},
                'success': False
            }

    def test_initial_data_endpoints(self):
        """Test initial data endpoints that populate the UI"""
        print("\n=== Testing Initial Data Endpoints ===")
        
        # Test GET /api/user/current
        response = self.make_request('GET', 'user/current')
        if response['success'] and 'user' in response['data']:
            self.log_result("GET /api/user/current", True, f"User data loaded successfully")
        else:
            self.log_result("GET /api/user/current", False, f"Failed: {response['data']}")
        
        # Test GET /api/wallet/balance
        response = self.make_request('GET', 'wallet/balance')
        if response['success'] and 'balance_tc' in response['data']:
            balance = response['data']['balance_tc']
            self.log_result("GET /api/wallet/balance", True, f"Balance: {balance} TC")
        else:
            self.log_result("GET /api/wallet/balance", False, f"Failed: {response['data']}")
        
        # Test GET /api/workout/today
        response = self.make_request('GET', 'workout/today')
        if response['success'] and 'program' in response['data']:
            program = response['data']['program']
            program_name = program.get('title', 'Unknown') if program else 'No program'
            self.log_result("GET /api/workout/today", True, f"Today's workout: {program_name}")
        else:
            self.log_result("GET /api/workout/today", False, f"Failed: {response['data']}")
        
        # Test GET /api/coach/list
        response = self.make_request('GET', 'coach/list')
        if response['success']:
            coaches = response['data'] if isinstance(response['data'], list) else []
            self.log_result("GET /api/coach/list", True, f"Found {len(coaches)} coaches")
        else:
            self.log_result("GET /api/coach/list", False, f"Failed: {response['data']}")
        
        # Test GET /api/posts/feed
        response = self.make_request('GET', 'posts/feed')
        if response['success']:
            posts = response['data'] if isinstance(response['data'], list) else []
            self.log_result("GET /api/posts/feed", True, f"Found {len(posts)} posts")
        else:
            self.log_result("GET /api/posts/feed", False, f"Failed: {response['data']}")
        
        # Test GET /api/notifications
        response = self.make_request('GET', 'notifications')
        if response['success']:
            notifications = response['data'] if isinstance(response['data'], list) else []
            self.log_result("GET /api/notifications", True, f"Found {len(notifications)} notifications")
        else:
            self.log_result("GET /api/notifications", False, f"Failed: {response['data']}")

    def test_critical_button_functionality(self):
        """Test the critical button functionality reported as broken"""
        print("\n=== Testing Critical Button Functionality ===")
        
        # 1. Test Start Workout Button: POST /api/workout/start
        print("\n🏋️ Testing Start Workout Button")
        start_workout_data = {
            'programId': 'prog-1'
        }
        response = self.make_request('POST', 'workout/start', start_workout_data)
        if response['success'] and 'session' in response['data']:
            session = response['data']['session']
            self.log_result("POST /api/workout/start (Start Workout Button)", True, 
                           f"Session created: {session.get('id', 'unknown')}")
        else:
            self.log_result("POST /api/workout/start (Start Workout Button)", False, 
                           f"Failed: {response['data']}")
        
        # 2. Test Shrink Workout Button: POST /api/workout/shrink
        print("\n⏰ Testing Shrink Workout Button")
        shrink_data = {
            'minutes': 30
        }
        response = self.make_request('POST', 'workout/shrink', shrink_data)
        if response['success'] and 'target_minutes' in response['data']:
            target = response['data']['target_minutes']
            self.log_result("POST /api/workout/shrink (Shrink Workout Button)", True, 
                           f"Workout shrunk to {target} minutes")
        else:
            self.log_result("POST /api/workout/shrink (Shrink Workout Button)", False, 
                           f"Failed: {response['data']}")
        
        # 3. Test Share Today's Progress: POST /api/posts/create
        print("\n📱 Testing Share Today's Progress Button")
        share_data = {
            'tribeId': '10000000-0000-0000-0000-000000000001',
            'caption': 'Just finished my workout! 💪 #TribeFit #Progress',
            'media_url': 'https://example.com/workout-photo.jpg'
        }
        response = self.make_request('POST', 'posts/create', share_data)
        if response['success'] and 'post' in response['data']:
            post = response['data']['post']
            self.log_result("POST /api/posts/create (Share Progress Button)", True, 
                           f"Post created: {post.get('id', 'unknown')}")
        else:
            self.log_result("POST /api/posts/create (Share Progress Button)", False, 
                           f"Failed: {response['data']}")
        
        # 4. Test Become Coach Button: POST /api/coach/apply
        print("\n👨‍🏫 Testing Become Coach Button")
        apply_data = {}  # No additional data needed for application
        response = self.make_request('POST', 'coach/apply', apply_data)
        if response['success'] and (response['data'].get('success') or 'application' in response['data']):
            self.log_result("POST /api/coach/apply (Become Coach Button)", True, 
                           "Coach application submitted successfully")
        else:
            self.log_result("POST /api/coach/apply (Become Coach Button)", False, 
                           f"Failed: {response['data']}")
        
        # 5. Test Hire Coach Button: POST /api/coach/hire
        print("\n💰 Testing Hire Coach Button")
        
        # First check current balance
        balance_response = self.make_request('GET', 'wallet/balance')
        current_balance = 0
        if balance_response['success']:
            current_balance = balance_response['data'].get('balance_tc', 0)
            print(f"Current balance: {current_balance} TC")
        
        hire_data = {
            'clientId': TEST_USER_ID,
            'coachId': TEST_COACH_ID,
            'offeringId': 'offer-1',
            'priceTc': 200
        }
        
        response = self.make_request('POST', 'coach/hire', hire_data)
        if response['success'] and response['data'].get('success'):
            hire = response['data'].get('hire', {})
            self.log_result("POST /api/coach/hire (Hire Coach Button)", True, 
                           f"Coach hired successfully for {hire.get('price_tc', 200)} TC")
        elif response['status_code'] == 402:
            self.log_result("POST /api/coach/hire (Hire Coach Button)", False, 
                           f"Insufficient balance: need 200 TC, have {current_balance} TC")
        else:
            self.log_result("POST /api/coach/hire (Hire Coach Button)", False, 
                           f"Failed: {response['data']}")

    def test_ai_workout_generation(self):
        """Test the new AI workout generation feature using Emergent LLM"""
        print("\n=== Testing AI Workout Generation (NEW FEATURE) ===")
        
        # Test AI workout generation with Emergent LLM
        print("\n🤖 Testing AI Workout Generation")
        workout_gen_data = {
            'fitnessGoals': 'Build muscle and improve strength',
            'availableTime': 45,
            'equipment': 'Dumbbells, resistance bands, bodyweight',
            'experienceLevel': 'intermediate',
            'userId': TEST_USER_ID
        }
        
        response = self.make_request('POST', 'generate-workout', workout_gen_data)
        if response['success'] and response['data'].get('success') and 'workoutPlan' in response['data']:
            plan_id = response['data'].get('planId', 'unknown')
            plan_content = response['data']['workoutPlan'][:100] + "..." if len(response['data']['workoutPlan']) > 100 else response['data']['workoutPlan']
            self.log_result("POST /api/generate-workout (AI Workout Generation)", True, 
                           f"AI workout plan generated successfully (ID: {plan_id})")
            print(f"   Preview: {plan_content}")
        else:
            self.log_result("POST /api/generate-workout (AI Workout Generation)", False, 
                           f"Failed: {response['data']}")

    def test_additional_core_functionality(self):
        """Test additional core functionality to ensure system is working"""
        print("\n=== Testing Additional Core Functionality ===")
        
        # Test skip flow (core feature)
        print("\n💸 Testing Skip Flow")
        skip_data = {
            'userId': TEST_USER_ID,
            'method': 'pay',
            'tribeId': '10000000-0000-0000-0000-000000000001'
        }
        response = self.make_request('POST', 'skip', skip_data)
        if response['success'] and response['data'].get('success'):
            new_balance = response['data'].get('new_balance', 0)
            self.log_result("POST /api/skip (Skip Flow)", True, 
                           f"Skip successful, new balance: {new_balance} TC")
        elif response['status_code'] == 402:
            self.log_result("POST /api/skip (Skip Flow)", False, 
                           "Insufficient balance for skip payment")
        else:
            self.log_result("POST /api/skip (Skip Flow)", False, 
                           f"Failed: {response['data']}")
        
        # Test pact wallet
        print("\n🏦 Testing Pact Wallet")
        response = self.make_request('GET', 'pact/wallet?tribe_id=10000000-0000-0000-0000-000000000001')
        if response['success'] and 'balance_tc' in response['data']:
            balance = response['data']['balance_tc']
            goal = response['data'].get('goal_label', 'Unknown goal')
            self.log_result("GET /api/pact/wallet", True, 
                           f"Pact wallet balance: {balance} TC, Goal: {goal}")
        else:
            self.log_result("GET /api/pact/wallet", False, 
                           f"Failed: {response['data']}")
        
        # Test wallet topup
        print("\n💳 Testing Wallet Topup")
        topup_data = {'amountTc': 100}
        response = self.make_request('POST', 'wallet/topup', topup_data)
        if response['success'] and response['data'].get('success'):
            new_balance = response['data'].get('new_balance', 0)
            self.log_result("POST /api/wallet/topup", True, 
                           f"Topup successful, new balance: {new_balance} TC")
        else:
            self.log_result("POST /api/wallet/topup", False, 
                           f"Failed: {response['data']}")

        # Test equipment catalog
        print("\n🏪 Testing Equipment Catalog")
        response = self.make_request('GET', 'catalog/list')
        if response['success']:
            items = response['data'] if isinstance(response['data'], list) else []
            self.log_result("GET /api/catalog/list", True, 
                           f"Found {len(items)} equipment items")
        else:
            self.log_result("GET /api/catalog/list", False, 
                           f"Failed: {response['data']}")

        # Test pact spend request system
        print("\n💰 Testing Pact Spend Request System")
        spend_request_data = {
            'tribeId': '10000000-0000-0000-0000-000000000001',
            'amountTc': 80,
            'description': 'Dumbbells for home gym',
            'item_id': 'dumbbell',
            'specs': {'weight': '20kg', 'quantity': 2}
        }
        response = self.make_request('POST', 'pact/spend/request', spend_request_data)
        if response['success'] and response['data'].get('success'):
            request_id = response['data'].get('request', {}).get('id', 'unknown')
            self.log_result("POST /api/pact/spend/request", True, 
                           f"Spend request created: {request_id}")
        else:
            self.log_result("POST /api/pact/spend/request", False, 
                           f"Failed: {response['data']}")

        # Test tip functionality
        print("\n🎁 Testing Tip Functionality")
        tip_data = {
            'fromUserId': TEST_USER_ID,
            'toUserId': TEST_USER_ID_2,
            'amountTc': 25,
            'message': 'Great workout motivation! 💪'
        }
        response = self.make_request('POST', 'tip', tip_data)
        if response['success'] and response['data'].get('success'):
            self.log_result("POST /api/tip", True, 
                           f"Tip sent successfully: 25 TC")
        elif response['status_code'] == 402:
            self.log_result("POST /api/tip", False, 
                           "Insufficient balance for tip")
        else:
            self.log_result("POST /api/tip", False, 
                           f"Failed: {response['data']}")

        # Test coach rating system
        print("\n⭐ Testing Coach Rating System")
        rating_data = {
            'coachId': TEST_COACH_ID,
            'clientId': TEST_USER_ID_2,
            'rating': 5,
            'comment': 'Excellent coaching and motivation!'
        }
        response = self.make_request('POST', 'coach/rate', rating_data)
        if response['success'] and response['data'].get('success'):
            avg_rating = response['data'].get('coach', {}).get('rating_avg', 0)
            self.log_result("POST /api/coach/rate", True, 
                           f"Coach rated successfully, new avg: {avg_rating}")
        else:
            self.log_result("POST /api/coach/rate", False, 
                           f"Failed: {response['data']}")

    def run_all_tests(self):
        """Run all backend tests focusing on critical button functionality"""
        print("🚀 TribeFit Backend API Testing Suite")
        print("🎯 Focus: Critical Button Functionality Reported as Broken")
        print("=" * 70)
        print(f"Base URL: {BASE_URL}")
        print(f"Test Time: {datetime.now().isoformat()}")
        print()
        
        # Test initial data endpoints
        self.test_initial_data_endpoints()
        
        # Test critical button functionality
        self.test_critical_button_functionality()
        
        # Test additional core functionality
        self.test_additional_core_functionality()
        
        # Summary
        print("\n" + "=" * 70)
        print("🏁 TEST SUMMARY")
        print("=" * 70)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed} ✅")
        print(f"Failed: {total - passed} ❌")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Critical button status
        print(f"\n🎯 CRITICAL BUTTON FUNCTIONALITY STATUS:")
        critical_buttons = [
            "POST /api/workout/start (Start Workout Button)",
            "POST /api/workout/shrink (Shrink Workout Button)", 
            "POST /api/posts/create (Share Progress Button)",
            "POST /api/coach/apply (Become Coach Button)",
            "POST /api/coach/hire (Hire Coach Button)"
        ]
        
        for button in critical_buttons:
            result = next((r for r in self.test_results if r['test'] == button), None)
            if result:
                status = "✅ WORKING" if result['success'] else "❌ BROKEN"
                print(f"  {button}: {status}")
                if not result['success'] and result['details']:
                    print(f"    Issue: {result['details']}")
        
        # Initial data endpoints status
        print(f"\n📊 INITIAL DATA ENDPOINTS STATUS:")
        data_endpoints = [
            "GET /api/user/current",
            "GET /api/wallet/balance",
            "GET /api/workout/today",
            "GET /api/coach/list",
            "GET /api/posts/feed",
            "GET /api/notifications"
        ]
        
        for endpoint in data_endpoints:
            result = next((r for r in self.test_results if r['test'] == endpoint), None)
            if result:
                status = "✅ WORKING" if result['success'] else "❌ BROKEN"
                print(f"  {endpoint}: {status}")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS DETAILS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed == total

if __name__ == "__main__":
    tester = TribeFitTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)