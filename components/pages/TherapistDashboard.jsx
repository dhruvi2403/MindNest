"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import Navbar from "@/components/layout/Navbar"
import TherapistOnboardingModal from "@/components/modals/TherapistOnboardingModal"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Award, 
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  User
} from "lucide-react"

export default function TherapistDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [therapistProfile, setTherapistProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Check if therapist needs onboarding and fetch appointments
  useEffect(() => {
    const checkTherapistProfile = async () => {
      try {
        const response = await fetch("/api/therapists/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.status === 404) {
          // No therapist profile found, show onboarding
          setShowOnboardingModal(true)
        } else if (response.ok) {
          const data = await response.json()
          setTherapistProfile(data.therapist)
        }
      } catch (error) {
        console.error("Error checking therapist profile:", error)
        setShowOnboardingModal(true)
      }
    }

    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/appointments/upcoming", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setAppointments(data.appointments || [])
        }
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    checkTherapistProfile()
    fetchAppointments()
  }, [])

  const handleOnboardingComplete = () => {
    setShowOnboardingModal(false)
    toast({
      title: "Profile Submitted!",
      description: "Your therapist profile is under review. You'll be notified once it's approved.",
    })
    window.location.reload()
  }

  const handleAppointmentStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setAppointments(prev => 
          prev.map(apt => 
            apt._id === appointmentId 
              ? { ...apt, status: newStatus }
              : apt
          )
        )
        
        toast({
          title: "Status Updated!",
          description: `Appointment status changed to ${newStatus}.`,
        })
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update appointment status.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { variant: "default", icon: Clock, text: "Scheduled" },
      completed: { variant: "default", icon: CheckCircle, text: "Completed" },
      cancelled: { variant: "destructive", icon: XCircle, text: "Cancelled" },
      rescheduled: { variant: "secondary", icon: AlertCircle, text: "Rescheduled" },
    }
    
    const config = statusConfig[status] || statusConfig.scheduled
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString) => {
    return timeString
  }

  // Mock data for stats
  const stats = {
    totalClients: 24,
    completedSessions: 156,
    averageRating: 4.8,
    monthlyEarnings: 3200
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
            <Stethoscope className="h-8 w-8 text-green-600" />
            <span>Welcome, Dr. {user?.name}!</span>
          </h1>
          <p className="text-gray-600">Manage your practice and help clients on their mental wellness journey.</p>
          
          {!therapistProfile && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                Complete your professional profile to start accepting clients and appear in therapist listings.
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">Active clients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedSessions}</div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">Out of 5.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyEarnings}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link to="/therapists">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {appointments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                <p className="text-gray-600">You don't have any scheduled sessions at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <Card key={appointment._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={appointment.clientId?.profilePicture} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {appointment.clientId?.name || "Client"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(appointment.date)} • {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {appointment.sessionType} session
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(appointment.status)}
                      
                      {appointment.status === "scheduled" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleAppointmentStatusUpdate(appointment._id, "completed")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAppointmentStatusUpdate(appointment._id, "cancelled")}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Session Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Review and update your session notes for better client tracking.
              </p>
              <Button className="w-full" variant="outline">
                Manage Notes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Client Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View client profiles and manage your client relationships.
              </p>
              <Button className="w-full" variant="outline">
                View Clients
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage your availability and schedule new appointments.
              </p>
              <Button className="w-full" variant="outline">
                Manage Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Therapist Onboarding Modal */}
      {showOnboardingModal && (
        <TherapistOnboardingModal
          isOpen={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  )
}
