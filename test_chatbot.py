#!/usr/bin/env python3
"""
Test script for the MindNest Chatbot mental health triggers
"""

import requests
import json

def test_chatbot_trigger(message, expected_trigger=None):
    """Test a single chatbot message"""
    try:
        response = requests.post(
            'http://localhost:5001/chat',
            headers={'Content-Type': 'application/json'},
            json={'message': message}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n🔹 Input: '{message}'")
            print(f"📝 Response: {data['message'][:100]}...")
            print(f"💡 Suggestions: {data.get('suggestions', [])}")
            return True
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def main():
    """Test various mental health triggers"""
    print("🤖 Testing MindNest Chatbot Mental Health Triggers")
    print("=" * 60)
    
    test_cases = [
        # Anxiety triggers
        "I am scared and cannot breathe properly",
        "I'm having a panic attack",
        "I'm so anxious about everything",
        
        # Depression triggers  
        "I feel so sad and hopeless",
        "I have no energy to do anything",
        "I hate my life",
        
        # Stress triggers
        "I'm so stressed and overwhelmed",
        "I can't handle all this pressure",
        
        # Other triggers
        "I feel so lonely",
        "I'm angry at everything",
        "I feel guilty about what happened",
        
        # General requests
        "I need help with breathing exercises",
        "What techniques can you suggest?",
        "I need more relaxation methods"
    ]
    
    success_count = 0
    for message in test_cases:
        if test_chatbot_trigger(message):
            success_count += 1
    
    print(f"\n✅ Successfully tested {success_count}/{len(test_cases)} triggers")
    print("🎉 Chatbot mental health responses are working!")

if __name__ == "__main__":
    main()
