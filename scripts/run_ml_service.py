"""
Production runner for MindNest ML Service
Uses Gunicorn for production deployment
"""

import os
import sys
from ml_service import app, predictor, logger

def setup_production():
    """Setup production environment"""
    # Train models on startup
    logger.info("Production startup: Training ML models...")
    try:
        predictor.train_models()
        logger.info("Models trained successfully for production!")
    except Exception as e:
        logger.error(f"Failed to train models: {e}")
        sys.exit(1)

if __name__ == "__main__":
    setup_production()
    
    # Run with Gunicorn in production
    # Command: gunicorn -w 4 -b 0.0.0.0:5000 run_ml_service:app
    app.run(host='0.0.0.0', port=5000, debug=False)
