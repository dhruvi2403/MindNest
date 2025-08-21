import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, MapPin, MessageCircle, Phone, Brain, TrendingUp, Users, Award, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [scheduledAppointments, setScheduledAppointments] = useState([])
  const [recentAssessments, setRecentAssessments] = useState([])
  const [recommendedTherapists, setRecommendedTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    totalTherapists: 0
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  // Add visibility change listener to refresh data when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAllData()
      }
    }

    const handleFocus = () => {
      fetchAllData()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Add interval to refresh data every 30 seconds when dashboard is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchAllData()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchAllData = () => {
    fetchScheduledAppointments()
    fetchStats()
    fetchRecentAssessments()
    fetchRecommendedTherapists()
  }

  const fetchScheduledAppointments = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch('/api/appointments/client/scheduled', {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      })

      if (response.status === 401 || response.status === 403) {
        // Redirect to login if unauthorized
        window.location.href = '/login'
        return
      }

      if (response.ok) {
        const data = await response.json()
        setScheduledAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      if (error.message === "No authentication token found") {
        window.location.href = '/login'
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
        return
      }

      const response = await fetch('/api/clients/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 401 || response.status === 403) {
        // Redirect to login if unauthorized
        window.location.href = '/login'
        return
      }

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      if (error.message === "No authentication token found") {
        window.location.href = '/login'
      }
    }
  }

  const fetchRecentAssessments = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch('/api/clients/assessments/recent?limit=3', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecentAssessments(data.assessments || [])
      }
    } catch (error) {
      console.error("Error fetching recent assessments:", error)
    }
  }

  const fetchRecommendedTherapists = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch('/api/clients/therapists/recommended', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendedTherapists(data.recommendedTherapists || [])
      }
    } catch (error) {
      console.error("Error fetching recommended therapists:", error)
    }
  }

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/${action}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Appointment ${action} successfully.`,
        })
        fetchScheduledAppointments()
        fetchStats()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return timeString
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'mild':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600">Track your mental wellness journey and manage your appointments.</p>
          </div>
          <Button
            onClick={fetchAllData}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Therapists Seen</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTherapists}</div>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Scheduled Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scheduledAppointments.length > 0 ? (
              <div className="space-y-4">
                {scheduledAppointments.map((appointment) => (
                  <div key={appointment._id || appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">{appointment.therapistId?.userId?.name || appointment.therapistName || 'Unknown Therapist'}</h3>
                        <p className="text-sm text-gray-600">{appointment.type} Session</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(appointment.date)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(appointment.time)}</span>
                          </span>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600 mt-1">"{appointment.notes}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAppointmentAction(appointment._id || appointment.id, 'reschedule')}
                        >
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled appointments</h3>
                <p className="text-gray-600">You don't have any upcoming therapy sessions scheduled.</p>
                <Button className="mt-4" onClick={() => window.location.href = '/therapists'}>
                  Find a Therapist
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Assessments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Recent Assessments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAssessments.length > 0 ? (
                <div className="space-y-4">
                  {recentAssessments.map((assessment) => (
                    <div key={assessment._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getSeverityColor(assessment.result?.severity)}>
                          {assessment.result?.severity || 'Unknown'} Risk
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-medium mb-1">{assessment.result?.prediction || 'Assessment Complete'}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Confidence: {assessment.result?.confidence || 0}%
                      </p>
                      {assessment.result?.recommendations && assessment.result.recommendations.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <strong>Top Recommendation:</strong> {assessment.result.recommendations[0]}
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => window.location.href = '/assessment'}
                  >
                    Take New Assessment
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                  <p className="text-gray-600 mb-4">Take your first mental health assessment to get personalized insights.</p>
                  <Button onClick={() => window.location.href = '/assessment'}>
                    Take Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Therapists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Recommended Therapists</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendedTherapists.length > 0 ? (
                <div className="space-y-4">
                  {recommendedTherapists.slice(0, 3).map((therapist) => (
                    <div key={therapist._id} className="p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{therapist.userId?.name || therapist.name || 'Unknown Therapist'}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-600">{therapist.location}</span>
                          </div>
                          {therapist.specialization && therapist.specialization.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {therapist.specialization.slice(0, 2).map((spec, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                              {therapist.specialization.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{therapist.specialization.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => window.location.href = '/therapists'}
                  >
                    View All Therapists
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
                  <p className="text-gray-600 mb-4">Complete an assessment to get personalized therapist recommendations.</p>
                  <Button onClick={() => window.location.href = '/therapists'}>
                    Browse Therapists
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
