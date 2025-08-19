import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import LabelEncoder
import requests
from io import StringIO

def fetch_and_analyze_datasets():
    """Fetch and analyze both mental health datasets"""
    
    # Dataset URLs
    dataset1_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mentalhealthdataset2-hA4Uuby0GR2Af4Mal0f2ZPhdNJmRqG.csv"
    dataset2_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mental_health_diagnosis_treatment_-uF7hPEA1DXEKsbyLjBsic2IUeg9rE6.csv"
    
    print("Fetching datasets...")
    
    try:
        # Fetch Dataset 1
        response1 = requests.get(dataset1_url)
        df1 = pd.read_csv(StringIO(response1.text))
        print(f"Dataset 1 loaded: {df1.shape[0]} rows, {df1.shape[1]} columns")
        
        # Fetch Dataset 2
        response2 = requests.get(dataset2_url)
        df2 = pd.read_csv(StringIO(response2.text))
        print(f"Dataset 2 loaded: {df2.shape[0]} rows, {df2.shape[1]} columns")
        
    except Exception as e:
        print(f"Error fetching datasets: {e}")
        return None, None
    
    # Analyze Dataset 1 (General Mental Health)
    print("\n" + "="*50)
    print("DATASET 1 ANALYSIS (General Mental Health)")
    print("="*50)
    
    print("\nColumn Info:")
    print(df1.info())
    
    print("\nFirst few rows:")
    print(df1.head())
    
    print("\nMissing values:")
    print(df1.isnull().sum())
    
    print("\nUnique values in categorical columns:")
    categorical_cols1 = ['Gender', 'Occupation', 'Country', 'Mental_Health_Condition', 
                        'Severity', 'Consultation_History', 'Stress_Level', 'Diet_Quality', 
                        'Smoking_Habit', 'Alcohol_Consumption', 'Medication_Usage']
    
    for col in categorical_cols1:
        if col in df1.columns:
            print(f"{col}: {df1[col].unique()}")
    
    # Analyze Dataset 2 (Clinical Data)
    print("\n" + "="*50)
    print("DATASET 2 ANALYSIS (Clinical Treatment Data)")
    print("="*50)
    
    print("\nColumn Info:")
    print(df2.info())
    
    print("\nFirst few rows:")
    print(df2.head())
    
    print("\nMissing values:")
    print(df2.isnull().sum())
    
    print("\nUnique values in categorical columns:")
    categorical_cols2 = ['Gender', 'Diagnosis', 'Medication', 'Therapy Type', 
                        'Outcome', 'AI-Detected Emotional State']
    
    for col in categorical_cols2:
        if col in df2.columns:
            print(f"{col}: {df2[col].unique()}")
    
    # Generate insights for form design
    print("\n" + "="*50)
    print("INSIGHTS FOR FORM DESIGN")
    print("="*50)
    
    # Age distribution
    if 'Age' in df1.columns:
        print(f"\nAge range in Dataset 1: {df1['Age'].min()} - {df1['Age'].max()}")
    if 'Age' in df2.columns:
        print(f"Age range in Dataset 2: {df2['Age'].min()} - {df2['Age'].max()}")
    
    # Mental health conditions
    if 'Mental_Health_Condition' in df1.columns:
        mh_dist = df1['Mental_Health_Condition'].value_counts()
        print(f"\nMental Health Condition distribution:")
        print(mh_dist)
    
    if 'Diagnosis' in df2.columns:
        diag_dist = df2['Diagnosis'].value_counts()
        print(f"\nDiagnosis distribution:")
        print(diag_dist)
    
    # Stress levels
    if 'Stress_Level' in df1.columns:
        stress_dist = df1['Stress_Level'].value_counts()
        print(f"\nStress Level distribution:")
        print(stress_dist)
    
    # Generate form field recommendations
    print("\n" + "="*50)
    print("RECOMMENDED FORM FIELDS")
    print("="*50)
    
    form_fields = {
        "demographics": ["Age", "Gender", "Occupation", "Country"],
        "lifestyle": ["Sleep_Hours", "Work_Hours", "Physical_Activity_Hours", 
                     "Social_Media_Usage", "Diet_Quality", "Smoking_Habit", "Alcohol_Consumption"],
        "mental_health": ["Stress_Level", "Mental_Health_Condition", "Consultation_History", 
                         "Medication_Usage"],
        "clinical": ["Symptom Severity (1-10)", "Mood Score (1-10)", "Sleep Quality (1-10)"]
    }
    
    for category, fields in form_fields.items():
        print(f"\n{category.upper()}:")
        for field in fields:
            if field in df1.columns or field in df2.columns:
                print(f"  ✓ {field}")
            else:
                print(f"  - {field} (not in datasets)")
    
    return df1, df2

def prepare_ml_data(df1, df2):
    """Prepare data for ML model training"""
    print("\n" + "="*50)
    print("PREPARING ML TRAINING DATA")
    print("="*50)
    
    # Combine relevant features from both datasets
    ml_features = []
    
    # From Dataset 1
    if df1 is not None:
        # Select numeric and categorical features
        numeric_cols = ['Age', 'Sleep_Hours', 'Work_Hours', 'Physical_Activity_Hours', 'Social_Media_Usage']
        categorical_cols = ['Gender', 'Stress_Level', 'Diet_Quality', 'Smoking_Habit', 'Alcohol_Consumption']
        
        df1_clean = df1.copy()
        
        # Clean and prepare data
        for col in numeric_cols:
            if col in df1_clean.columns:
                df1_clean[col] = pd.to_numeric(df1_clean[col], errors='coerce')
        
        # Create target variable (Mental Health Risk)
        if 'Mental_Health_Condition' in df1_clean.columns and 'Severity' in df1_clean.columns:
            df1_clean['Risk_Level'] = df1_clean.apply(lambda row: 
                'High' if row['Mental_Health_Condition'] == 'Yes' and row['Severity'] in ['Severe', 'Moderate']
                else 'Medium' if row['Mental_Health_Condition'] == 'Yes' and row['Severity'] == 'Mild'
                else 'Low', axis=1)
        
        print(f"Dataset 1 prepared: {len(df1_clean)} samples")
        print(f"Risk Level distribution: {df1_clean['Risk_Level'].value_counts().to_dict()}")
    
    # Save processed data for ML training
    if df1 is not None:
        df1_clean.to_csv('scripts/processed_mental_health_data.csv', index=False)
        print("Processed data saved to scripts/processed_mental_health_data.csv")
    
    return df1_clean if df1 is not None else None

if __name__ == "__main__":
    # Run analysis
    df1, df2 = fetch_and_analyze_datasets()
    
    if df1 is not None or df2 is not None:
        processed_data = prepare_ml_data(df1, df2)
        print("\nDataset analysis complete!")
        print("Next steps:")
        print("1. Update assessment form with identified fields")
        print("2. Retrain ML models with real data")
        print("3. Update form validation and UI components")
    else:
        print("Failed to load datasets. Please check URLs and network connection.")
