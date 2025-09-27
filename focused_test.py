#!/usr/bin/env python3
"""
Focused test for failing endpoints with correct parameters
"""

import requests
import json

BASE_URL = "https://social-fitness-6.preview.emergentagent.com/api"
TEST_USER_ID = "00000000-0000-0000-0000-000000000001"
TEST_USER_ID_2 = "00000000-0000-0000-0000-000000000002"

def test_endpoint(method, endpoint, data=None):
    url = f"{BASE_URL}/{endpoint.lstrip('/')}"
    try:
        if method.upper() == 'GET':
            response = requests.get(url)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data)
        
        print(f"{method} {endpoint}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print("-" * 50)
        
    except Exception as e:
        print(f"Error: {e}")
        print("-" * 50)

# Test AI workout generation
print("=== Testing AI Workout Generation ===")
test_endpoint('POST', 'generate-workout', {
    'fitnessGoals': 'Build muscle and improve strength',
    'availableTime': 45,
    'equipment': 'Dumbbells, resistance bands, bodyweight',
    'experienceLevel': 'intermediate',
    'userId': TEST_USER_ID
})

# Test catalog with correct response format
print("=== Testing Equipment Catalog ===")
test_endpoint('GET', 'catalog/list')

# Test tip with correct parameters
print("=== Testing Tip Functionality ===")
test_endpoint('POST', 'tip', {
    'fromUserId': TEST_USER_ID,
    'toUserId': TEST_USER_ID_2,
    'amount': 25,  # Changed from amountTc to amount
    'message': 'Great workout motivation! 💪'
})

# Test pact spend request with correct parameters
print("=== Testing Pact Spend Request ===")
test_endpoint('POST', 'pact/spend/request', {
    'type': 'equipment',
    'label': 'Dumbbells for home gym',
    'amount_tc': 80,
    'item_id': 'dumbbell',
    'specs': {'weight': '20kg', 'quantity': 2}
})

# Test coach rating with correct parameters
print("=== Testing Coach Rating ===")
test_endpoint('POST', 'coach/rate', {
    'coachId': TEST_USER_ID,
    'clientId': TEST_USER_ID_2,
    'stars': 5,  # Changed from rating to stars
    'text': 'Excellent coaching and motivation!'  # Changed from comment to text
})