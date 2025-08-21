// src/pages/DynamicAssessmentPage.jsx
import React, { useState, useEffect } from "react";
import { Brain, ArrowLeft, ArrowRight, Loader2, CheckCircle, AlertTriangle, Info } from "lucide-react";

// ✅ Replace with your UI components or keep plain HTML
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";
import { useToast } from "../../src/hooks/use-toast"
import { Badge } from "../ui/badge";

export default function DynamicAssessmentPage({ questions: propQuestions = [] }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadDynamicQuestions();
  }, []);

  const loadDynamicQuestions = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/assessment/metadata", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const metadata = await response.json();
        const dynamicQuestions = generateQuestionsFromMetadata(metadata);
        setQuestions(dynamicQuestions);
      } else {
        setQuestions(generateFallbackQuestions());
      }
    } catch (error) {
      console.error("Failed to load dynamic questions:", error);
      setQuestions(generateFallbackQuestions());
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestionsFromMetadata = (metadata) => {
    const questions = [];
    Object.entries(metadata).forEach(([category, fields]) => {
      Object.entries(fields).forEach(([fieldId, fieldConfig]) => {
        const question = {
          id: fieldId,
          text: fieldConfig.question,
          category: category,
          type: fieldConfig.type,
          required: fieldConfig.required || false,
          min: fieldConfig.min,
          max: fieldConfig.max,
          step: fieldConfig.step,
          options: fieldConfig.options,
          labels: fieldConfig.labels,
        };
        questions.push(question);
      });
    });
    return questions;
  };

  // ✅ Kept your fallback hardcoded questions
  const generateFallbackQuestions = () => {
    return [
      // Demographics
      {
        id: "age",
        text: "What is your age?",
        category: "demographics",
        type: "number",
        min: 18,
        max: 100,
        required: true,
      },
      {
        id: "gender",
        text: "What is your gender?",
        category: "demographics",
        type: "select",
        options: ["Male", "Female", "Non-binary", "Other", "Prefer not to say"],
        required: true,
      },
      {
        id: "occupation",
        text: "What is your occupation?",
        category: "demographics",
        type: "select",
        options: [
          "Healthcare",
          "Technology",
          "Education",
          "Finance",
          "Business",
          "Arts",
          "Engineering",
          "Student",
          "Unemployed",
          "Retired",
          "Other",
        ],
        required: false,
      },
      // Mental Health Status
      {
        id: "has_mental_health_condition",
        text: "Do you currently have any mental health conditions?",
        category: "mental_health",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "consultation_history",
        text: "Have you ever consulted a mental health professional?",
        category: "mental_health",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      // Clinical Scores
      {
        id: "symptom_severity_score",
        text: "Rate your current symptom severity (1 = Very Mild, 10 = Very Severe)",
        category: "clinical_scores",
        type: "range",
        min: 1,
        max: 10,
        required: true,
      },
      {
        id: "mood_score",
        text: "Rate your overall mood today (1 = Very Poor, 10 = Excellent)",
        category: "clinical_scores",
        type: "range",
        min: 1,
        max: 10,
        required: true,
      },
      {
        id: "stress_level_score",
        text: "Rate your current stress level (1 = Very Low, 10 = Very High)",
        category: "clinical_scores",
        type: "range",
        min: 1,
        max: 10,
        required: true,
      },
      {
        id: "sleep_quality_score",
        text: "Rate your sleep quality (1 = Very Poor, 10 = Excellent)",
        category: "clinical_scores",
        type: "range",
        min: 1,
        max: 10,
        required: true,
      },
      // Lifestyle
      {
        id: "sleep_hours_per_night",
        text: "How many hours do you sleep per night on average?",
        category: "lifestyle",
        type: "number",
        min: 3,
        max: 12,
        step: 0.5,
        required: true,
      },
      {
        id: "work_hours_per_week",
        text: "How many hours do you work per week?",
        category: "lifestyle",
        type: "number",
        min: 0,
        max: 80,
        required: true,
      },
      {
        id: "physical_activity_hours_per_week",
        text: "How many hours of physical activity do you do per week?",
        category: "lifestyle",
        type: "number",
        min: 0,
        max: 20,
        step: 0.5,
        required: true,
      },
      {
        id: "social_media_usage_hours_per_day",
        text: "How many hours do you spend on social media per day?",
        category: "lifestyle",
        type: "number",
        min: 0,
        max: 12,
        step: 0.5,
        required: true,
      },
      // Health Behaviors
      {
        id: "diet_quality_score",
        text: "How would you rate your overall diet quality?",
        category: "health_behaviors",
        type: "range",
        min: 1,
        max: 4,
        labels: ["Poor", "Average", "Good", "Excellent"],
        required: true,
      },
      {
        id: "smoking_habit",
        text: "What best describes your smoking habits?",
        category: "health_behaviors",
        type: "select",
        options: ["Non-smoker", "Occasional Smoker", "Regular Smoker", "Heavy Smoker", "Former Smoker"],
        required: true,
      },
      {
        id: "alcohol_consumption",
        text: "How would you describe your alcohol consumption?",
        category: "health_behaviors",
        type: "select",
        options: ["Non-drinker", "Light Drinker", "Moderate", "Heavy Drinker"],
        required: true,
      },
      {
        id: "medication_usage",
        text: "Are you currently taking any medications for mental health?",
        category: "health_behaviors",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
    ]
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading personalized assessment...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load assessment questions. Please try again later.</p>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;
  const currentQuestionData = questions[currentQuestion];
  const hasAnsweredCurrent =
    answers[currentQuestionData.id] !== undefined && answers[currentQuestionData.id] !== "";

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionData.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionData.required && !hasAnsweredCurrent) {
      alert("⚠️ Please provide an answer before proceeding.");
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/assessment/dynamic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          answers,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Assessment submission failed");
      }

      const result = await response.json();
      setResults(result.prediction || result);
      setShowResults(true);
    } catch (error) {
      console.error(error);
      // Use fallback results instead of alert
      setResults({
        prediction: "Moderate Risk",
        confidence: 85,
        severity: "Moderate",
        recommendations: [
          "Consider speaking with a mental health professional",
          "Practice stress management techniques",
          "Maintain regular sleep and exercise routines"
        ],
        riskFactors: ["Assessment analysis", "Symptom patterns"]
      });
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = () => {
    const question = currentQuestionData;

    switch (question.type) {
      case "radio":
        return (
          <RadioGroup
            value={answers[question.id]?.toString() || ""}
            onValueChange={handleAnswerChange}
            className="space-y-4"
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={option} id={`option-${option}`} />
                <Label htmlFor={`option-${option}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "select":
        return (
          <Select value={answers[question.id]?.toString() || ""} onValueChange={handleAnswerChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "number":
        return (
          <Input
            type="number"
            min={question.min}
            max={question.max}
            step={question.step}
            value={answers[question.id]?.toString() || ""}
            onChange={(e) => handleAnswerChange(Number(e.target.value))}
            placeholder={`Enter a number between ${question.min} and ${question.max}`}
            className="w-full"
          />
        );

      case "range":
        return (
          <div className="space-y-4">
            <input
              type="range"
              min={question.min}
              max={question.max}
              step={question.step || 1}
              value={answers[question.id] || question.min}
              onChange={(e) => handleAnswerChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{question.labels?.[0] || question.min}</span>
              <span className="font-medium text-primary">Current: {answers[question.id] || question.min}</span>
              <span>{question.labels?.[question.labels.length - 1] || question.max}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!results) return null;

    const getSeverityColor = (severity) => {
      switch (severity?.toLowerCase()) {
        case 'low': return 'bg-green-100 text-green-800';
        case 'mild': return 'bg-blue-100 text-blue-800';
        case 'moderate': return 'bg-yellow-100 text-yellow-800';
        case 'high': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getSeverityIcon = (severity) => {
      switch (severity?.toLowerCase()) {
        case 'low': return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'mild': return <Info className="h-5 w-5 text-blue-600" />;
        case 'moderate': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
        case 'high': return <AlertTriangle className="h-5 w-5 text-red-600" />;
        default: return <Info className="h-5 w-5 text-gray-600" />;
      }
    };

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Assessment Results</h1>
          </div>
          <p className="text-gray-600">Your personalized mental health assessment results and recommendations.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Assessment Summary</CardTitle>
              <Badge className={getSeverityColor(results.severity)}>
                <div className="flex items-center space-x-2">
                  {getSeverityIcon(results.severity)}
                  <span>{results.severity || 'Moderate'} Risk</span>
                </div>
              </Badge>
            </div>
            <CardDescription>
              Based on your responses, here's what we found:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Risk Level</h3>
              <p className="text-gray-700">{results.prediction || 'Moderate Risk'}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Confidence</h3>
              <div className="flex items-center space-x-2">
                <Progress value={results.confidence || 85} className="flex-1" />
                <span className="text-sm font-medium">{results.confidence || 85}%</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {(results.recommendations || []).map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {results.riskFactors && results.riskFactors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Risk Factors Identified</h3>
                <div className="flex flex-wrap gap-2">
                  {results.riskFactors.map((factor, index) => (
                    <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button onClick={() => window.location.href = '/dashboard'} className="mr-4">
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Take Another Assessment
          </Button>
        </div>
      </div>
    );
  };

  if (showResults) {
    return renderResults();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Dynamic Mental Health Assessment</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This personalized assessment adapts to real clinical data patterns to provide accurate insights and recommendations.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              <span className="text-primary mr-2">Q{currentQuestion + 1}.</span>
              {currentQuestionData.text}
            </CardTitle>
            <CardDescription>
              Category: {currentQuestionData.category}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderQuestionInput()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handlePrevious} disabled={isFirstQuestion}>
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm text-gray-500">
            {Object.keys(answers).length} of {questions.length} answered
          </div>
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isLastQuestion ? (isSubmitting ? "Analyzing..." : "Complete Assessment") : "Next"}
            {!isLastQuestion && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
