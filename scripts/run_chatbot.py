#!/usr/bin/env python3
"""
MindNest Chatbot Service Runner
Starts the chatbot service with proper configuration
"""

import os
import sys
import subprocess
import time

def check_dependencies():
    """Check if required packages are installed"""
    required_packages = ['flask', 'flask-cors']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("Installing missing packages...")
        for package in missing_packages:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
        print("✅ All packages installed!")

def start_chatbot_service():
    """Start the chatbot service"""
    print("🤖 Starting MindNest Chatbot Service...")
    
    # Check dependencies
    check_dependencies()
    
    # Set environment variables
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_DEBUG'] = '1'
    
    try:
        # Start the chatbot service
        subprocess.run([sys.executable, 'chatbot_service.py'], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Chatbot service stopped by user")
    except Exception as e:
        print(f"❌ Error starting chatbot service: {e}")

if __name__ == '__main__':
    start_chatbot_service()
