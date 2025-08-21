"""
MindNest ML Service - Flask API for Mental Health Predictions
Uses Decision Tree and KNN algorithms to predict mental health risk levels
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables for models and scaler
decision_tree_model = None
knn_model = None
scaler = None
feature_names = []

class MentalHealthPredictor:
    def __init__(self):
        self.models = {}
        self.scaler = StandardScaler()
        self.feature_names = [
            'anxiety_1', 'anxiety_2', 'anxiety_3', 'anxiety_4',
            'depression_1', 'depression_2', 'depression_3', 'depression_4',
            'stress_1', 'stress_2', 'stress_3',
            'general_1', 'general_2', 'general_3'
        ]
        
    def generate_synthetic_data(self, n_samples=1000):
        """Generate synthetic mental health assessment data for training"""
        np.random.seed(42)
        
        data = []
        labels = []
        
        for _ in range(n_samples):
            # Generate correlated responses
            base_anxiety = np.random.normal(1.5, 1.0)
            base_depression = np.random.normal(1.2, 0.8)
            base_stress = np.random.normal(2.0, 1.2)
            base_general = np.random.normal(2.5, 0.8)
            
            # Add some correlation between categories
            anxiety_responses = np.clip(
                np.random.normal(base_anxiety, 0.5, 4), 0, 3
            ).astype(int)
            
            depression_responses = np.clip(
                np.random.normal(base_depression + base_anxiety * 0.3, 0.5, 4), 0, 3
            ).astype(int)
            
            stress_responses = np.clip(
                np.random.normal(base_stress, 0.6, 3), 0, 4
            ).astype(int)
            
            general_responses = np.clip(
                4 - np.random.normal(base_general - base_depression * 0.2, 0.5, 3), 0, 4
            ).astype(int)
            
            # Combine all responses
            sample = np.concatenate([
                anxiety_responses, depression_responses, 
                stress_responses, general_responses
            ])
            
            # Calculate risk level based on responses
            anxiety_score = np.mean(anxiety_responses) / 3.0
            depression_score = np.mean(depression_responses) / 3.0
            stress_score = np.mean(stress_responses) / 4.0
            general_score = 1 - (np.mean(general_responses) / 4.0)
            
            overall_score = (anxiety_score + depression_score + stress_score + general_score) / 4
            
            if overall_score < 0.25:
                risk_level = 0  # Low
            elif overall_score < 0.5:
                risk_level = 1  # Mild
            elif overall_score < 0.75:
                risk_level = 2  # Moderate
            else:
                risk_level = 3  # High
            
            data.append(sample)
            labels.append(risk_level)
        
        return np.array(data), np.array(labels)
    
    def train_models(self):
        """Train Decision Tree and KNN models"""
        logger.info("Generating synthetic training data...")
        X, y = self.generate_synthetic_data(1000)
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale the features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Decision Tree
        logger.info("Training Decision Tree model...")
        dt_model = DecisionTreeClassifier(
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        dt_model.fit(X_train, y_train)  # Decision trees don't need scaling
        
        # Train KNN
        logger.info("Training KNN model...")
        knn_model = KNeighborsClassifier(
            n_neighbors=5,
            weights='distance'
        )
        knn_model.fit(X_train_scaled, y_train)
        
        # Evaluate models
        dt_pred = dt_model.predict(X_test)
        knn_pred = knn_model.predict(X_test_scaled)
        
        dt_accuracy = accuracy_score(y_test, dt_pred)
        knn_accuracy = accuracy_score(y_test, knn_pred)
        
        logger.info(f"Decision Tree Accuracy: {dt_accuracy:.3f}")
        logger.info(f"KNN Accuracy: {knn_accuracy:.3f}")
        
        # Store models
        self.models['decision_tree'] = dt_model
        self.models['knn'] = knn_model
        
        return {
            'decision_tree_accuracy': dt_accuracy,
            'knn_accuracy': knn_accuracy
        }
    
    def predict(self, assessment_data, model_type='ensemble'):
        """Make prediction using specified model"""
        try:
            # Convert assessment data to feature vector
            feature_vector = []
            for feature in self.feature_names:
                if feature in assessment_data:
                    feature_vector.append(assessment_data[feature])
                else:
                    feature_vector.append(0)  # Default value for missing features
            
            feature_vector = np.array(feature_vector).reshape(1, -1)
            
            if model_type == 'decision_tree':
                prediction = self.models['decision_tree'].predict(feature_vector)[0]
                probabilities = self.models['decision_tree'].predict_proba(feature_vector)[0]
            elif model_type == 'knn':
                feature_vector_scaled = self.scaler.transform(feature_vector)
                prediction = self.models['knn'].predict(feature_vector_scaled)[0]
                probabilities = self.models['knn'].predict_proba(feature_vector_scaled)[0]
            else:  # ensemble
                # Use both models and average their probabilities
                dt_proba = self.models['decision_tree'].predict_proba(feature_vector)[0]
                
                feature_vector_scaled = self.scaler.transform(feature_vector)
                knn_proba = self.models['knn'].predict_proba(feature_vector_scaled)[0]
                
                probabilities = (dt_proba + knn_proba) / 2
                prediction = np.argmax(probabilities)
            
            confidence = float(np.max(probabilities) * 100)
            
            # Map prediction to severity and description
            severity_map = {
                0: ("Low", "Low Risk - Good Mental Health"),
                1: ("Mild", "Mild Anxiety with Stress Indicators"),
                2: ("Moderate", "Moderate Anxiety and Depression Symptoms"),
                3: ("High", "High Risk - Significant Mental Health Concerns")
            }
            
            severity, description = severity_map[prediction]
            
            # Generate recommendations based on prediction
            recommendations = self._generate_recommendations(prediction, assessment_data)
            risk_factors = self._identify_risk_factors(prediction, assessment_data)
            
            return {
                'prediction': description,
                'severity': severity,
                'confidence': round(confidence, 1),
                'recommendations': recommendations,
                'riskFactors': risk_factors,
                'model_used': model_type,
                'feature_importance': self._get_feature_importance(assessment_data)
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise
    
    def _generate_recommendations(self, risk_level, assessment_data):
        """Generate personalized recommendations based on risk level and responses"""
        base_recommendations = {
            0: [
                "Continue maintaining your current healthy habits",
                "Regular exercise and social connections are beneficial",
                "Consider mindfulness practices for ongoing wellness",
                "Keep up with regular sleep schedule and stress management"
            ],
            1: [
                "Practice deep breathing exercises for 10-15 minutes daily",
                "Establish a consistent sleep schedule (7-9 hours per night)",
                "Consider talking to a counselor for additional support",
                "Engage in regular physical activity, even light walking helps",
                "Try progressive muscle relaxation techniques"
            ],
            2: [
                "Strongly consider professional counseling or therapy",
                "Practice mindfulness meditation and stress reduction techniques",
                "Maintain social connections and support systems",
                "Regular exercise and healthy sleep habits are crucial",
                "Consider cognitive behavioral therapy (CBT) techniques",
                "Limit caffeine and alcohol consumption"
            ],
            3: [
                "Seek immediate professional mental health support",
                "Contact a crisis helpline if experiencing thoughts of self-harm",
                "Reach out to trusted friends or family members",
                "Consider medication evaluation with a psychiatrist",
                "Implement daily self-care routines and safety planning",
                "Remove potential means of self-harm from environment"
            ]
        }
        
        recommendations = base_recommendations[risk_level].copy()
        
        # Add specific recommendations based on assessment responses
        anxiety_scores = [assessment_data.get(f'anxiety_{i}', 0) for i in range(1, 5)]
        depression_scores = [assessment_data.get(f'depression_{i}', 0) for i in range(1, 5)]
        stress_scores = [assessment_data.get(f'stress_{i}', 0) for i in range(1, 4)]
        
        if np.mean(anxiety_scores) > 2:
            recommendations.append("Focus on anxiety management techniques like grounding exercises")
        
        if np.mean(depression_scores) > 2:
            recommendations.append("Consider activities that bring joy and meaning to your life")
        
        if np.mean(stress_scores) > 3:
            recommendations.append("Identify and address major sources of stress in your life")
        
        return recommendations[:6]  # Limit to 6 recommendations
    
    def _identify_risk_factors(self, risk_level, assessment_data):
        """Identify specific risk factors based on assessment responses"""
        risk_factors = []
        
        anxiety_scores = [assessment_data.get(f'anxiety_{i}', 0) for i in range(1, 5)]
        depression_scores = [assessment_data.get(f'depression_{i}', 0) for i in range(1, 5)]
        stress_scores = [assessment_data.get(f'stress_{i}', 0) for i in range(1, 4)]
        general_scores = [assessment_data.get(f'general_{i}', 0) for i in range(1, 4)]
        
        if np.mean(anxiety_scores) > 2:
            risk_factors.append("Elevated anxiety levels affecting daily functioning")
        
        if np.mean(depression_scores) > 2:
            risk_factors.append("Depressive symptoms impacting motivation and mood")
        
        if np.mean(stress_scores) > 3:
            risk_factors.append("High stress levels affecting multiple life areas")
        
        if assessment_data.get('depression_3', 0) > 2:  # Sleep issues
            risk_factors.append("Sleep pattern disruptions affecting mental health")
        
        if assessment_data.get('general_1', 4) < 2:  # Poor self-rated mental health
            risk_factors.append("Self-reported poor mental health status")
        
        if assessment_data.get('general_3', 4) < 2:  # Poor social relationships
            risk_factors.append("Limited social support and relationship satisfaction")
        
        if risk_level == 3:
            risk_factors.append("Potential risk for self-harm or suicidal ideation")
        
        return risk_factors if risk_factors else ["No significant risk factors identified"]
    
    def _get_feature_importance(self, assessment_data):
        """Get feature importance from decision tree model"""
        if 'decision_tree' in self.models:
            importance = self.models['decision_tree'].feature_importances_
            feature_importance = {}
            for i, feature in enumerate(self.feature_names):
                if i < len(importance):
                    feature_importance[feature] = float(importance[i])
            return feature_importance
        return {}

# Initialize the predictor
predictor = MentalHealthPredictor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'MindNest ML Service',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/train', methods=['POST'])
def train_models():
    """Train the ML models"""
    try:
        logger.info("Starting model training...")
        results = predictor.train_models()
        
        return jsonify({
            'status': 'success',
            'message': 'Models trained successfully',
            'results': results,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Training error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Training failed: {str(e)}'
        }), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Make prediction based on assessment data"""
    try:
        data = request.get_json()
        
        if not data or 'answers' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing assessment data'
            }), 400
        
        assessment_data = data['answers']
        model_type = data.get('model_type', 'ensemble')
        
        # Check if models are trained
        if not predictor.models:
            logger.info("Models not found, training new models...")
            predictor.train_models()
        
        # Make prediction
        result = predictor.predict(assessment_data, model_type)
        
        return jsonify({
            'status': 'success',
            'timestamp': datetime.now().isoformat(),
            **result
        })
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Prediction failed: {str(e)}'
        }), 500

@app.route('/models/info', methods=['GET'])
def model_info():
    """Get information about available models"""
    return jsonify({
        'available_models': ['decision_tree', 'knn', 'ensemble'],
        'default_model': 'ensemble',
        'features': predictor.feature_names,
        'trained': bool(predictor.models),
        'model_count': len(predictor.models)
    })

@app.route('/models/retrain', methods=['POST'])
def retrain_models():
    """Retrain models with new data"""
    try:
        # In a real application, you might accept new training data here
        logger.info("Retraining models...")
        results = predictor.train_models()
        
        return jsonify({
            'status': 'success',
            'message': 'Models retrained successfully',
            'results': results,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Retraining error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Retraining failed: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Train models on startup
    logger.info("Starting MindNest ML Service...")
    logger.info("Training initial models...")
    
    try:
        predictor.train_models()
        logger.info("Models trained successfully!")
    except Exception as e:
        logger.error(f"Failed to train models on startup: {str(e)}")
    
    # Start the Flask app
    app.run(host='0.0.0.0', port=8000, debug=True)
