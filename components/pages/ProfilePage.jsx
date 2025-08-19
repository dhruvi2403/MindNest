"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
// import Navbar from "@/components/layout/Navbar"
import {
  User,
  TrendingUp,
  FileText,
  Settings,
  Camera,
  Save,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [assessments, setAssessments] = useState([])
  const [assessmentsLoading, setAssessmentsLoading] = useState(true)

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    profilePicture: user?.profilePicture || "",
  })

  useEffect(() => {
    fetchAssessmentHistory()
  }, [])

  const fetchAssessmentHistory = async () => {
    try {
      const response = await fetch("/api/assessment", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAssessments(data.assessments)
      }
    } catch (error) {
      // Mock assessment history for demo
      const mockAssessments = [
        {
          id: "1",
          result: {
            prediction: "Mild Anxiety with Stress Indicators",
            severity: "Mild",
            confidence: 78,
            recommendations: [
              "Practice deep breathing exercises daily",
              "Establish a regular sleep schedule",
              "Consider talking to a counselor",
            ],
            riskFactors: ["Mild stress response patterns", "Occasional anxiety in social situations"],
          },
          createdAt: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          result: {
            prediction: "Low Risk - Good Mental Health",
            severity: "Low",
            confidence: 85,
            recommendations: [
              "Continue maintaining healthy habits",
              "Regular exercise and social connections",
              "Consider mindfulness practices",
            ],
            riskFactors: ["No significant risk factors identified"],
          },
          createdAt: "2024-01-08T14:20:00Z",
        },
        {
          id: "3",
          result: {
            prediction: "Moderate Anxiety and Depression Symptoms",
            severity: "Moderate",
            confidence: 72,
            recommendations: [
              "Strongly consider professional counseling",
              "Practice mindfulness techniques",
              "Maintain social connections",
            ],
            riskFactors: [
              "Elevated anxiety levels",
              "Depressive symptoms impacting motivation",
              "Sleep pattern disruptions",
            ],
          },
          createdAt: "2024-01-01T09:15:00Z",
        },
      ]
      setAssessments(mockAssessments)
    } finally {
      setAssessmentsLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile(profileData)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    })
  }

  const downloadAssessmentReport = (assessment) => {
    toast({
      title: "Download Started",
      description: "Your assessment report is being prepared for download.",
    })
  }

  const getSeverityColor = (severity) => {
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

  const getWellnessScore = () => {
    if (assessments.length === 0) return 75

    const latestAssessment = assessments[0]
    const severityScores = { Low: 90, Mild: 70, Moderate: 50, High: 30 }
    return severityScores[latestAssessment.result.severity] || 75
  }

  const getProgressTrend = () => {
    if (assessments.length < 2) return 0

    const latest = assessments[0]
    const previous = assessments[1]
    const severityScores = { Low: 4, Mild: 3, Moderate: 2, High: 1 }

    const latestScore = severityScores[latest.result.severity]
    const previousScore = severityScores[previous.result.severity]

    return ((latestScore - previousScore) / previousScore) * 100
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and view your mental health journey.</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <img
                    src={profileData.profilePicture || "/placeholder.svg?height=96&width=96&query=user-avatar"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-white"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl">{user?.name}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Wellness Score</span>
                      <span className="text-sm text-muted-foreground">{getWellnessScore()}%</span>
                    </div>
                    <Progress value={getWellnessScore()} className="h-2" />
                  </div>

                  <div className="text-center pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-lg">{assessments.length}</div>
                        <div className="text-muted-foreground">Assessments</div>
                      </div>
                      <div>
                        <div className="font-semibold text-lg">
                          {getProgressTrend() > 0 ? "+" : ""}
                          {getProgressTrend().toFixed(0)}%
                        </div>
                        <div className="text-muted-foreground">Progress</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recent Assessment */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Latest Assessment</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {assessments.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge className={getSeverityColor(assessments[0].result.severity)}>
                              {assessments[0].result.severity} Severity
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(assessments[0].createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{assessments[0].result.prediction}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Confidence:</span>
                            <Progress value={assessments[0].result.confidence} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{assessments[0].result.confidence}%</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No assessments taken yet.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Progress Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Progress Trend</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Progress visualization coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Recommendations</CardTitle>
                    <CardDescription>Based on your latest assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {assessments.length > 0 ? (
                      <div className="space-y-3">
                        {assessments[0].result.recommendations.slice(0, 3).map((recommendation, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-900">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Take an assessment to get personalized recommendations.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Assessments Tab */}
              <TabsContent value="assessments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment History</CardTitle>
                    <CardDescription>View and download your past mental health assessments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {assessmentsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : assessments.length > 0 ? (
                      <div className="space-y-4">
                        {assessments.map((assessment) => (
                          <Card key={assessment.id} className="border-l-4 border-l-primary">
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-3">
                                    <Badge className={getSeverityColor(assessment.result.severity)}>
                                      {assessment.result.severity}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(assessment.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <h4 className="font-medium">{assessment.result.prediction}</h4>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">Confidence:</span>
                                    <Progress value={assessment.result.confidence} className="w-24 h-2" />
                                    <span className="text-sm">{assessment.result.confidence}%</span>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadAssessmentReport(assessment)}
                                  className="bg-transparent"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                        <p className="text-gray-600 mb-4">Take your first mental health assessment to get started.</p>
                        <Button>Take Assessment</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Profile Settings</span>
                    </CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="profilePicture">Profile Picture URL</Label>
                        <Input
                          id="profilePicture"
                          value={profileData.profilePicture}
                          onChange={(e) => setProfileData({ ...profileData, profilePicture: e.target.value })}
                          placeholder="https://example.com/your-photo.jpg"
                        />
                      </div>

                      <Button type="submit" disabled={loading} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Account Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                        <p className="text-sm">January 1, 2024</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                        <p className="text-sm">Today at 2:30 PM</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Data Privacy</Label>
                        <Badge variant="secondary" className="text-xs">
                          Encrypted
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-800">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions for your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Deleting your account will permanently remove all your data, including assessment history and
                        profile information. This action cannot be undone.
                      </AlertDescription>
                    </Alert>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
