"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "@/components/layout/Navbar"
import { Link } from "react-router-dom"
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
  Download,
  Share2,
  RefreshCw,
} from "lucide-react"

interface PredictionResult {
  prediction: string
  confidence: number
  severity: "Low" | "Mild" | "Moderate" | "High"
  recommendations: string[]
  riskFactors: string[]
}

interface AssessmentResultsProps {
  results: PredictionResult
  onRetake: () => void
}

export default function AssessmentResults({ results, onRetake }: AssessmentResultsProps) {
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "mild":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "moderate":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
        return <CheckCircle className="h-5 w-5" />
      case "mild":
      case "moderate":
        return <AlertTriangle className="h-5 w-5" />
      case "high":
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Brain className="h-5 w-5" />
    }
  }

  const handleSaveResults = () => {
    // TODO: Implement save to user profile
    console.log("Saving results to user profile...")
  }

  const handleShareResults = () => {
    // TODO: Implement sharing functionality
    console.log("Sharing results...")
  }

  const handleDownloadReport = () => {
    // TODO: Implement PDF download
    console.log("Downloading PDF report...")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Your Assessment Results</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Based on your responses, our AI has analyzed your mental health status and provided personalized insights.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Result Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Primary Assessment</CardTitle>
                  <Badge className={`${getSeverityColor(results.severity)} flex items-center space-x-1`}>
                    {getSeverityIcon(results.severity)}
                    <span>{results.severity} Severity</span>
                  </Badge>
                </div>
                <CardDescription>AI-powered analysis based on your responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{results.prediction}</h3>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">Confidence Level:</span>
                      <div className="flex-1 max-w-xs">
                        <Progress value={results.confidence} className="h-2" />
                      </div>
                      <span className="text-sm font-medium">{results.confidence}%</span>
                    </div>
                  </div>

                  {results.severity !== "Low" && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your results indicate some areas that may benefit from professional attention. Consider speaking
                        with a mental health professional for personalized guidance.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span>Key Areas of Concern</span>
                </CardTitle>
                <CardDescription>Factors that may be impacting your mental wellbeing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-orange-900">{factor}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Personalized Recommendations</span>
                </CardTitle>
                <CardDescription>Evidence-based strategies to improve your mental wellbeing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-green-900">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis Toggle */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
                <CardDescription>In-depth breakdown of your assessment responses</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                  className="mb-4 bg-transparent"
                >
                  {showDetailedAnalysis ? "Hide" : "Show"} Detailed Analysis
                </Button>

                {showDetailedAnalysis && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Anxiety Indicators</h4>
                        <Progress value={65} className="h-2 mb-2" />
                        <p className="text-sm text-blue-800">Moderate levels detected</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Stress Levels</h4>
                        <Progress value={78} className="h-2 mb-2" />
                        <p className="text-sm text-purple-800">Elevated stress patterns</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Coping Mechanisms</h4>
                        <Progress value={45} className="h-2 mb-2" />
                        <p className="text-sm text-green-800">Room for improvement</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-2">Social Support</h4>
                        <Progress value={60} className="h-2 mb-2" />
                        <p className="text-sm text-yellow-800">Moderate support system</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Take action based on your results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/therapists" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Find a Therapist</span>
                  </Link>
                </Button>

                <Button variant="outline" className="w-full bg-transparent" onClick={handleSaveResults}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Save to Profile
                </Button>

                <Button variant="outline" className="w-full bg-transparent" onClick={onRetake}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retake Assessment
                </Button>
              </CardContent>
            </Card>

            {/* Share & Export */}
            <Card>
              <CardHeader>
                <CardTitle>Share Results</CardTitle>
                <CardDescription>Export or share your assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent" onClick={handleDownloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>

                <Button variant="outline" className="w-full bg-transparent" onClick={handleShareResults}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share with Therapist
                </Button>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Progress Tracking</span>
                </CardTitle>
                <CardDescription>Monitor your mental health journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Wellbeing</span>
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>Last assessment: 2 weeks ago</p>
                    <p>Improvement: +10% since last time</p>
                  </div>

                  <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                    <Link to="/profile">View Full History</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Resources */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Need Immediate Help?</CardTitle>
                <CardDescription className="text-red-700">Crisis support resources</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-red-800">
                <div className="space-y-2">
                  <p>
                    <strong>Crisis Text Line:</strong> Text HOME to 741741
                  </p>
                  <p>
                    <strong>National Suicide Prevention:</strong> 988
                  </p>
                  <p>
                    <strong>Emergency:</strong> 911
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
