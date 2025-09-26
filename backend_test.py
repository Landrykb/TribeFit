#!/usr/bin/env python3
"""
TribeFit Backend API Testing Script
Tests all implemented social accountability system endpoints
"""

import requests
import json
import sys
import time
from typing import Dict, Any

# Base URL from environment
BASE_URL = "https://pact-workout.preview.emergentagent.com/api"

# Test user IDs from mock data
ALEX_CHEN_ID = "00000000-0000-0000-0000-000000000001"
JORDAN_KIM_ID = "00000000-0000-0000-0000-000000000002"
TRIBE_ID = "10000000-0000-0000-0000-000000000001"
PACT_WALLET_ID = "20000000-0000-0000-0000-000000000001"

class TribeFitAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        
    def test_get_current_user(self):
        """Test GET /api/user/current - Should return Alex Chen with 500 TC"""
        try:
            response = self.session.get(f"{BASE_URL}/user/current")
            
            if response.status_code != 200:
                self.log_test("GET /api/user/current", False, f"Status: {response.status_code}")
                return False
                
            data = response.json()
            user = data.get('user', {})
            
            # Verify Alex Chen data
            if user.get('name') != 'Alex Chen':
                self.log_test("GET /api/user/current", False, f"Expected Alex Chen, got {user.get('name')}")
                return False
                
            if user.get('wallet_balance_tc') != 500:
                self.log_test("GET /api/user/current", False, f"Expected 500 TC, got {user.get('wallet_balance_tc')}")
                return False
                
            self.log_test("GET /api/user/current", True, f"Alex Chen with {user.get('wallet_balance_tc')} TC")
            return True
            
        except Exception as e:
            self.log_test("GET /api/user/current", False, f"Exception: {str(e)}")
            return False
            
    def test_skip_with_payment(self):
        """Test POST /api/skip with payment method - Should deduct 100 TC"""
        try:
            # First get current balance
            user_response = self.session.get(f"{BASE_URL}/user/current")
            if user_response.status_code != 200:
                self.log_test("Skip with Payment (Pre-check)", False, "Could not get user data")
                return False
                
            initial_balance = user_response.json()['user']['wallet_balance_tc']
            
            # Test skip with payment
            skip_data = {
                "userId": ALEX_CHEN_ID,
                "method": "pay"
            }
            
            response = self.session.post(f"{BASE_URL}/skip", json=skip_data)
            
            if response.status_code != 200:
                self.log_test("POST /api/skip (pay)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
            data = response.json()
            
            # Verify response structure
            if not data.get('success'):
                self.log_test("POST /api/skip (pay)", False, "Success flag not true")
                return False
                
            new_balance = data.get('new_balance')
            if new_balance != initial_balance - 100:
                self.log_test("POST /api/skip (pay)", False, f"Balance not reduced correctly. Expected {initial_balance - 100}, got {new_balance}")
                return False
                
            # Verify notification message exists
            notification = data.get('notification')
            if not notification or 'Alex Chen' not in notification:
                self.log_test("POST /api/skip (pay)", False, f"Missing or invalid notification: {notification}")
                return False
                
            self.log_test("POST /api/skip (pay)", True, f"Balance: {initial_balance} → {new_balance}, Notification: {notification}")
            return True
            
        except Exception as e:
            self.log_test("POST /api/skip (pay)", False, f"Exception: {str(e)}")
            return False
            
    def test_skip_with_ad(self):
        """Test POST /api/skip with ad method - Should not deduct TC"""
        try:
            # Get current balance
            user_response = self.session.get(f"{BASE_URL}/user/current")
            if user_response.status_code != 200:
                self.log_test("Skip with Ad (Pre-check)", False, "Could not get user data")
                return False
                
            initial_balance = user_response.json()['user']['wallet_balance_tc']
            
            # Test skip with ad
            skip_data = {
                "userId": ALEX_CHEN_ID,
                "method": "ad"
            }
            
            response = self.session.post(f"{BASE_URL}/skip", json=skip_data)
            
            if response.status_code != 200:
                self.log_test("POST /api/skip (ad)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
            data = response.json()
            
            # Verify response structure
            if not data.get('success'):
                self.log_test("POST /api/skip (ad)", False, "Success flag not true")
                return False
                
            new_balance = data.get('new_balance')
            if new_balance != initial_balance:
                self.log_test("POST /api/skip (ad)", False, f"Balance should not change with ad method. Expected {initial_balance}, got {new_balance}")
                return False
                
            # Verify notification message exists
            notification = data.get('notification')
            if not notification or 'Alex Chen' not in notification:
                self.log_test("POST /api/skip (ad)", False, f"Missing or invalid notification: {notification}")
                return False
                
            self.log_test("POST /api/skip (ad)", True, f"Balance unchanged: {new_balance}, Notification: {notification}")
            return True
            
        except Exception as e:
            self.log_test("POST /api/skip (ad)", False, f"Exception: {str(e)}")
            return False
            
    def test_pact_wallet(self):
        """Test GET /api/pact/wallet - Should return pact wallet with balance"""
        try:
            response = self.session.get(f"{BASE_URL}/pact/wallet?tribe_id={TRIBE_ID}")
            
            if response.status_code != 200:
                self.log_test("GET /api/pact/wallet", False, f"Status: {response.status_code}")
                return False
                
            data = response.json()
            
            # Verify wallet data
            balance = data.get('balance_tc')
            if balance is None:
                self.log_test("GET /api/pact/wallet", False, "Missing balance_tc field")
                return False
                
            goal_label = data.get('goal_label')
            if not goal_label:
                self.log_test("GET /api/pact/wallet", False, "Missing goal_label field")
                return False
                
            self.log_test("GET /api/pact/wallet", True, f"Balance: {balance} TC, Goal: {goal_label}")
            return True
            
        except Exception as e:
            self.log_test("GET /api/pact/wallet", False, f"Exception: {str(e)}")
            return False
            
    def test_pact_transactions(self):
        """Test GET /api/pact/transactions - Should return transaction history"""
        try:
            response = self.session.get(f"{BASE_URL}/pact/transactions?wallet_id={PACT_WALLET_ID}")
            
            if response.status_code != 200:
                self.log_test("GET /api/pact/transactions", False, f"Status: {response.status_code}")
                return False
                
            data = response.json()
            
            if not isinstance(data, list):
                self.log_test("GET /api/pact/transactions", False, "Response should be a list")
                return False
                
            # Verify transaction structure
            if len(data) > 0:
                tx = data[0]
                required_fields = ['id', 'user_id', 'type', 'amount_tc', 'meta', 'created_at', 'user_name']
                missing_fields = [field for field in required_fields if field not in tx]
                
                if missing_fields:
                    self.log_test("GET /api/pact/transactions", False, f"Missing fields: {missing_fields}")
                    return False
                    
                self.log_test("GET /api/pact/transactions", True, f"Found {len(data)} transactions")
            else:
                self.log_test("GET /api/pact/transactions", True, "No transactions found (empty list)")
                
            return True
            
        except Exception as e:
            self.log_test("GET /api/pact/transactions", False, f"Exception: {str(e)}")
            return False
            
    def test_wallet_topup(self):
        """Test POST /api/wallet/topup - Should add TC to wallet"""
        try:
            # Get current balance
            user_response = self.session.get(f"{BASE_URL}/user/current")
            if user_response.status_code != 200:
                self.log_test("Wallet Topup (Pre-check)", False, "Could not get user data")
                return False
                
            initial_balance = user_response.json()['user']['wallet_balance_tc']
            
            # Test topup
            topup_data = {
                "userId": ALEX_CHEN_ID,
                "amountTc": 100
            }
            
            response = self.session.post(f"{BASE_URL}/wallet/topup", json=topup_data)
            
            if response.status_code != 200:
                self.log_test("POST /api/wallet/topup", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
            data = response.json()
            
            # Verify response structure
            if not data.get('success'):
                self.log_test("POST /api/wallet/topup", False, "Success flag not true")
                return False
                
            new_balance = data.get('new_balance')
            if new_balance != initial_balance + 100:
                self.log_test("POST /api/wallet/topup", False, f"Balance not increased correctly. Expected {initial_balance + 100}, got {new_balance}")
                return False
                
            charged_amount = data.get('charged_amount')
            if charged_amount != 100:
                self.log_test("POST /api/wallet/topup", False, f"Charged amount incorrect. Expected 100, got {charged_amount}")
                return False
                
            self.log_test("POST /api/wallet/topup", True, f"Balance: {initial_balance} → {new_balance}, Charged: {charged_amount}")
            return True
            
        except Exception as e:
            self.log_test("POST /api/wallet/topup", False, f"Exception: {str(e)}")
            return False
            
    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting TribeFit Backend API Tests")
        print(f"📍 Base URL: {BASE_URL}")
        print("=" * 60)
        
        tests = [
            self.test_get_current_user,
            self.test_skip_with_payment,
            self.test_skip_with_ad,
            self.test_pact_wallet,
            self.test_pact_transactions,
            self.test_wallet_topup
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Unexpected error: {str(e)}")
                
        print("=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Backend APIs are working correctly.")
            return True
        else:
            print(f"⚠️  {total - passed} tests failed. Check the details above.")
            return False

def main():
    """Main test execution"""
    tester = TribeFitAPITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()