"""
MindNest ML Service - Flask API for Mental Health Predictions
Updated to use real mental health datasets and new assessment form fields
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
import logging
import requests
from io import StringIO
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class RealDataMentalHealthPredictor:
    def __init__(self):
        self.models = {}
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = [
            'age', 'gender', 'occupation', 'stress_level', 'sleep_hours', 
            'work_hours', 'physical_activity_hours', 'social_media_usage',
            'diet_quality', 'smoking_habit', 'alcohol_consumption',
            'symptom_severity', 'mood_score', 'sleep_quality',
            'mental_health_condition', 'consultation_history', 'medication_usage'
        ]
        self.dataset_urls = {
            'dataset1': "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mentalhealthdataset2-hA4Uuby0GR2Af4Mal0f2ZPhdNJmRqG.csv",
            'dataset2': "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mental_health_diagnosis_treatment_-uF7hPEA1DXEKsbyLjBsic2IUeg9rE6.csv"
        }
        
    def load_real_datasets(self):
        """Load and combine real mental health datasets"""
        try:
            logger.info("Loading real mental health datasets...")
            
            # Load Dataset 1 (General Mental Health)
            response1 = requests.get(self.dataset_urls['dataset1'])
            df1 = pd.read_csv(StringIO(response1.text))
            logger.info(f"Dataset 1 loaded: {df1.shape[0]} rows, {df1.shape[1]} columns")
            
            # Load Dataset 2 (Clinical Treatment Data)
            response2 = requests.get(self.dataset_urls['dataset2'])
            df2 = pd.read_csv(StringIO(response2.text))
            logger.info(f"Dataset 2 loaded: {df2.shape[0]} rows, {df2.shape[1]} columns")
            
            return df1, df2
            
        except Exception as e:
            logger.error(f"Error loading datasets: {str(e)}")
            return None, None
    
    def preprocess_data(self, df1, df2):
        """Preprocess and combine datasets for ML training"""
        try:
            # Process Dataset 1
            processed_df1 = df1.copy()
            
            # Clean numeric columns
            numeric_cols = ['Age', 'Sleep_Hours', 'Work_Hours', 'Physical_Activity_Hours', 'Social_Media_Usage']
            for col in numeric_cols:
                if col in processed_df1.columns:
                    processed_df1[col] = pd.to_numeric(processed_df1[col], errors='coerce')
            
            # Create target variable based on Mental_Health_Condition and Severity
            def create_risk_level(row):
                if row.get('Mental_Health_Condition') == 'Yes':
                    severity = row.get('Severity', 'None')
                    if severity in ['Severe']:
                        return 3  # High
                    elif severity in ['Moderate']:
                        return 2  # Moderate
                    elif severity in ['Mild']:
                        return 1  # Mild
                    else:
                        return 1  # Default to Mild if condition exists
                else:
                    return 0  # Low
            
            processed_df1['Risk_Level'] = processed_df1.apply(create_risk_level, axis=1)
            
            # Process Dataset 2 for additional features
            processed_df2 = df2.copy()
            
            # Convert numeric columns
            numeric_cols_2 = ['Age', 'Symptom Severity (1-10)', 'Mood Score (1-10)', 
                             'Sleep Quality (1-10)', 'Physical Activity (hrs/week)', 'Stress Level (1-10)']
            for col in numeric_cols_2:
                if col in processed_df2.columns:
                    processed_df2[col] = pd.to_numeric(processed_df2[col], errors='coerce')
            
            # Create risk level for dataset 2 based on outcome
            def create_risk_level_2(row):
                outcome = row.get('Outcome', '')
                severity = row.get('Symptom Severity (1-10)', 5)
                if outcome == 'Deteriorated' or severity >= 8:
                    return 3  # High
                elif outcome == 'No Change' or severity >= 6:
                    return 2  # Moderate
                elif severity >= 4:
                    return 1  # Mild
                else:
                    return 0  # Low
            
            processed_df2['Risk_Level'] = processed_df2.apply(create_risk_level_2, axis=1)
            
            # Combine datasets with common features
            combined_features = []
            
            # From Dataset 1
            for _, row in processed_df1.iterrows():
                feature_dict = {
                    'age': row.get('Age', 30),
                    'gender': row.get('Gender', 'Other'),
                    'occupation': row.get('Occupation', 'Other'),
                    'stress_level': row.get('Stress_Level', 'Medium'),
                    'sleep_hours': row.get('Sleep_Hours', 7),
                    'work_hours': row.get('Work_Hours', 40),
                    'physical_activity_hours': row.get('Physical_Activity_Hours', 2),
                    'social_media_usage': row.get('Social_Media_Usage', 3),
                    'diet_quality': row.get('Diet_Quality', 'Average'),
                    'smoking_habit': row.get('Smoking_Habit', 'Non-Smoker'),
                    'alcohol_consumption': row.get('Alcohol_Consumption', 'Light Drinker'),
                    'symptom_severity': 5,  # Default value
                    'mood_score': 5,  # Default value
                    'sleep_quality': 5,  # Default value
                    'mental_health_condition': row.get('Mental_Health_Condition', 'No'),
                    'consultation_history': row.get('Consultation_History', 'No'),
                    'medication_usage': row.get('Medication_Usage', 'No'),
                    'risk_level': row.get('Risk_Level', 0)
                }
                combined_features.append(feature_dict)
            
            # From Dataset 2
            for _, row in processed_df2.iterrows():
                feature_dict = {
                    'age': row.get('Age', 30),
                    'gender': row.get('Gender', 'Other'),
                    'occupation': 'Healthcare',  # Default for clinical data
                    'stress_level': 'Medium' if row.get('Stress Level (1-10)', 5) <= 5 else 'High',
                    'sleep_hours': 7,  # Default
                    'work_hours': 40,  # Default
                    'physical_activity_hours': row.get('Physical Activity (hrs/week)', 2),
                    'social_media_usage': 3,  # Default
                    'diet_quality': 'Average',  # Default
                    'smoking_habit': 'Non-Smoker',  # Default
                    'alcohol_consumption': 'Light Drinker',  # Default
                    'symptom_severity': row.get('Symptom Severity (1-10)', 5),
                    'mood_score': row.get('Mood Score (1-10)', 5),
                    'sleep_quality': row.get('Sleep Quality (1-10)', 5),
                    'mental_health_condition': 'Yes',  # Clinical data assumes condition
                    'consultation_history': 'Yes',  # Clinical data assumes consultation
                    'medication_usage': 'Yes' if pd.notna(row.get('Medication')) else 'No',
                    'risk_level': row.get('Risk_Level', 1)
                }
                combined_features.append(feature_dict)
            
            combined_df = pd.DataFrame(combined_features)
            logger.info(f"Combined dataset: {len(combined_df)} samples")
            logger.info(f"Risk level distribution: {combined_df['risk_level'].value_counts().to_dict()}")
            
            return combined_df
            
        except Exception as e:
            logger.error(f"Error preprocessing data: {str(e)}")
            return None
    
    def encode_features(self, df):
        """Encode categorical features for ML training"""
        df_encoded = df.copy()
        
        # Categorical columns to encode
        categorical_cols = ['gender', 'occupation', 'stress_level', 'diet_quality', 
                           'smoking_habit', 'alcohol_consumption', 'mental_health_condition',
                           'consultation_history', 'medication_usage']
        
        for col in categorical_cols:
            if col in df_encoded.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df_encoded[col] = self.label_encoders[col].fit_transform(df_encoded[col].astype(str))
                else:
                    df_encoded[col] = self.label_encoders[col].transform(df_encoded[col].astype(str))
        
        return df_encoded
    
    def train_models(self):
        """Train Decision Tree and KNN models with real data"""
        try:
            # Load real datasets
            df1, df2 = self.load_real_datasets()
            if df1 is None or df2 is None:
                raise Exception("Failed to load datasets")
            
            # Preprocess and combine data
            combined_df = self.preprocess_data(df1, df2)
            if combined_df is None:
                raise Exception("Failed to preprocess data")
            
            # Encode categorical features
            encoded_df = self.encode_features(combined_df)
            
            # Prepare features and target
            X = encoded_df[self.feature_names].fillna(0)
            y = encoded_df['risk_level']
            
            logger.info(f"Training with {len(X)} samples and {len(self.feature_names)} features")
            
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
                max_depth=15,
                min_samples_split=10,
                min_samples_leaf=5,
                random_state=42,
                class_weight='balanced'
            )
            dt_model.fit(X_train, y_train)
            
            # Train KNN
            logger.info("Training KNN model...")
            knn_model = KNeighborsClassifier(
                n_neighbors=7,
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
            
            combined_df.to_csv('processed_real_data.csv', index=False)
            logger.info("Processed data saved to processed_real_data.csv")
            
            return {
                'decision_tree_accuracy': dt_accuracy,
                'knn_accuracy': knn_accuracy,
                'training_samples': len(X_train),
                'test_samples': len(X_test),
                'features_used': len(self.feature_names)
            }
            
        except Exception as e:
            logger.error(f"Training error: {str(e)}")
            raise
    
    def predict(self, assessment_data, model_type='ensemble'):
        """Make prediction using real data trained models"""
        try:
            # Convert assessment data to feature vector
            feature_vector = {}
            
            # Map assessment form fields to model features
            field_mapping = {
                'age': 'age',
                'gender': 'gender',
                'occupation': 'occupation',
                'stress_level': 'stress_level',
                'sleep_hours': 'sleep_hours',
                'work_hours': 'work_hours',
                'physical_activity_hours': 'physical_activity_hours',
                'social_media_usage': 'social_media_usage',
                'diet_quality': 'diet_quality',
                'smoking_habit': 'smoking_habit',
                'alcohol_consumption': 'alcohol_consumption',
                'symptom_severity': 'symptom_severity',
                'mood_score': 'mood_score',
                'sleep_quality': 'sleep_quality',
                'mental_health_condition': 'mental_health_condition',
                'consultation_history': 'consultation_history',
                'medication_usage': 'medication_usage'
            }
            
            # Create feature vector with defaults
            for model_feature, form_field in field_mapping.items():
                if form_field in assessment_data:
                    feature_vector[model_feature] = assessment_data[form_field]
                else:
                    # Set reasonable defaults
                    defaults = {
                        'age': 30, 'gender': 'Other', 'occupation': 'Other',
                        'stress_level': 'Medium', 'sleep_hours': 7, 'work_hours': 40,
                        'physical_activity_hours': 2, 'social_media_usage': 3,
                        'diet_quality': 'Average', 'smoking_habit': 'Non-Smoker',
                        'alcohol_consumption': 'Light Drinker', 'symptom_severity': 5,
                        'mood_score': 5, 'sleep_quality': 5,
                        'mental_health_condition': 'No', 'consultation_history': 'No',
                        'medication_usage': 'No'
                    }
                    feature_vector[model_feature] = defaults[model_feature]
            
            # Encode categorical features
            for col, encoder in self.label_encoders.items():
                if col in feature_vector:
                    try:
                        feature_vector[col] = encoder.transform([str(feature_vector[col])])[0]
                    except ValueError:
                        # Handle unseen categories
                        feature_vector[col] = 0
            
            # Convert to array
            feature_array = np.array([feature_vector[feature] for feature in self.feature_names]).reshape(1, -1)
            
            if model_type == 'decision_tree':
                prediction = self.models['decision_tree'].predict(feature_array)[0]
                probabilities = self.models['decision_tree'].predict_proba(feature_array)[0]
            elif model_type == 'knn':
                feature_array_scaled = self.scaler.transform(feature_array)
                prediction = self.models['knn'].predict(feature_array_scaled)[0]
                probabilities = self.models['knn'].predict_proba(feature_array_scaled)[0]
            else:  # ensemble
                dt_proba = self.models['decision_tree'].predict_proba(feature_array)[0]
                feature_array_scaled = self.scaler.transform(feature_array)
                knn_proba = self.models['knn'].predict_proba(feature_array_scaled)[0]
                probabilities = (dt_proba + knn_proba) / 2
                prediction = np.argmax(probabilities)
            
            confidence = float(np.max(probabilities) * 100)
            
            # Map prediction to severity and description
            severity_map = {
                0: ("Low", "Low Risk - Good Mental Health Indicators"),
                1: ("Mild", "Mild Mental Health Concerns - Monitor and Support"),
                2: ("Moderate", "Moderate Mental Health Risk - Professional Support Recommended"),
                3: ("High", "High Mental Health Risk - Immediate Professional Attention Needed")
            }
            
            severity, description = severity_map[prediction]
            
            # Generate recommendations and risk factors
            recommendations = self._generate_real_recommendations(prediction, assessment_data)
            risk_factors = self._identify_real_risk_factors(prediction, assessment_data)
            
            return {
                'prediction': description,
                'severity': severity,
                'confidence': round(confidence, 1),
                'recommendations': recommendations,
                'riskFactors': risk_factors,
                'model_used': model_type,
                'data_source': 'real_clinical_data'
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise
    
    def _generate_real_recommendations(self, risk_level, assessment_data):
        """Generate recommendations based on real data patterns"""
        base_recommendations = {
            0: [
                "Continue maintaining your current healthy lifestyle",
                "Regular physical activity and social connections are beneficial",
                "Keep up with good sleep hygiene (7-9 hours per night)",
                "Practice stress management techniques preventively"
            ],
            1: [
                "Monitor your mental health regularly with self-check-ins",
                "Establish consistent daily routines for sleep and meals",
                "Increase physical activity to at least 2.5 hours per week",
                "Consider mindfulness or meditation practices",
                "Maintain social connections and support networks"
            ],
            2: [
                "Seek professional counseling or therapy services",
                "Consider cognitive behavioral therapy (CBT) approaches",
                "Implement stress reduction techniques daily",
                "Maintain regular sleep schedule and limit screen time",
                "Engage in regular physical exercise and outdoor activities",
                "Limit alcohol consumption and avoid smoking"
            ],
            3: [
                "Seek immediate professional mental health evaluation",
                "Contact crisis support services if experiencing thoughts of self-harm",
                "Develop a safety plan with mental health professionals",
                "Consider medication evaluation with a psychiatrist",
                "Establish daily check-ins with trusted support persons",
                "Remove potential means of self-harm from environment"
            ]
        }
        
        recommendations = base_recommendations[risk_level].copy()
        
        # Add personalized recommendations based on assessment
        sleep_hours = assessment_data.get('sleep_hours', 7)
        if sleep_hours < 6:
            recommendations.append("Prioritize improving sleep quality - aim for 7-9 hours nightly")
        
        physical_activity = assessment_data.get('physical_activity_hours', 2)
        if physical_activity < 2:
            recommendations.append("Increase physical activity - even 30 minutes of walking daily helps")
        
        social_media = assessment_data.get('social_media_usage', 3)
        if social_media > 4:
            recommendations.append("Consider reducing social media usage to improve mental wellbeing")
        
        if assessment_data.get('consultation_history') == 'No' and risk_level >= 1:
            recommendations.append("Consider consulting with a mental health professional")
        
        return recommendations[:6]
    
    def _identify_real_risk_factors(self, risk_level, assessment_data):
        """Identify risk factors based on real data patterns"""
        risk_factors = []
        
        # Lifestyle risk factors
        if assessment_data.get('sleep_hours', 7) < 6:
            risk_factors.append("Insufficient sleep (less than 6 hours per night)")
        
        if assessment_data.get('work_hours', 40) > 55:
            risk_factors.append("Excessive work hours (over 55 hours per week)")
        
        if assessment_data.get('physical_activity_hours', 2) < 1:
            risk_factors.append("Sedentary lifestyle with minimal physical activity")
        
        if assessment_data.get('social_media_usage', 3) > 5:
            risk_factors.append("Excessive social media usage (over 5 hours daily)")
        
        # Health behavior risk factors
        if assessment_data.get('smoking_habit') not in ['Non-Smoker', 'Former Smoker']:
            risk_factors.append("Tobacco use affecting mental and physical health")
        
        if assessment_data.get('alcohol_consumption') == 'Heavy Drinker':
            risk_factors.append("Heavy alcohol consumption impacting mental health")
        
        if assessment_data.get('diet_quality') in ['Poor', 'Very Poor']:
            risk_factors.append("Poor diet quality affecting overall wellbeing")
        
        # Clinical risk factors
        if assessment_data.get('stress_level') == 'High':
            risk_factors.append("High stress levels affecting daily functioning")
        
        if assessment_data.get('symptom_severity', 5) >= 7:
            risk_factors.append("Severe mental health symptoms requiring attention")
        
        if assessment_data.get('mood_score', 5) <= 3:
            risk_factors.append("Persistently low mood affecting quality of life")
        
        if assessment_data.get('sleep_quality', 5) <= 3:
            risk_factors.append("Poor sleep quality impacting mental health recovery")
        
        return risk_factors if risk_factors else ["No significant risk factors identified based on current assessment"]

# Initialize the predictor
predictor = RealDataMentalHealthPredictor()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'MindNest ML Service (Real Data)',
        'version': '2.0.0',
        'timestamp': datetime.now().isoformat(),
        'data_source': 'real_clinical_datasets'
    })

@app.route('/train', methods=['POST'])
def train_models():
    """Train the ML models with real data"""
    try:
        logger.info("Starting model training with real datasets...")
        results = predictor.train_models()
        
        return jsonify({
            'status': 'success',
            'message': 'Models trained successfully with real clinical data',
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
    """Make prediction based on assessment data using real data models"""
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
            logger.info("Models not found, training new models with real data...")
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
        'model_count': len(predictor.models),
        'data_source': 'real_clinical_datasets',
        'datasets_used': list(predictor.dataset_urls.keys())
    })

@app.route('/datasets/info', methods=['GET'])
def dataset_info():
    """Get information about the datasets being used"""
    return jsonify({
        'datasets': {
            'dataset1': {
                'name': 'General Mental Health Dataset',
                'url': predictor.dataset_urls['dataset1'],
                'description': 'Comprehensive mental health indicators and lifestyle factors'
            },
            'dataset2': {
                'name': 'Clinical Treatment Dataset', 
                'url': predictor.dataset_urls['dataset2'],
                'description': 'Clinical diagnosis and treatment outcome data'
            }
        },
        'features_extracted': predictor.feature_names,
        'last_updated': datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info("Starting MindNest ML Service with Real Data...")
    logger.info("Training initial models with real clinical datasets...")
    
    try:
        predictor.train_models()
        logger.info("Models trained successfully with real data!")
    except Exception as e:
        logger.error(f"Failed to train models on startup: {str(e)}")
    
    # Start the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
