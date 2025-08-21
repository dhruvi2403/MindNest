import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, MapPin, MessageCircle, Phone, Brain, TrendingUp, Users, Award, Activity } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import TherapistOnboardingModal from "@/components/modals/TherapistOnboardingModal"

export default function TherapistDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [clients, setClients] = useState([])
  const [clientAssessments, setClientAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    totalClients: 0
  })
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [therapistProfile, setTherapistProfile] = useState(null)

  useEffect(() => {
    checkTherapistOnboarding()
    fetchUpcomingAppointments()
    fetchStats()
    fetchClients()
    fetchClientAssessments()
  }, [])

  const checkTherapistOnboarding = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch('/api/therapists/ensure', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      })

      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login'
        return
      }

      if (response.ok) {
        const profile = await response.json()
        setTherapistProfile(profile)
        if (!profile.onboarded) {
          setShowOnboarding(true)
        }
      }
    } catch (error) {
      console.error("Error checking therapist onboarding:", error)
      if (error.message === "No authentication token found") {
        window.location.href = '/login'
      }
    }
  }

  const fetchUpcomingAppointments = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch('/api/appointments/therapist/upcoming', {
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
        setUpcomingAppointments(data.appointments || [])
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
      }

      const response = await fetch('/api/therapists/stats', {
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

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch('/api/therapists/clients', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchClientAssessments = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch('/api/therapists/clients/assessments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setClientAssessments(data.assessments || [])
      }
    } catch (error) {
      console.error("Error fetching client assessments:", error)
    }
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
        fetchUpcomingAppointments()
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Manage your appointments and track your practice.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">{appointment.clientName}</h3>
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
                          onClick={() => handleAppointmentAction(appointment._id || appointment.id, 'confirm')}
                          disabled={appointment.status === 'confirmed'}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAppointmentAction(appointment._id || appointment.id, 'complete')}
                          disabled={appointment.status === 'completed'}
                        >
                          Complete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                <p className="text-gray-600">You don't have any scheduled sessions at the moment.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Management and Assessments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Client List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>My Clients</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clients.length > 0 ? (
                <div className="space-y-4">
                  {clients.slice(0, 5).map((client) => (
                    <div key={client._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{client.name}</h4>
                            <p className="text-sm text-gray-600">{client.totalSessions} sessions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {client.nextSession ? (
                            <div className="text-sm">
                              <p className="text-gray-600">Next:</p>
                              <p className="font-medium">{new Date(client.nextSession).toLocaleDateString()}</p>
                            </div>
                          ) : client.lastSession ? (
                            <div className="text-sm">
                              <p className="text-gray-600">Last:</p>
                              <p className="font-medium">{new Date(client.lastSession).toLocaleDateString()}</p>
                            </div>
                          ) : (
                            <Badge variant="outline">New Client</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {clients.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      And {clients.length - 5} more clients...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                  <p className="text-gray-600">Your client list will appear here once you start accepting appointments.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Client Assessments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Recent Client Assessments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clientAssessments.length > 0 ? (
                <div className="space-y-4">
                  {clientAssessments.slice(0, 4).map((assessment) => (
                    <div key={assessment._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm">
                            {assessment.userId?.name || 'Client'}
                          </span>
                        </div>
                        <Badge className={getSeverityColor(assessment.result?.severity)}>
                          {assessment.result?.severity || 'Unknown'} Risk
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {assessment.result?.prediction || 'Assessment Complete'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Confidence: {assessment.result?.confidence || 0}%</span>
                        <span>{new Date(assessment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {clientAssessments.length > 4 && (
                    <p className="text-sm text-gray-500 text-center">
                      And {clientAssessments.length - 4} more assessments...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                  <p className="text-gray-600">Client assessment results will appear here to help you provide better care.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Therapist Onboarding Modal */}
      <TherapistOnboardingModal
        isOpen={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false)
          checkTherapistOnboarding()
        }}
      />
    </div>
  )
}
