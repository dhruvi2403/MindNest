import React, { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, MapPin, User, MessageSquare } from "lucide-react"
import PaymentModal from "./PaymentModal"

export default function AppointmentBookingModal({ isOpen, onClose, therapist, onBookingComplete }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [appointmentType, setAppointmentType] = useState("individual")
  const [notes, setNotes] = useState("")
  const [availableSlots, setAvailableSlots] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [realTimeAvailability, setRealTimeAvailability] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingBookingData, setPendingBookingData] = useState(null)

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
      if (selectedDate) {
        fetchRealTimeAvailability()
      }
    }
  }, [isOpen, therapist, selectedDate])

  // Auto-refresh availability every 30 seconds when modal is open
  useEffect(() => {
    if (isOpen && selectedDate && therapist) {
      const interval = setInterval(() => {
        fetchRealTimeAvailability()
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [isOpen, selectedDate, therapist])

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

  const fetchRealTimeAvailability = async () => {
    if (!selectedDate || !therapist) return

    setAvailabilityLoading(true)
    try {
      const response = await fetch(`/api/appointments/availability/${therapist.id}/${selectedDate}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRealTimeAvailability(data)
        setAvailableSlots(data.availableSlots || [])
        setBookedSlots(data.bookedSlots || [])
      }
    } catch (error) {
      console.error("Error fetching real-time availability:", error)
      toast({
        title: "Availability Check Failed",
        description: "Unable to check current availability. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAvailabilityLoading(false)
    }
  }

  const getTimeSlotStatus = (time) => {
    if (bookedSlots.includes(time)) {
      return 'booked'
    }
    if (availableSlots.includes(time)) {
      return 'available'
    }
    return 'unavailable'
  }

  const getTimeSlotColor = (time) => {
    const status = getTimeSlotStatus(time)
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
      case 'booked':
        return 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed'
      case 'unavailable':
        return 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'
      default:
        return 'bg-gray-100 text-gray-500 border-gray-300'
    }
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

    // Check if selected time is still available
    if (getTimeSlotStatus(selectedTime) !== 'available') {
      toast({
        title: "Time Slot No Longer Available",
        description: "This time slot has been taken by another client. Please select a different time.",
        variant: "destructive",
      })
      // Refresh availability
      fetchRealTimeAvailability()
      return
    }

    setLoading(true)

    try {
      // Final availability check before booking
      await fetchRealTimeAvailability()

      if (!availableSlots.includes(selectedTime)) {
        throw new Error("This time slot is no longer available. Please select a different time.")
      }

      // Prepare booking data for payment
      const bookingData = {
        therapistId: therapist.id,
        therapistName: therapist.name,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        notes: notes.trim() || undefined,
      }

      setPendingBookingData(bookingData)
      setShowPaymentModal(true)
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

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Now actually book the appointment with payment info
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...pendingBookingData,
          paymentId: paymentData.paymentId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          paymentStatus: "paid"
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to book appointment")
      }

      const data = await response.json()

      toast({
        title: "Appointment Confirmed! 🎉",
        description: `Your appointment with ${therapist.name} has been booked and paid for ${selectedDate} at ${selectedTime}.`,
      })

      onBookingComplete(data.appointment)
      onClose()
    } catch (error) {
      console.error("Final booking error:", error)
      toast({
        title: "Booking Error",
        description: error.message || "Failed to complete booking after payment. Please contact support.",
        variant: "destructive",
      })
    }
  }



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Book Appointment</h2>
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Schedule a session with {therapist?.name}
          </DialogDescription>
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
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Select Time *</Label>
                {availabilityLoading && (
                  <span className="text-xs text-gray-500">Checking availability...</span>
                )}
              </div>

              {selectedDate ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => {
                      const status = getTimeSlotStatus(time)
                      const isSelected = selectedTime === time
                      const isClickable = status === 'available'

                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => isClickable && setSelectedTime(time)}
                          disabled={!isClickable}
                          className={`
                            p-2 text-xs rounded-md border transition-all
                            ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}
                            ${getTimeSlotColor(time)}
                          `}
                        >
                          <div className="font-medium">{time}</div>
                          <div className="text-xs opacity-75">
                            {status === 'available' && 'Available'}
                            {status === 'booked' && 'Booked'}
                            {status === 'unavailable' && 'N/A'}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                      <span>Booked</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                      <span>Unavailable</span>
                    </div>
                  </div>

                  {realTimeAvailability && !realTimeAvailability.available && (
                    <p className="text-xs text-red-500 text-center">
                      {realTimeAvailability.reason || 'No available time slots for this date.'}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Please select a date first to see available time slots
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
            <Button type="submit" disabled={loading || availableSlots.length === 0}>
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        appointmentDetails={pendingBookingData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Dialog>
  )
}
