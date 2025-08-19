import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { useToast } from "../../src/hooks/use-toast"
import { Stethoscope, GraduationCap, MapPin, Clock } from "lucide-react"

export default function TherapistOnboardingModal({ isOpen, onComplete }) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    specialization: [],
    bio: "",
    location: "",
    availability: [],
    licenseNumber: "",
    education: "",
    yearsOfPractice: "",
  })

  const specializations = [
    "Anxiety Disorders",
    "Depression",
    "Trauma & PTSD",
    "Relationship Issues",
    "Addiction",
    "Eating Disorders",
    "OCD",
    "Bipolar Disorder",
    "Grief & Loss",
    "Stress Management",
    "Career Counseling",
    "Family Therapy",
    "Child & Adolescent",
    "Couples Therapy",
    "Group Therapy",
  ]

  const availabilityOptions = [
    "Monday",
    "Tuesday", 
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpecializationChange = (specialization) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(specialization)
        ? prev.specialization.filter(s => s !== specialization)
        : [...prev.specialization, specialization]
    }))
  }

  const handleAvailabilityChange = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }))
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.specialization.length > 0 && formData.bio.trim() !== ""
      case 2:
        return formData.location.trim() !== "" && formData.availability.length > 0
      case 3:
        return formData.licenseNumber.trim() !== "" && formData.education.trim() !== "" && formData.yearsOfPractice !== ""
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    } else {
      toast({
        title: "Please complete all required fields",
        description: "All fields marked with * are required to continue.",
        variant: "destructive",
      })
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Please complete all required fields",
        description: "All fields marked with * are required to continue.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Submit therapist profile data
      const response = await fetch("/api/therapists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create therapist profile")
      }

      toast({
        title: "Profile Created Successfully!",
        description: "Your therapist profile has been created and is now active.",
      })

      onComplete()
    } catch (error) {
      console.error("Error creating therapist profile:", error)
      toast({
        title: "Profile Creation Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex items-center space-x-3 p-6 border-b">
          <Stethoscope className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Complete Your Therapist Profile</h2>
            <p className="text-sm text-gray-600">Step {currentStep} of 3</p>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full ${
                  step <= currentStep ? "bg-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 pb-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Professional Information</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tell us about your professional background and expertise.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    Specializations * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">Select all that apply to your practice</p>
                  <div className="grid grid-cols-2 gap-3">
                    {specializations.map((spec) => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox
                          id={spec}
                          checked={formData.specialization.includes(spec)}
                          onCheckedChange={() => handleSpecializationChange(spec)}
                        />
                        <Label htmlFor={spec} className="text-sm cursor-pointer">
                          {spec}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm font-medium">
                    Professional Bio * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">Describe your approach and experience</p>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your therapeutic approach, experience, and how you help clients..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Location & Availability</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Set your practice location and available days.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium">
                    Practice Location * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">City, State or Country where you practice</p>
                  <Input
                    id="location"
                    placeholder="e.g., New York, NY or London, UK"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Available Days * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">Select the days you're available for sessions</p>
                  <div className="grid grid-cols-2 gap-3">
                    {availabilityOptions.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={formData.availability.includes(day)}
                          onCheckedChange={() => handleAvailabilityChange(day)}
                        />
                        <Label htmlFor={day} className="text-sm cursor-pointer">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Credentials & Experience</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Verify your professional qualifications and experience.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="licenseNumber" className="text-sm font-medium">
                    License Number * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">Your professional license number</p>
                  <Input
                    id="licenseNumber"
                    placeholder="e.g., LCSW12345"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="education" className="text-sm font-medium">
                    Education * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">Your highest degree and institution</p>
                  <Input
                    id="education"
                    placeholder="e.g., Master's in Social Work, NYU"
                    value={formData.education}
                    onChange={(e) => handleInputChange("education", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="yearsOfPractice" className="text-sm font-medium">
                    Years of Practice * <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">How long you've been practicing</p>
                  <Select
                    value={formData.yearsOfPractice}
                    onValueChange={(value) => handleInputChange("yearsOfPractice", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select years of practice" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, "20+"].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year === "20+" ? "20+ years" : `${year} year${year === 1 ? "" : "s"}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit Profile"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
