import express from 'express';
import { db } from '../lib/db.js';
import { authenticateToken } from '../lib/auth.js';

const router = express.Router();

// Submit assessment and get prediction
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { answers, mlResult } = req.body;
    const userId = req.user.userId;

    // Process the assessment result
    let result;
    if (mlResult) {
      // Use ML service result if available
      result = mlResult;
    } else {
      // Fallback: Generate result based on answers
      result = generateFallbackResult(answers);
    }

    // Save assessment to database
    const assessmentData = {
      userId,
      answers,
      result
    };

    const assessment = await db.assessments.create(assessmentData);

    res.json({
      message: 'Assessment submitted successfully',
      assessment,
      prediction: result
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fallback result generation function
function generateFallbackResult(answers) {
  // Simple scoring algorithm based on answer patterns
  let totalScore = 0;
  let questionCount = 0;

  // Convert answers to numeric scores
  Object.values(answers).forEach(answer => {
    if (typeof answer === 'number') {
      totalScore += answer;
      questionCount++;
    } else if (typeof answer === 'string') {
      // Convert string answers to numeric scores
      const score = convertAnswerToScore(answer);
      totalScore += score;
      questionCount++;
    }
  });

  const averageScore = questionCount > 0 ? totalScore / questionCount : 0;

  // Determine severity based on average score
  let severity, prediction, confidence;

  if (averageScore <= 1) {
    severity = 'Low';
    prediction = 'Low Risk - Good Mental Health';
    confidence = 85;
  } else if (averageScore <= 2) {
    severity = 'Mild';
    prediction = 'Mild Risk - Some Concerns';
    confidence = 80;
  } else if (averageScore <= 3) {
    severity = 'Moderate';
    prediction = 'Moderate Risk - Professional Support Recommended';
    confidence = 75;
  } else {
    severity = 'High';
    prediction = 'High Risk - Immediate Professional Help Recommended';
    confidence = 90;
  }

  return {
    prediction,
    confidence,
    severity,
    recommendations: getRecommendations(severity),
    riskFactors: ['Assessment analysis', 'Symptom patterns']
  };
}

// Convert string answers to numeric scores
function convertAnswerToScore(answer) {
  const answerLower = answer.toLowerCase();

  if (answerLower.includes('not at all') || answerLower.includes('never')) return 0;
  if (answerLower.includes('several days') || answerLower.includes('rarely')) return 1;
  if (answerLower.includes('more than half') || answerLower.includes('sometimes')) return 2;
  if (answerLower.includes('nearly every day') || answerLower.includes('often') || answerLower.includes('always')) return 3;

  // Default scoring for other types of answers
  return 1;
}

// Get recommendations based on severity
function getRecommendations(severity) {
  const recommendationMap = {
    'Low': [
      'Continue maintaining good mental health habits',
      'Practice regular self-care and stress management',
      'Stay connected with supportive relationships'
    ],
    'Mild': [
      'Consider speaking with a counselor or therapist',
      'Practice stress management techniques regularly',
      'Maintain regular sleep and exercise routines',
      'Stay connected with supportive friends and family'
    ],
    'Moderate': [
      'Seek professional mental health support',
      'Consider therapy or counseling services',
      'Practice daily stress management and self-care',
      'Maintain regular contact with healthcare providers'
    ],
    'High': [
      'Seek immediate professional mental health support',
      'Contact a mental health crisis line if needed',
      'Consider intensive therapy or treatment programs',
      'Ensure you have a strong support system in place'
    ]
  };

  return recommendationMap[severity] || recommendationMap['Moderate'];
}

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

// Get exercise recommendations based on assessment results
router.get('/exercises/:assessmentId', authenticateToken, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await db.assessments.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Verify the assessment belongs to the requesting user
    if (assessment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const exercises = generateExerciseRecommendations(assessment.result.severity, assessment.result.prediction);

    res.json({
      exercises,
      severity: assessment.result.severity,
      prediction: assessment.result.prediction
    });
  } catch (error) {
    console.error('Get exercise recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate exercise recommendations based on severity level
function generateExerciseRecommendations(severity, prediction) {
  const exerciseDatabase = {
    "Low": [
      {
        id: 1,
        title: "Daily Gratitude Practice",
        description: "Write down 3 things you're grateful for each day to maintain positive mental health.",
        duration: "5-10 minutes",
        frequency: "Daily",
        category: "Mindfulness",
        instructions: [
          "Find a quiet moment each morning or evening",
          "Write down three specific things you're grateful for",
          "Include why each item makes you feel grateful",
          "Reflect on the positive emotions these bring"
        ],
        benefits: ["Improves mood", "Increases life satisfaction", "Reduces stress"]
      },
      {
        id: 2,
        title: "Mindful Walking",
        description: "Take a 15-20 minute walk while focusing on your surroundings and breathing.",
        duration: "15-20 minutes",
        frequency: "3-4 times per week",
        category: "Physical Activity",
        instructions: [
          "Choose a peaceful route, preferably in nature",
          "Walk at a comfortable, steady pace",
          "Focus on your breathing and the sensations of walking",
          "Notice the sights, sounds, and smells around you",
          "When your mind wanders, gently bring attention back to the present"
        ],
        benefits: ["Reduces anxiety", "Improves physical health", "Enhances mindfulness"]
      },
      {
        id: 3,
        title: "Progressive Muscle Relaxation",
        description: "Systematically tense and relax different muscle groups to reduce physical tension.",
        duration: "10-15 minutes",
        frequency: "Daily before bed",
        category: "Relaxation",
        instructions: [
          "Lie down in a comfortable position",
          "Start with your toes - tense for 5 seconds, then relax",
          "Move up through each muscle group (calves, thighs, abdomen, etc.)",
          "Hold tension for 5 seconds, then release and notice the relaxation",
          "End with your face and scalp muscles"
        ],
        benefits: ["Reduces muscle tension", "Improves sleep quality", "Decreases stress"]
      }
    ],
    "Mild": [
      {
        id: 4,
        title: "4-7-8 Breathing Technique",
        description: "A powerful breathing exercise to reduce anxiety and promote relaxation.",
        duration: "5-10 minutes",
        frequency: "2-3 times daily",
        category: "Breathing",
        instructions: [
          "Sit comfortably with your back straight",
          "Exhale completely through your mouth",
          "Inhale through your nose for 4 counts",
          "Hold your breath for 7 counts",
          "Exhale through your mouth for 8 counts",
          "Repeat the cycle 3-4 times"
        ],
        benefits: ["Reduces anxiety", "Improves sleep", "Calms nervous system"]
      },
      {
        id: 5,
        title: "Journaling for Emotional Processing",
        description: "Write about your thoughts and feelings to process emotions and gain clarity.",
        duration: "15-20 minutes",
        frequency: "Daily",
        category: "Emotional Processing",
        instructions: [
          "Set aside time each day, preferably at the same time",
          "Write freely about your thoughts and feelings",
          "Don't worry about grammar or structure",
          "Focus on what's bothering you or what you're experiencing",
          "End by writing one positive thing about your day"
        ],
        benefits: ["Improves emotional awareness", "Reduces stress", "Enhances problem-solving"]
      },
      {
        id: 6,
        title: "Gentle Yoga Flow",
        description: "A series of gentle yoga poses to reduce stress and improve flexibility.",
        duration: "20-30 minutes",
        frequency: "3-4 times per week",
        category: "Physical Activity",
        instructions: [
          "Start with child's pose for 1-2 minutes",
          "Move through cat-cow stretches (5-10 repetitions)",
          "Practice downward-facing dog for 30 seconds",
          "Flow through gentle sun salutations",
          "End with savasana (corpse pose) for 5 minutes"
        ],
        benefits: ["Reduces stress", "Improves flexibility", "Enhances mind-body connection"]
      },
      {
        id: 7,
        title: "Grounding Exercise (5-4-3-2-1)",
        description: "Use your senses to ground yourself in the present moment during anxiety.",
        duration: "5-10 minutes",
        frequency: "As needed",
        category: "Mindfulness",
        instructions: [
          "Name 5 things you can see around you",
          "Name 4 things you can touch",
          "Name 3 things you can hear",
          "Name 2 things you can smell",
          "Name 1 thing you can taste",
          "Take deep breaths throughout the exercise"
        ],
        benefits: ["Reduces anxiety", "Improves focus", "Grounds you in the present"]
      }
    ],
    "Moderate": [
      {
        id: 8,
        title: "Cognitive Restructuring Exercise",
        description: "Challenge negative thought patterns and replace them with more balanced thinking.",
        duration: "15-20 minutes",
        frequency: "Daily",
        category: "Cognitive Therapy",
        instructions: [
          "Identify a negative or distressing thought",
          "Write down the thought exactly as it occurs",
          "Ask: 'Is this thought realistic? What evidence supports/contradicts it?'",
          "Consider alternative, more balanced perspectives",
          "Write a more realistic, balanced thought to replace the negative one",
          "Practice using the new thought when the situation arises"
        ],
        benefits: ["Reduces negative thinking", "Improves mood", "Builds resilience"]
      },
      {
        id: 9,
        title: "Body Scan Meditation",
        description: "A mindfulness practice to increase body awareness and reduce tension.",
        duration: "20-30 minutes",
        frequency: "Daily",
        category: "Meditation",
        instructions: [
          "Lie down comfortably and close your eyes",
          "Start by focusing on your breath for a few minutes",
          "Slowly move your attention to your toes",
          "Notice any sensations without trying to change them",
          "Gradually move up through your entire body",
          "Spend 1-2 minutes on each body part",
          "End by taking a few deep breaths"
        ],
        benefits: ["Reduces stress", "Improves body awareness", "Promotes relaxation"]
      },
      {
        id: 10,
        title: "Behavioral Activation",
        description: "Schedule and engage in meaningful activities to combat depression and low mood.",
        duration: "30-60 minutes",
        frequency: "Daily",
        category: "Behavioral Therapy",
        instructions: [
          "Make a list of activities you used to enjoy",
          "Rate each activity from 1-10 for pleasure and accomplishment",
          "Schedule one small activity each day",
          "Start with easier, shorter activities",
          "Track your mood before and after each activity",
          "Gradually increase the duration and complexity of activities"
        ],
        benefits: ["Improves mood", "Increases motivation", "Builds positive experiences"]
      },
      {
        id: 11,
        title: "Loving-Kindness Meditation",
        description: "Cultivate compassion for yourself and others to improve emotional well-being.",
        duration: "15-20 minutes",
        frequency: "3-4 times per week",
        category: "Meditation",
        instructions: [
          "Sit comfortably and close your eyes",
          "Start by directing loving-kindness toward yourself: 'May I be happy, may I be healthy, may I be at peace'",
          "Visualize someone you love and repeat the phrases for them",
          "Think of a neutral person and extend the same wishes",
          "Consider someone you have difficulty with and try to extend compassion",
          "End by sending loving-kindness to all beings everywhere"
        ],
        benefits: ["Increases self-compassion", "Reduces negative emotions", "Improves relationships"]
      }
    ],
    "High": [
      {
        id: 12,
        title: "Crisis Breathing Technique",
        description: "An immediate breathing technique for acute anxiety or panic attacks.",
        duration: "3-5 minutes",
        frequency: "As needed during crisis",
        category: "Crisis Management",
        instructions: [
          "Find a safe, quiet place if possible",
          "Breathe in slowly through your nose for 4 counts",
          "Hold your breath for 4 counts",
          "Exhale slowly through your mouth for 6 counts",
          "Repeat until you feel calmer",
          "Focus only on counting and breathing"
        ],
        benefits: ["Immediate anxiety relief", "Calms panic attacks", "Regulates nervous system"]
      },
      {
        id: 13,
        title: "Safety Planning Exercise",
        description: "Create a personalized safety plan for managing crisis situations.",
        duration: "30-45 minutes",
        frequency: "Once, then review weekly",
        category: "Crisis Management",
        instructions: [
          "Identify your personal warning signs of crisis",
          "List coping strategies that have helped you before",
          "Write down people you can contact for support",
          "Include professional crisis hotline numbers",
          "Identify safe environments and people",
          "Remove or secure any means of self-harm",
          "Keep this plan easily accessible"
        ],
        benefits: ["Provides structure during crisis", "Increases safety", "Builds support network"]
      },
      {
        id: 14,
        title: "Distress Tolerance Skills",
        description: "Learn skills to tolerate intense emotions without making them worse.",
        duration: "10-15 minutes",
        frequency: "As needed",
        category: "Crisis Management",
        instructions: [
          "TIPP technique: Temperature (cold water on face), Intense exercise (jumping jacks), Paced breathing, Paired muscle relaxation",
          "Distract with activities: count backwards from 100, name all blue objects you see",
          "Self-soothe with senses: listen to calming music, smell something pleasant",
          "Improve the moment: find meaning in the situation, use prayer/meditation",
          "Remember: this feeling is temporary and will pass"
        ],
        benefits: ["Manages intense emotions", "Prevents impulsive actions", "Builds emotional resilience"]
      },
      {
        id: 15,
        title: "Grounding for Severe Anxiety",
        description: "Intensive grounding techniques for severe anxiety or dissociation.",
        duration: "10-20 minutes",
        frequency: "As needed",
        category: "Crisis Management",
        instructions: [
          "Hold an ice cube or splash cold water on your face",
          "Name 5 things you can see, 4 you can hear, 3 you can touch, 2 you can smell, 1 you can taste",
          "Press your feet firmly into the ground",
          "Describe your surroundings out loud in detail",
          "Do simple math problems or recite something you've memorized",
          "Call someone you trust and talk about anything"
        ],
        benefits: ["Reduces dissociation", "Manages severe anxiety", "Reconnects with reality"]
      }
    ]
  };

  return exerciseDatabase[severity] || exerciseDatabase["Moderate"];
}

export default router;
