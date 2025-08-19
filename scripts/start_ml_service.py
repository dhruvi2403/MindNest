#!/usr/bin/env python3
"""
Startup script for MindNest ML Service
This script starts the ML service on port 5001 to avoid conflicts with the main backend
"""

import subprocess
import sys
import os
import time
from pathlib import Path

def main():
    # Get the directory where this script is located
    script_dir = Path(__file__).parent.absolute()
    
    # Change to the scripts directory
    os.chdir(script_dir)
    
    print("🚀 Starting MindNest ML Service...")
    print(f"📁 Working directory: {script_dir}")
    
    # Check if requirements are installed
    try:
        import flask
        import sklearn
        import pandas
        import numpy
        print("✅ All required packages are installed")
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("Installing requirements...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Requirements installed successfully")
    
    # Start the ML service
    print("🔧 Starting ML service on port 5001...")
    
    try:
        # Modify the port in ml_service.py temporarily
        ml_service_path = script_dir / "ml_service.py"
        with open(ml_service_path, 'r') as f:
            content = f.read()
        
        # Replace port 5000 with 5001
        content = content.replace('port=5000', 'port=5001')
        content = content.replace('host=\'0.0.0.0\'', 'host=\'0.0.0.0\'')
        
        with open(ml_service_path, 'w') as f:
            f.write(content)
        
        print("✅ ML service configured for port 5001")
        
        # Start the service
        subprocess.run([sys.executable, "ml_service.py"], check=True)
        
    except KeyboardInterrupt:
        print("\n🛑 ML service stopped by user")
    except Exception as e:
        print(f"❌ Error starting ML service: {e}")
        sys.exit(1)
    finally:
        # Restore original port
        try:
            with open(ml_service_path, 'r') as f:
                content = f.read()
            content = content.replace('port=5001', 'port=5000')
            with open(ml_service_path, 'w') as f:
                f.write(content)
            print("✅ ML service configuration restored")
        except:
            pass

if __name__ == "__main__":
    main()
