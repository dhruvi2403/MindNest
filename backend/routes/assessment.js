import express from 'express';
import { db } from '../lib/db.js';
import { authenticateToken } from '../lib/auth.js';

const router = express.Router();

// Get assessment metadata (questions structure)
router.get('/metadata', authenticateToken, async (req, res) => {
  try {
    // Return the structure for 17-18 mental health assessment questions
    const metadata = {
      demographics: {
        age: {
          question: "What is your age?",
          type: "number",
          required: true,
          min: 18,
          max: 100,
          step: 1
        },
        gender: {
          question: "What is your gender?",
          type: "select",
          required: true,
          options: ["Male", "Female", "Non-binary", "Other", "Prefer not to say"]
        }
      },
      anxiety: {
        anxiety_1: {
          question: "I feel nervous, anxious, or on edge",
          type: "radio",
          required: true,
          options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
        },
        anxiety_2: {
          question: "I worry too much about different things",
          type: "radio",
          required: true,
          options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
        },
        anxiety_3: {
          question: "I have trouble relaxing",
          type: "radio",
          required: true,
          options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
        },
        anxiety_4: {
          question: "I get easily annoyed or irritable",
          type: "radio",
          required: true,
          options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
        }
      },
      depression: {
        depression_1: {
          question: "I have little interest or pleasure in doing things",
          type: "radio",
          required: true,
          options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
        },
        depression_2: {
          question: "I feel down, depressed, or hopeless",
          type: "radio",
          required: true,
          options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
        },
        depression_3: {
          question: "I have trouble falling or staying asleep, or sleeping too much",
          type: "radio",
          required: true,
          options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
        },
        depression_4: {
          question: "I feel tired or have little energy",
          type: "radio",
          required: true,
          options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
        }
      },
      stress: {
        stress_1: {
          question: "I feel overwhelmed by my responsibilities",
          type: "radio",
          required: true,
          options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
        },
        stress_2: {
          question: "I have difficulty concentrating due to stress",
          type: "radio",
          required: true,
          options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
        },
        stress_3: {
          question: "I experience physical symptoms when stressed (headaches, muscle tension, etc.)",
          type: "radio",
          required: true,
          options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
        }
      },
      general: {
        general_1: {
          question: "I have a strong support system of family and friends",
          type: "radio",
          required: true,
          options: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]
        },
        general_2: {
          question: "I am able to cope with life's challenges effectively",
          type: "radio",
          required: true,
          options: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]
        },
        general_3: {
          question: "I feel optimistic about my future",
          type: "radio",
          required: true,
          options: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]
        }
      }
    };
    
    res.json(metadata);
  } catch (error) {
    console.error('Get assessment metadata error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dynamic assessment submission
router.post('/dynamic', authenticateToken, async (req, res) => {
  try {
    const { answers, timestamp } = req.body;
    
    if (!answers) {
      return res.status(400).json({ error: 'Assessment answers are required' });
    }

    // Convert answers to numerical format for ML model
    const numericalAnswers = {};
    Object.entries(answers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Convert text responses to numerical values
        if (value === "Not at all" || value === "Never" || value === "Strongly disagree") {
          numericalAnswers[key] = 0;
        } else if (value === "Several days" || value === "Rarely" || value === "Disagree") {
          numericalAnswers[key] = 1;
        } else if (value === "More than half the days" || value === "Sometimes" || value === "Neutral") {
          numericalAnswers[key] = 2;
        } else if (value === "Nearly every day" || value === "Often" || value === "Agree") {
          numericalAnswers[key] = 3;
        } else if (value === "Always" || value === "Strongly agree") {
          numericalAnswers[key] = 4;
        } else {
          numericalAnswers[key] = parseInt(value) || 0;
        }
      } else {
        numericalAnswers[key] = value;
      }
    });

    // Try to get prediction from ML service
    let prediction = null;
    try {
      const mlResponse = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: numericalAnswers,
          model_type: 'ensemble'
        }),
        timeout: 10000 // 10 second timeout
      });

      if (mlResponse.ok) {
        prediction = await mlResponse.json();
      }
    } catch (mlError) {
      console.log('ML service unavailable, using fallback prediction');
    }

    // If ML service is unavailable, use fallback prediction logic
    if (!prediction) {
      prediction = generateFallbackPrediction(numericalAnswers);
    }

    // Create assessment record
    const assessmentData = {
      userId: req.user.userId,
      answers: numericalAnswers,
      result: {
        prediction: prediction.prediction || prediction.risk_level || "Moderate",
        confidence: prediction.confidence || 85,
        severity: prediction.severity || "Moderate",
        recommendations: prediction.recommendations || [
          "Consider speaking with a mental health professional",
          "Practice stress management techniques",
          "Maintain regular sleep and exercise routines"
        ],
        riskFactors: prediction.risk_factors || ["Stress", "Anxiety symptoms"]
      }
    };

    const newAssessment = await db.assessments.create(assessmentData);
    
    res.status(201).json({
      assessment: newAssessment,
      prediction: assessmentData.result
    });
  } catch (error) {
    console.error('Dynamic assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fallback prediction logic when ML service is unavailable
function generateFallbackPrediction(answers) {
  let anxietyScore = 0;
  let depressionScore = 0;
  let stressScore = 0;
  let generalScore = 0;

  // Calculate scores for each category
  if (answers.anxiety_1 !== undefined) anxietyScore += answers.anxiety_1;
  if (answers.anxiety_2 !== undefined) anxietyScore += answers.anxiety_2;
  if (answers.anxiety_3 !== undefined) anxietyScore += answers.anxiety_3;
  if (answers.anxiety_4 !== undefined) anxietyScore += answers.anxiety_4;

  if (answers.depression_1 !== undefined) depressionScore += answers.depression_1;
  if (answers.depression_2 !== undefined) depressionScore += answers.depression_2;
  if (answers.depression_3 !== undefined) depressionScore += answers.depression_3;
  if (answers.depression_4 !== undefined) depressionScore += answers.depression_4;

  if (answers.stress_1 !== undefined) stressScore += answers.stress_1;
  if (answers.stress_2 !== undefined) stressScore += answers.stress_2;
  if (answers.stress_3 !== undefined) stressScore += answers.stress_3;

  if (answers.general_1 !== undefined) generalScore += (4 - answers.general_1); // Reverse score
  if (answers.general_2 !== undefined) generalScore += (4 - answers.general_2);
  if (answers.general_3 !== undefined) generalScore += (4 - answers.general_3);

  // Calculate overall risk score
  const totalScore = anxietyScore + depressionScore + stressScore + generalScore;
  const maxPossibleScore = 4 * 4 + 4 * 4 + 5 * 3 + 5 * 3; // 16 + 16 + 15 + 15 = 62
  const riskPercentage = (totalScore / maxPossibleScore) * 100;

  let riskLevel, severity, recommendations;
  
  if (riskPercentage < 25) {
    riskLevel = "Low Risk";
    severity = "Low";
    recommendations = [
      "Continue maintaining good mental health practices",
      "Regular exercise and social activities",
      "Consider mindfulness or meditation practices"
    ];
  } else if (riskPercentage < 50) {
    riskLevel = "Mild Risk";
    severity = "Mild";
    recommendations = [
      "Monitor your stress levels",
      "Practice stress management techniques",
      "Consider talking to a counselor if symptoms persist"
    ];
  } else if (riskPercentage < 75) {
    riskLevel = "Moderate Risk";
    severity = "Moderate";
    recommendations = [
      "Consider speaking with a mental health professional",
      "Practice stress management techniques",
      "Maintain regular sleep and exercise routines",
      "Consider therapy or counseling"
    ];
  } else {
    riskLevel = "High Risk";
    severity = "High";
    recommendations = [
      "Please seek professional mental health support immediately",
      "Consider speaking with a therapist or psychiatrist",
      "Practice self-care and stress management",
      "Reach out to crisis helplines if needed"
    ];
  }

  return {
    prediction: riskLevel,
    confidence: 85,
    severity: severity,
    recommendations: recommendations,
    risk_factors: ["Assessment score analysis", "Symptom patterns"]
  };
}

// Get user assessments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const assessments = await db.assessments.findByUserId(req.user.userId);
    res.json(assessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new assessment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { answers, result } = req.body;

    if (!answers || !result) {
      return res.status(400).json({ error: 'Answers and result are required' });
    }

    const assessmentData = {
      userId: req.user.userId,
      answers,
      result,
    };

    const newAssessment = await db.assessments.create(assessmentData);
    res.status(201).json(newAssessment);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
