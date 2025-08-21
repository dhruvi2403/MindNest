import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Brain,
  Clock,
  Calendar,
  CheckCircle,
  Heart,
  Zap,
  Leaf,
  Shield,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft
} from "lucide-react"

export default function ExerciseRecommendations({ assessmentId, severity, onClose }) {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [completedExercises, setCompletedExercises] = useState(new Set())
  const [activeTimer, setActiveTimer] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchExercises()
  }, [assessmentId])

  useEffect(() => {
    let interval = null
    if (activeTimer && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setActiveTimer(null)
            toast({
              title: "Exercise Complete!",
              description: "Great job completing this exercise. How do you feel?",
            })
            return 0
          }
          return time - 1
        })
      }, 1000)
    } else if (timeRemaining === 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [activeTimer, timeRemaining, toast])

  const fetchExercises = async () => {
    try {
      // If it's a temporary assessment ID, generate exercises based on severity
      if (assessmentId && assessmentId.startsWith('temp-')) {
        const exercises = generateExerciseRecommendations(severity);
        setExercises(exercises);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/assessment/exercises/${assessmentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setExercises(data.exercises)
      } else {
        throw new Error("Failed to fetch exercises")
      }
    } catch (error) {
      console.error("Error fetching exercises:", error)
      // Fallback to generating exercises based on severity
      if (severity) {
        const exercises = generateExerciseRecommendations(severity);
        setExercises(exercises);
        toast({
          title: "Exercises Loaded",
          description: "Showing general exercise recommendations based on your assessment.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load exercise recommendations.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false)
    }
  }

  // Generate exercise recommendations based on severity level (same as backend)
  const generateExerciseRecommendations = (severity) => {
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
        }
      ]
    };

    return exerciseDatabase[severity] || exerciseDatabase["Moderate"];
  }

  const startExercise = (exercise) => {
    setSelectedExercise(exercise)
    // Parse duration and start timer if it's a timed exercise
    const durationMatch = exercise.duration.match(/(\d+)/)
    if (durationMatch) {
      const minutes = parseInt(durationMatch[1])
      setTimeRemaining(minutes * 60)
      setActiveTimer(exercise.id)
    }
  }

  const pauseTimer = () => {
    setActiveTimer(null)
  }

  const resumeTimer = () => {
    if (timeRemaining > 0) {
      setActiveTimer(selectedExercise.id)
    }
  }

  const resetTimer = () => {
    setActiveTimer(null)
    setTimeRemaining(0)
    if (selectedExercise) {
      const durationMatch = selectedExercise.duration.match(/(\d+)/)
      if (durationMatch) {
        const minutes = parseInt(durationMatch[1])
        setTimeRemaining(minutes * 60)
      }
    }
  }

  const markComplete = (exerciseId) => {
    setCompletedExercises(prev => new Set([...prev, exerciseId]))
    toast({
      title: "Exercise Completed!",
      description: "Well done! Regular practice will help improve your mental health.",
    })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Mindfulness": return <Leaf className="h-4 w-4" />
      case "Breathing": return <Zap className="h-4 w-4" />
      case "Physical Activity": return <Heart className="h-4 w-4" />
      case "Meditation": return <Brain className="h-4 w-4" />
      case "Crisis Management": return <Shield className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "Mindfulness": return "bg-green-100 text-green-800 border-green-200"
      case "Breathing": return "bg-blue-100 text-blue-800 border-blue-200"
      case "Physical Activity": return "bg-red-100 text-red-800 border-red-200"
      case "Meditation": return "bg-purple-100 text-purple-800 border-purple-200"
      case "Crisis Management": return "bg-orange-100 text-orange-800 border-orange-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const exercisesByCategory = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = []
    }
    acc[exercise.category].push(exercise)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Assessment Results</span>
        </Button>
      </div>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Brain className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Personalized Exercise Recommendations</h1>
        </div>
        <p className="text-gray-600">
          Based on your {severity} risk level assessment, here are exercises designed to help improve your mental health.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exercise List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue={Object.keys(exercisesByCategory)[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-auto">
              {Object.keys(exercisesByCategory).map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  <div className="flex items-center space-x-1">
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(exercisesByCategory).map(([category, categoryExercises]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                {categoryExercises.map((exercise) => (
                  <Card 
                    key={exercise.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedExercise?.id === exercise.id ? 'ring-2 ring-primary' : ''
                    } ${completedExercises.has(exercise.id) ? 'bg-green-50 border-green-200' : ''}`}
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-lg">{exercise.title}</CardTitle>
                            {completedExercises.has(exercise.id) && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <CardDescription>{exercise.description}</CardDescription>
                        </div>
                        <Badge className={getCategoryColor(exercise.category)}>
                          <div className="flex items-center space-x-1">
                            {getCategoryIcon(exercise.category)}
                            <span>{exercise.category}</span>
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{exercise.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{exercise.frequency}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            startExercise(exercise)
                          }}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start Exercise
                        </Button>
                        {!completedExercises.has(exercise.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              markComplete(exercise.id)
                            }}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Exercise Details Panel */}
        <div className="lg:col-span-1">
          {selectedExercise ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getCategoryIcon(selectedExercise.category)}
                  <span>{selectedExercise.title}</span>
                </CardTitle>
                <CardDescription>{selectedExercise.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timer */}
                {activeTimer === selectedExercise.id || timeRemaining > 0 ? (
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {formatTime(timeRemaining)}
                    </div>
                    <div className="flex justify-center space-x-2">
                      {activeTimer === selectedExercise.id ? (
                        <Button size="sm" onClick={pauseTimer}>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      ) : (
                        <Button size="sm" onClick={resumeTimer}>
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={resetTimer}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </div>
                ) : null}

                {/* Instructions */}
                <div>
                  <h4 className="font-semibold mb-2">Instructions:</h4>
                  <ol className="space-y-2 text-sm">
                    {selectedExercise.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-semibold mb-2">Benefits:</h4>
                  <ul className="space-y-1 text-sm">
                    {selectedExercise.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exercise Details */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p className="text-gray-600">{selectedExercise.duration}</p>
                    </div>
                    <div>
                      <span className="font-medium">Frequency:</span>
                      <p className="text-gray-600">{selectedExercise.frequency}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select an exercise to see detailed instructions</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Track your mental health exercise completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Exercises Completed</span>
                <span>{completedExercises.size} of {exercises.length}</span>
              </div>
              <Progress value={(completedExercises.size / exercises.length) * 100} className="h-2" />
            </div>
            <div className="text-2xl font-bold text-primary">
              {Math.round((completedExercises.size / exercises.length) * 100)}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
