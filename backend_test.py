#!/usr/bin/env python3
"""
TribeFit Backend API Testing Suite
Tests the newly implemented missing functionality:
- Coach System APIs (hire/rate)
- Equipment Catalog API
- Pact Spend Request system
- Feed Share and Tip functionality
"""

import requests
import json
import time
from typing import Dict, Any

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
    
    def test_equipment_catalog(self):
        """Test GET /api/catalog/list - Equipment catalog with items like dumbbells, ropes, etc."""
        print("\n=== Testing Equipment Catalog API ===")
        
        response = self.make_request('GET', 'catalog/list')
        
        if not response['success']:
            self.log_result("Equipment Catalog API", False, f"Request failed: {response['data']}")
            return
            
        data = response['data']
        
        # Check response structure
        if 'items' not in data:
            self.log_result("Equipment Catalog API", False, "Missing 'items' field in response")
            return
            
        items = data['items']
        if not isinstance(items, list):
            self.log_result("Equipment Catalog API", False, "'items' should be a list")
            return
            
        if len(items) == 0:
            self.log_result("Equipment Catalog API", False, "No catalog items returned")
            return
            
        # Check item structure
        required_fields = ['slug', 'title', 'category', 'specs', 'price_tc']
        sample_item = items[0]
        
        missing_fields = [field for field in required_fields if field not in sample_item]
        if missing_fields:
            self.log_result("Equipment Catalog API", False, f"Missing fields in items: {missing_fields}")
            return
            
        # Check for expected equipment types
        expected_items = ['dumbbell', 'barbell', 'kettlebell', 'bands', 'jumprope', 'protein']
        found_items = [item['slug'] for item in items]
        
        found_expected = [item for item in expected_items if item in found_items]
        
        self.log_result("Equipment Catalog API", True, 
                       f"Found {len(items)} items including: {', '.join(found_expected[:5])}")
        
        # Test specific item specs
        dumbbell_item = next((item for item in items if item['slug'] == 'dumbbell'), None)
        if dumbbell_item and 'weights' in dumbbell_item.get('specs', {}):
            weights = dumbbell_item['specs']['weights']
            self.log_result("Dumbbell Specs", True, f"Available weights: {weights}")
        
        protein_item = next((item for item in items if item['slug'] == 'protein'), None)
        if protein_item and 'flavors' in protein_item.get('specs', {}):
            flavors = protein_item['specs']['flavors']
            self.log_result("Protein Specs", True, f"Available flavors: {flavors}")
    
    def test_coach_hire_system(self):
        """Test POST /api/coach/hire - Hire a coach with TribeCoin payment"""
        print("\n=== Testing Coach Hire System ===")
        
        # First, get current user balance
        balance_response = self.make_request('GET', 'wallet/balance')
        if not balance_response['success']:
            self.log_result("Coach Hire - Get Balance", False, "Could not get wallet balance")
            return
            
        initial_balance = balance_response['data'].get('balance_tc', 0)
        print(f"Initial balance: {initial_balance} TC")
        
        # Test hiring a coach
        hire_data = {
            'clientId': TEST_USER_ID,
            'coachId': TEST_COACH_ID,
            'offeringId': 'offer-1',
            'priceTc': 200
        }
        
        response = self.make_request('POST', 'coach/hire', hire_data)
        
        if not response['success']:
            if response['status_code'] == 402:
                self.log_result("Coach Hire API", False, 
                               f"Insufficient balance - needed: {hire_data['priceTc']}, current: {initial_balance}")
                return
            else:
                self.log_result("Coach Hire API", False, f"Request failed: {response['data']}")
                return
        
        data = response['data']
        
        # Check response structure
        if not data.get('success'):
            self.log_result("Coach Hire API", False, "Response success field is false")
            return
            
        if 'hire' not in data:
            self.log_result("Coach Hire API", False, "Missing 'hire' field in response")
            return
            
        hire = data['hire']
        required_fields = ['id', 'coach_id', 'client_id', 'price_tc', 'status']
        missing_fields = [field for field in required_fields if field not in hire]
        
        if missing_fields:
            self.log_result("Coach Hire API", False, f"Missing fields in hire record: {missing_fields}")
            return
            
        # Verify balance was deducted
        new_balance_response = self.make_request('GET', 'wallet/balance')
        if new_balance_response['success']:
            new_balance = new_balance_response['data'].get('balance_tc', 0)
            expected_balance = initial_balance - hire_data['priceTc']
            
            if new_balance == expected_balance:
                self.log_result("Coach Hire - Balance Deduction", True, 
                               f"Balance correctly deducted: {initial_balance} -> {new_balance} TC")
            else:
                self.log_result("Coach Hire - Balance Deduction", False, 
                               f"Balance mismatch: expected {expected_balance}, got {new_balance}")
        
        self.log_result("Coach Hire API", True, 
                       f"Successfully hired coach {hire['coach_id']} for {hire['price_tc']} TC")
        
        return hire['id']  # Return hire ID for rating test
    
    def test_coach_rating_system(self, hire_id: str = None):
        """Test POST /api/coach/rate - Rate a hired coach"""
        print("\n=== Testing Coach Rating System ===")
        
        if not hire_id:
            # Create a mock hire ID for testing
            hire_id = f"hire-{int(time.time())}"
            print(f"Using mock hire ID: {hire_id}")
        
        # Test rating a coach
        rating_data = {
            'hireId': hire_id,
            'coachId': TEST_COACH_ID,
            'clientId': TEST_USER_ID,
            'stars': 5,
            'text': 'Excellent coach! Very knowledgeable and motivating.'
        }
        
        response = self.make_request('POST', 'coach/rate', rating_data)
        
        if not response['success']:
            self.log_result("Coach Rating API", False, f"Request failed: {response['data']}")
            return
        
        data = response['data']
        
        # Check response structure
        if not data.get('success'):
            self.log_result("Coach Rating API", False, "Response success field is false")
            return
            
        if 'rating' not in data:
            self.log_result("Coach Rating API", False, "Missing 'rating' field in response")
            return
            
        rating = data['rating']
        required_fields = ['id', 'coach_id', 'client_id', 'stars', 'text']
        missing_fields = [field for field in required_fields if field not in rating]
        
        if missing_fields:
            self.log_result("Coach Rating API", False, f"Missing fields in rating record: {missing_fields}")
            return
            
        # Verify rating values
        if rating['stars'] != rating_data['stars']:
            self.log_result("Coach Rating API", False, f"Stars mismatch: expected {rating_data['stars']}, got {rating['stars']}")
            return
            
        if rating['text'] != rating_data['text']:
            self.log_result("Coach Rating API", False, "Rating text mismatch")
            return
            
        self.log_result("Coach Rating API", True, 
                       f"Successfully rated coach {rating['coach_id']} with {rating['stars']} stars")
        
        # Test invalid rating (stars out of range)
        invalid_rating_data = rating_data.copy()
        invalid_rating_data['stars'] = 6
        
        invalid_response = self.make_request('POST', 'coach/rate', invalid_rating_data)
        if invalid_response['status_code'] == 400:
            self.log_result("Coach Rating - Validation", True, "Correctly rejected invalid star rating (6)")
        else:
            self.log_result("Coach Rating - Validation", False, "Should reject star ratings > 5")
    
    def test_pact_spend_request_system(self):
        """Test POST /api/pact/spend/request - Improved to handle item_id and specs for equipment"""
        print("\n=== Testing Pact Spend Request System ===")
        
        # Test equipment request with item_id and specs
        spend_data = {
            'type': 'gear',
            'label': 'Dumbbells 20kg Set (2 pieces) for home gym',
            'item_id': 'dumbbell',
            'specs': {
                'weight': '20kg',
                'quantity': 2
            },
            'amount_tc': 160,  # 80 TC per dumbbell * 2
            'gym_name': 'Home Gym'
        }
        
        response = self.make_request('POST', 'pact/spend/request', spend_data)
        
        if not response['success']:
            self.log_result("Pact Spend Request API", False, f"Request failed: {response['data']}")
            return
        
        data = response['data']
        
        # Check response structure
        if not data.get('success'):
            self.log_result("Pact Spend Request API", False, "Response success field is false")
            return
            
        if 'request' not in data:
            self.log_result("Pact Spend Request API", False, "Missing 'request' field in response")
            return
            
        request = data['request']
        required_fields = ['id', 'user_id', 'amount_tc', 'description']
        missing_fields = [field for field in required_fields if field not in request]
        
        if missing_fields:
            self.log_result("Pact Spend Request API", False, f"Missing fields in request record: {missing_fields}")
            return
            
        # Check if item_id and specs are preserved
        if 'item_id' in request and request['item_id'] == spend_data['item_id']:
            self.log_result("Pact Spend - Item ID", True, f"Item ID correctly stored: {request['item_id']}")
        
        if 'specs' in request and request['specs'] == spend_data['specs']:
            self.log_result("Pact Spend - Specs", True, f"Specs correctly stored: {request['specs']}")
        
        self.log_result("Pact Spend Request API", True, 
                       f"Successfully created spend request for {request['amount_tc']} TC")
        
        # Test protein request with flavors
        protein_data = {
            'type': 'gear',
            'label': 'Whey Protein - Chocolate flavor, 2kg',
            'item_id': 'protein',
            'specs': {
                'flavor': 'chocolate',
                'size': '2kg'
            },
            'amount_tc': 40,
            'gym_name': 'Home Gym'
        }
        
        protein_response = self.make_request('POST', 'pact/spend/request', protein_data)
        if protein_response['success']:
            self.log_result("Pact Spend - Protein Request", True, "Successfully created protein spend request")
        else:
            self.log_result("Pact Spend - Protein Request", False, f"Failed: {protein_response['data']}")
    
    def test_tip_functionality(self):
        """Test POST /api/tip - Tip TribeCoins to users"""
        print("\n=== Testing Tip Functionality ===")
        
        # Get initial balances
        from_balance_response = self.make_request('GET', 'wallet/balance')
        if not from_balance_response['success']:
            self.log_result("Tip - Get Sender Balance", False, "Could not get sender balance")
            return
            
        initial_from_balance = from_balance_response['data'].get('balance_tc', 0)
        print(f"Sender initial balance: {initial_from_balance} TC")
        
        # Test tipping
        tip_data = {
            'fromUserId': TEST_USER_ID,
            'toUserId': TEST_USER_ID_2,
            'postId': 'post-123',  # Optional
            'amount': 50,
            'message': 'Great workout post! Keep it up! 💪'
        }
        
        response = self.make_request('POST', 'tip', tip_data)
        
        if not response['success']:
            if response['status_code'] == 402:
                self.log_result("Tip API", False, 
                               f"Insufficient balance - needed: {tip_data['amount']}, current: {initial_from_balance}")
                return
            else:
                self.log_result("Tip API", False, f"Request failed: {response['data']}")
                return
        
        data = response['data']
        
        # Check response structure
        if not data.get('success'):
            self.log_result("Tip API", False, "Response success field is false")
            return
            
        # Verify balance was deducted from sender
        new_from_balance_response = self.make_request('GET', 'wallet/balance')
        if new_from_balance_response['success']:
            new_from_balance = new_from_balance_response['data'].get('balance_tc', 0)
            expected_balance = initial_from_balance - tip_data['amount']
            
            if new_from_balance == expected_balance:
                self.log_result("Tip - Sender Balance Deduction", True, 
                               f"Sender balance correctly deducted: {initial_from_balance} -> {new_from_balance} TC")
            else:
                self.log_result("Tip - Sender Balance Deduction", False, 
                               f"Sender balance mismatch: expected {expected_balance}, got {new_from_balance}")
        
        self.log_result("Tip API", True, 
                       f"Successfully tipped {tip_data['amount']} TC from {tip_data['fromUserId']} to {tip_data['toUserId']}")
        
        # Test invalid tip (negative amount)
        invalid_tip_data = tip_data.copy()
        invalid_tip_data['amount'] = -10
        
        invalid_response = self.make_request('POST', 'tip', invalid_tip_data)
        if invalid_response['status_code'] == 400:
            self.log_result("Tip - Validation", True, "Correctly rejected negative tip amount")
        else:
            self.log_result("Tip - Validation", False, "Should reject negative tip amounts")
    
    def test_posts_create_functionality(self):
        """Test POST /api/posts/create - Share posts to feed (already implemented, verify it works)"""
        print("\n=== Testing Posts Create Functionality ===")
        
        post_data = {
            'userId': TEST_USER_ID,
            'caption': 'Just finished an amazing workout! 💪 #TribeFit #StayStrong',
            'media_url': 'https://example.com/workout-photo.jpg',
            'media_type': 'image'
        }
        
        response = self.make_request('POST', 'posts/create', post_data)
        
        if not response['success']:
            self.log_result("Posts Create API", False, f"Request failed: {response['data']}")
            return
        
        data = response['data']
        
        # Check response structure
        if not data.get('success'):
            self.log_result("Posts Create API", False, "Response success field is false")
            return
            
        if 'post' not in data:
            self.log_result("Posts Create API", False, "Missing 'post' field in response")
            return
            
        post = data['post']
        required_fields = ['id', 'user_id', 'caption', 'created_at']
        missing_fields = [field for field in required_fields if field not in post]
        
        if missing_fields:
            self.log_result("Posts Create API", False, f"Missing fields in post record: {missing_fields}")
            return
            
        self.log_result("Posts Create API", True, 
                       f"Successfully created post with caption: '{post['caption'][:50]}...'")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting TribeFit Backend API Testing Suite")
        print("=" * 60)
        
        # Test new functionality as requested
        self.test_equipment_catalog()
        hire_id = self.test_coach_hire_system()
        self.test_coach_rating_system(hire_id)
        self.test_pact_spend_request_system()
        self.test_tip_functionality()
        self.test_posts_create_functionality()
        
        # Summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result['success']:
                print(f"  - {result['test']}")
                
        return passed == total

if __name__ == "__main__":
    tester = TribeFitTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)