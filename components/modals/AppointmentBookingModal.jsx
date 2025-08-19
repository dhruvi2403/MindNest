import React, { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { useToast } from "../../src/hooks/use-toast"
import { Calendar, Clock, MapPin, User, MessageSquare } from "lucide-react"

export default function AppointmentBookingModal({ isOpen, onClose, therapist, onBookingComplete }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [appointmentType, setAppointmentType] = useState("individual")
  const [notes, setNotes] = useState("")
  const [availableSlots, setAvailableSlots] = useState([])
  const [existingAppointments, setExistingAppointments] = useState([])

  const appointmentTypes = [
    { value: "individual", label: "Individual Session" },
    { value: "couples", label: "Couples Therapy" },
    { value: "family", label: "Family Therapy" },
    { value: "group", label: "Group Session" },
  ]

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ]

  useEffect(() => {
    if (isOpen && therapist) {
      fetchAvailableSlots()
      fetchExistingAppointments()
    }
  }, [isOpen, therapist, selectedDate])

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`/api/therapists/${therapist.id}/availability`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.availableSlots || [])
      }
    } catch (error) {
      console.error("Error fetching available slots:", error)
    }
  }

  const fetchExistingAppointments = async () => {
    try {
      const response = await fetch(`/api/appointments/therapist/${therapist.id}?date=${selectedDate}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setExistingAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error("Error fetching existing appointments:", error)
    }
  }

  const getAvailableTimeSlots = () => {
    if (!selectedDate || !therapist) return []
    
    // Filter out times that are not in therapist's availability
    const therapistAvailableDays = therapist.availability || []
    const selectedDay = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })
    
    if (!therapistAvailableDays.includes(selectedDay)) {
      return []
    }

    // Filter out times that conflict with existing appointments
    const bookedTimes = existingAppointments.map(apt => apt.time)
    return timeSlots.filter(time => !bookedTimes.includes(time))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime || !appointmentType) {
      toast({
        title: "Missing Information",
        description: "Please select a date, time, and appointment type.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          therapistId: therapist.id,
          date: selectedDate,
          time: selectedTime,
          type: appointmentType,
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to book appointment")
      }

      const data = await response.json()
      
      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${therapist.name} has been scheduled for ${selectedDate} at ${selectedTime}.`,
      })

      onBookingComplete(data.appointment)
      onClose()
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Booking Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const availableTimeSlots = getAvailableTimeSlots()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Book Appointment</h2>
              <p className="text-sm text-gray-600">Schedule a session with {therapist?.name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Therapist Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Therapist Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={therapist?.profileImage || "/placeholder.svg"}
                  alt={therapist?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium">{therapist?.name}</h3>
                  <p className="text-sm text-gray-600">{therapist?.specialization?.join(", ")}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{therapist?.location}</span>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Appointment Details</h3>
            
            {/* Date Selection */}
            <div>
              <Label htmlFor="date" className="text-sm font-medium">
                Select Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              {selectedDate && therapist?.availability && (
                <p className="text-xs text-gray-500 mt-1">
                  Available: {therapist.availability.join(", ")}
                </p>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <Label htmlFor="time" className="text-sm font-medium">
                Select Time *
              </Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No available slots for this date
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {selectedDate && availableTimeSlots.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No available time slots for this date. Please select a different date.
                </p>
              )}
            </div>

            {/* Appointment Type */}
            <div>
              <Label htmlFor="type" className="text-sm font-medium">
                Session Type *
              </Label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Any specific concerns or topics you'd like to discuss..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || availableTimeSlots.length === 0}>
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
